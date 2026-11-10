import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { SMTPServer } from "smtp-server";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../dist/src/generated/prisma/client.js");
const { createSchema } = require("../dist/src/schema.js");

const origin = "http://localhost:3100";
const api = "http://127.0.0.1:5051";
const password = "development-only password 1";
const resetPassword = "development-only password 2";

async function waitFor(check) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await check();
    if (result) return result;
    await delay(100);
  }
  throw new Error("The local test service did not respond in time");
}

function session() {
  let cookie = "";
  return {
    get cookie() { return cookie; },
    async query(query, variables) {
      const response = await fetch(api + "/graphql", {
        method: "POST",
        headers: { "content-type": "application/json", origin, ...(cookie && { cookie }) },
        body: JSON.stringify({ query, variables }),
      });
      assert.equal(response.status, 200);
      const setCookie = response.headers.getSetCookie().at(-1);
      if (setCookie) {
        assert.match(setCookie, /HttpOnly/i);
        assert.match(setCookie, /SameSite=Lax/i);
        cookie = setCookie.split(";", 1)[0];
      }
      const { data, errors } = await response.json();
      assert.equal(errors, undefined, JSON.stringify(errors));
      return data;
    },
  };
}

const register = `mutation($name: String!, $email: String!, $password: String!) {
  registerUser(firstName: "Test", lastName: "Listener", username: $name, email: $email, password: $password) {
    user { id email } errors { field message }
  }
}`;
const login = `mutation($email: String!, $password: String!) {
  loginUser(email: $email, password: $password) { user { id } errors { field } }
}`;
const create = `mutation($title: String!, $genre: String!) {
  createPost(albumName: "Test song", artistName: "Test artist", rating: 3.5, title: $title,
    genre: $genre, genres: [$genre], albumImage: "") { id createdAt rating author { username } }
}`;
const filter = `query($genre: String!, $cursor: DateTimeISO, $cursorId: Int) {
  filterPosts(limit: 1, genres: [$genre], cursor: $cursor, cursorId: $cursorId) { posts { id createdAt } hasMore }
}`;
const update = `mutation($id: Int!) { updatePost(id: $id, rating: 4.5) { id rating } }`;
const remove = `mutation($id: Int!) { deletePost(id: $id) }`;
const resetRequest = `mutation($email: String!) { forgotPassword(email: $email) }`;
const reset = `mutation($token: String!, $password: String!) {
  changePassword(token: $token, password: $password) { user { id } errors { field } }
}`;

test("only the private account type has an email field", async () => {
  const schema = await createSchema();
  const fields = Object.keys(schema.getType("PublicUser").getFields());
  assert.ok(fields.includes("username"));
  assert.ok(!fields.includes("email"));
  assert.ok(!Object.keys(schema.getType("User").getFields()).includes("password"));
});

