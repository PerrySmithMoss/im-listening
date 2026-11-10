<div align="center">
<h1>I'm Listening</h1>
<p>A platform where users can share what music they're listening to.</p>

![tech_stack](https://user-images.githubusercontent.com/59027997/121856561-858eab80-ccec-11eb-9518-fdc165223401.png)
</div>

## Run locally

Use Node.js 26.13.0 (see [`.nvmrc`](.nvmrc)), npm 11, and Docker Compose.

```sh
./scripts/setup-local.sh
docker compose up -d --wait
npm ci --prefix server
npm ci --prefix client
npm run db:migrate --prefix server
npm run build --prefix server
```

In separate terminals, run `npm run dev --prefix server` and `npm run dev --prefix client`.
Open [the web app](http://localhost:3100). The API is at
[port 5050](http://localhost:5050/healthz). Compose starts PostgreSQL 17 and Redis on
loopback ports 5433 and 6380, respectively. Use `docker compose down` to stop
the services and keep your local data.

The setup script creates ignored env files without overwriting existing ones and generates
a random session secret. If your existing `server/.env` still points to MySQL, replace
its `DATABASE_URL` with the PostgreSQL value from [server/.env.example](server/.env.example)
before running the migration. Compose creates a fresh PostgreSQL data volume.

See [client/.env.example](client/.env.example) for frontend configuration. Set `SPOTIFY_CLIENT_ID` and
`SPOTIFY_CLIENT_SECRET` in **server/.env** to enable Spotify search. You can still share
songs by entering their details manually. Audio previews appear when Spotify supplies one.

## Password reset email

To enable delivery, uncomment the Resend block in `server/.env` and restart the API.
Set `SMTP_PASSWORD` to a Resend API key with sending access and `SMTP_FROM` to an
address on a verified domain. The block uses TLS on port 465. The
`onboarding@resend.dev` sender works for testing with the email address on your
Resend account. [Resend SMTP setup](https://resend.com/changelog/smtp-service) ·
[Sender requirements](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)

Email delivery is optional in local development. Production uses a Resend key mounted as a Docker secret.

## Verify changes

With Compose running and the server built:

```sh
npm test --prefix server
npm run gen --prefix client
npm run lint --prefix client
npm run build --prefix client
npm audit --prefix server
npm audit --prefix client
```

The API tests start their own server on port 5051, use Redis database 9, and clean up
their PostgreSQL accounts and posts. They capture reset emails on a temporary local SMTP
listener, so CI needs no Resend credentials. GraphQL code generation reads the built server schema
locally; it needs neither a running API nor external credentials. Commit the generated
client file when you change the schema or operations.

GraphQL stays on 16 to match Apollo Server's peer dependency, TypeScript stays on 6
to match the ESLint parser, and Prisma stays on the stable 7 series. The npm overrides
pin patched versions of `graphql-scalars` and `minimatch` until their callers update.

## Production deployment

See the [VPS deployment runbook](docs/deploy-vps.md) for database provisioning,
secret rotation, releases and the Vercel proxy configuration.

<div>
<h2>Features</h2>
<ul>
  <li>Login / Registration / Logout</li>
  <li>Session authentication</li>
  <li>CRUD functionality</li>
  <li>Forgot password</li>
  <li>Responsive Design</li>
</ul>
</div>
<div>
<h2>Technologies</h2>
<ul>
  <li>TypeScript</li>
  <li>Next.js, React.js, Apollo client</li>
  <li>Node.js, Apollo server, Express</li>
  <li>GraphQL</li>
  <li>Redis</li>
  <li>PostgreSQL</li>
  <li>Prisma ORM</li>
  <li>TailwindCSS</li>
</ul>
</div>

<div>
<h2>Todo</h2>
<ul>
  <li>Add user profile page where they can view/edit their posts</li>
  <li>Ability for user's to change their avatar</li>
  <li>Create an explore where users can explore new music that they might be into</li>
  <li>Create popular page where users can view the most popular music</li>
  <li>Create pages for artists, albums and genres</li>
</ul>
</div>

<h2>Video Demo</h2>

[![Watch the video](https://user-images.githubusercontent.com/59027997/206213869-9735509d-09b7-4778-aceb-5ded62af6453.png)](https://user-images.githubusercontent.com/59027997/206225604-5ca7b2a7-5048-4a1e-84e5-65ed4173eb3e.mp4)
</div>

<h2>Images</h2>

![home_desktop](https://user-images.githubusercontent.com/59027997/206213869-9735509d-09b7-4778-aceb-5ded62af6453.png)

![home_mobile](https://user-images.githubusercontent.com/59027997/206214042-c107f225-9dfa-4947-bae5-6a73719e8ec2.png)

![find_song](https://user-images.githubusercontent.com/59027997/206214362-e9ba735d-0cae-4032-ab46-46089d4c8d89.png)

![post_song](https://user-images.githubusercontent.com/59027997/206214563-523cc7a3-a608-4552-825a-cda73699dc57.png)
</div>

</div>