test("registration, login, posts, password reset and logout work with PostgreSQL", { timeout: 30_000 }, async (t) => {
  const env = { ...process.env, HOST: "127.0.0.1", PORT: "5051", NODE_ENV: "test", CLIENT_ORIGIN: origin };
  const database = new URL(env.DATABASE_URL);
  const redis = new URL(env.REDIS_URL);
  assert.ok(["postgresql:", "postgres:"].includes(database.protocol), "Tests require PostgreSQL");
  assert.equal(database.hostname, "127.0.0.1", "Tests require a local database");
  assert.equal(redis.hostname, "127.0.0.1", "Tests require a local Redis service");
  redis.pathname = "/9";
  env.REDIS_URL = redis.href;

  const inbox = new Map();
  const smtp = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS"],
    disableReverseLookup: true,
    onData(stream, session, done) {
      let message = "";
      stream.setEncoding("utf8");
      stream.on("data", (chunk) => { message += chunk; });
      stream.once("error", done);
      stream.on("end", () => {
        for (const recipient of session.envelope.rcptTo) inbox.set(recipient.address, message);
        done();
      });
    },
  });
  const listening = once(smtp.server, "listening");
  smtp.listen(0, "127.0.0.1");
  await listening;
  t.after(() => new Promise((resolve) => smtp.close(resolve)));
  Object.assign(env, {
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(smtp.server.address().port),
    SMTP_FROM: "test@example.test",
    SMTP_SECURE: "false",
    SMTP_USER: "",
    SMTP_PASSWORD: "",
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: database.href }) });
  const child = spawn(process.execPath, ["dist/src/index.js"], { env, stdio: ["ignore", "pipe", "pipe"] });
  const exited = once(child, "exit");
  let serverOutput = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", (data) => { serverOutput += data; });

  const id = randomUUID().slice(0, 8);
  const name = `Lístener-${id}`;
  const email = `listener-${id}@example.test`;
  const mixedCaseEmail = ` ${email.toUpperCase()} `;
  const otherEmail = `second-${email}`;
  const duplicateNameEmail = `duplicate-${email}`;
  const genre = `genre-${id}`;
  t.after(async () => {
    child.kill();
    await exited;
    try {
      await prisma.user.deleteMany({ where: { email: { in: [email, otherEmail, duplicateNameEmail] } } });
    } finally {
      await prisma.$disconnect();
    }
  });
  await waitFor(() => {
    if (child.exitCode !== null) throw new Error(serverOutput);
    return serverOutput.includes("API listening");
  });

  const alice = session();
  const bob = session();
  const visitor = session();
  const registered = (await alice.query(register, { name, email: mixedCaseEmail, password })).registerUser;
  assert.equal(registered.errors, null);
  assert.equal(registered.user.email, email);
  const account = await prisma.user.findUnique({ where: { email: email.toUpperCase() }, select: { id: true } });
  assert.equal(account?.id, Number(registered.user.id));
  assert.ok(alice.cookie.startsWith("im-listening="));
  assert.equal((await bob.query(register, { name: `second-${name}`, email: otherEmail, password })).registerUser.user.email, otherEmail);
  assert.equal((await visitor.query("{ getCurrentUser { id } }")).getCurrentUser, null);

  const duplicateEmail = (await visitor.query(register, {
    name: `another-${name}`, email, password,
  })).registerUser;
  assert.equal(duplicateEmail.errors[0].field, "email");
  const duplicateName = (await visitor.query(register, {
    name: `LISTENER-${id.toUpperCase()}`, email: duplicateNameEmail, password,
  })).registerUser;
  assert.equal(duplicateName.errors[0].field, "username");

  const oldCookie = alice.cookie;
  assert.equal((await alice.query(login, { email: mixedCaseEmail, password })).loginUser.user.id, registered.user.id);
  assert.notEqual(alice.cookie, oldCookie, "Login issues a new session ID");

  const first = (await alice.query(create, { title: "First review", genre })).createPost;
  const second = (await alice.query(create, { title: "Second review", genre })).createPost;
  assert.equal(first.rating, 3.5);
  assert.equal(first.author.username, name);
  // Simulate two reviews landing at the same database timestamp.
  await prisma.post.update({ where: { id: Number(first.id) }, data: { createdAt: second.createdAt } });
  const page = (await visitor.query(filter, { genre: genre.toUpperCase() })).filterPosts;
  assert.equal(page.hasMore, true);
  assert.equal(page.posts[0].id, second.id);
  const next = (await visitor.query(filter, { genre, cursor: second.createdAt, cursorId: Number(second.id) })).filterPosts;
  assert.equal(next.posts[0].id, first.id);
  assert.equal(next.hasMore, false);
  assert.equal((await bob.query(update, { id: Number(first.id) })).updatePost, null);
  assert.equal((await alice.query(update, { id: Number(first.id) })).updatePost.rating, 4.5);
  assert.equal((await alice.query(remove, { id: Number(first.id) })).deletePost, true);
  assert.equal((await visitor.query("query($id: Int!) { getPost(id: $id) { id } }", { id: Number(first.id) })).getPost, null);

  const root = await fetch(api + "/");
  assert.deepEqual(await root.json(), { status: "ok" });
  assert.equal((await visitor.query(resetRequest, { email: `unknown-${email}` })).forgotPassword, true);
  assert.equal((await visitor.query(resetRequest, { email: mixedCaseEmail })).forgotPassword, true);
  const message = await waitFor(() => inbox.get(email));
  const mail = message.replace(/=\r?\n/g, "");
  const link = mail.match(/http:\/\/localhost:3100\/change-password\/([\w-]{43})/);
  assert.ok(link, "Password reset email links to the web app");
  const token = link[1];

  assert.equal((await visitor.query(reset, { token, password: resetPassword })).changePassword.user.id, registered.user.id);
  assert.equal((await alice.query("{ getCurrentUser { id } }")).getCurrentUser, null, "Password changes invalidate existing sessions");
  assert.equal((await visitor.query(reset, { token, password: resetPassword })).changePassword.errors[0].field, "token");
  assert.equal((await visitor.query("mutation { logoutUser }")).logoutUser, true);
  assert.equal((await visitor.query("{ getCurrentUser { id } }")).getCurrentUser, null);
  assert.equal((await visitor.query(login, { email, password: resetPassword })).loginUser.user.id, registered.user.id);
});
