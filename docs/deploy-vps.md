# Deploy the API to the VPS

The `im-listening` stack runs the API and a private, password-protected Redis
instance. Traefik serves `https://im-listening-api.perrysmithmoss.com`. The API
uses the shared PostgreSQL service over TLS and owns only its `im_listening`
database. Redis stores sessions in the stack's `redis-data` volume. Spotify is
optional and is disabled in this stack. Manual song entry remains available.

## Provision PostgreSQL and Swarm secrets

From the VPS administrator SSH session, run these SQL commands as the shared
PostgreSQL administrator. Use the existing `perry-infra_postgres` container and
read its administrator username from `$POSTGRES_USER_FILE` inside the container.

```sql
CREATE ROLE im_listening LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 20;
CREATE DATABASE im_listening OWNER im_listening;
REVOKE ALL ON DATABASE im_listening FROM PUBLIC;
\connect im_listening
REVOKE ALL ON SCHEMA public FROM PUBLIC;
\password im_listening
```

Use a random hex password (`openssl rand -hex 32`). Verify that the shared
PostgreSQL certificate covers `postgres` and create the external Swarm config
`im_listening_postgres_ca_v1` from the reviewed `perry-infra/postgres/tls/ca.crt`
with `docker config create im_listening_postgres_ca_v1 - < ca.crt`.

Create the following external secrets on the VPS by piping each value to
`docker secret create NAME -`. Use a shell with tracing off and keep secret
values out of command history, process arguments, files in the repo and CI.

| Swarm secret | Value | Service |
| --- | --- | --- |
| `im_listening_database_url_v1` | `postgresql://im_listening:<password>@postgres:5432/im_listening` | API |
| `im_listening_session_secret_v1` | Random hex from `openssl rand -hex 32` | API |
| `im_listening_resend_key_v1` | Resend key with sending access for `imlistening-mail.perrysmithmoss.com` | API |
| `im_listening_google_oauth_v1` | Production OAuth client secret from [Google Cloud setup](#google-cloud) | API |
| `im_listening_redis_url_v1` | `redis://:<password>@redis:6379` | API |
| `im_listening_redis_config_v1` | `requirepass <password>` with a final newline | Redis |

Generate a separate hex password for Redis and use it in both Redis secrets.
The stack sends from `password-reset@imlistening-mail.perrysmithmoss.com` over
TLS on port 465. The mailer displays **I'm Listening** as the sender name.

## Bootstrap the stack and restricted release account

Use a reviewed `linux/amd64` release image from the GitHub workflow's publish
summary. Allow the VPS broker to pull the GHCR package. The other portfolio
apps use publicly pullable images. An administrator can also configure a
package read credential in the broker's root-owned Docker configuration.

From the administrator SSH session, with the reviewed stack file and OAuth
credentials ready:

```sh
export API_IMAGE=ghcr.io/perrysmithmoss/im-listening-api@sha256:<digest>
export GOOGLE_CLIENT_ID='<production Google OAuth client ID>'
docker pull "$API_IMAGE"
docker stack deploy --compose-file docker-stack.yaml im-listening
docker stack services im-listening
curl --fail --silent --show-error https://im-listening-api.perrysmithmoss.com/healthz
```

Replace the placeholders before running the commands. The API container runs `prisma
migrate deploy` before listening on every release. To apply a reviewed image's
migrations separately, run it as a one-off Swarm job on the database overlay:

```sh
docker service create --name im-listening-migrate --mode replicated-job \
  --network portfolio_network \
  --secret source=im_listening_database_url_v1,target=database_url,uid=1000,mode=0400 \
  --config source=im_listening_postgres_ca_v1,target=/etc/im-listening/postgres-ca.crt \
  --env DATABASE_URL_FILE=/run/secrets/database_url \
  --env DATABASE_CA_FILE=/etc/im-listening/postgres-ca.crt \
  "$API_IMAGE" migrate
docker service logs im-listening-migrate
docker service ps im-listening-migrate
# Remove the job after its task completes successfully.
docker service rm im-listening-migrate
```

Keep migrations compatible with the preceding release during rolling updates.
An image rollback leaves applied migrations in place.

Install the `im-listening-release` account using the reviewed `perry-infra`
portfolio broker and its installer. Review the service spec before recording
policy. The account is restricted to updating `im-listening_api` to a digest
from `ghcr.io/perrysmithmoss/im-listening-api`. Follow the portfolio runbook for
reviewing an updated broker binary, installing the public key and verifying SSH
restrictions. On a host with an existing broker, back up its root-owned binary
and atomically replace it with the reviewed build that includes Im Listening
before running `sudo sh ./install.sh im-listening ./portfolio-release ./im-listening-release.pub`.
Store the matching private key as `APP_RELEASE_KEY` in the
`VPS Production` GitHub environment. Restrict the environment to `master`, and
set its variables `VPS_HOST` and `VPS_KNOWN_HOSTS` using the pinned SSH host key.
The initial workflow can publish the image before the stack and account exist.
After bootstrap, dispatch the workflow with that digest and commit SHA to
verify the restricted path. Use those same fields to redeploy a known good
release. The workflow sends no stack manifest or application secrets to the VPS.

## Configure Vercel and verify

Use Node 26.x in the Vercel project with root directory `client`. Vercel
manages patch updates within Node 26. The repo and API image use Node 26.13.0.
In the Production environment set these variables.

```dotenv
NEXT_PUBLIC_GRAPHQL_API_URL=/api/graphql
GRAPHQL_INTERNAL_URL=https://im-listening-api.perrysmithmoss.com/graphql
```

Build and promote the frontend. The Next.js rewrites send `/api/graphql`,
`/api/spotify/*` and `/api/auth/google/*` to the VPS. GraphQL server rendering uses the absolute URL.
The browser sees a same-origin API and can send the secure, host-only
`__Host-im-listening` cookie. Keep `CLIENT_ORIGIN` in the stack aligned with
`https://im-listening.vercel.app` so the API accepts requests from the live site
and reset emails link back to the live frontend.

Check `/healthz` on the API. On the live frontend, log in using the controlled
`imlistening.emails@gmail.com` test account, reload and confirm the session
persists. Request a password reset and confirm the message arrives and links to
the live frontend. Confirm logout clears the session. A successful GraphQL
response to the reset request alone does not verify delivery.

## Rotate secrets and configuration

Pause releases, create new versioned Swarm secrets and change the stack's source
names while keeping the mount targets unchanged. For a database password
change, coordinate `\password` and the new database URL in a maintenance
window. Keep both Redis secrets synchronized and restart the Redis and API
services in the same window. A new session signing key invalidates existing
browser sessions. For Resend, leave the previous key active until a live reset
email succeeds with the new key.

Deploy the reviewed stack with the current image digest. After services are
healthy, record the changed API policy as administrator with
`sudo /usr/local/libexec/portfolio-release record im-listening`. Verify a
restricted redeploy and remove old, unreferenced secrets after the rollback
window. Rotate the PostgreSQL CA config the same way if the shared CA changes.

## Roll out Google sign-in

### Google Cloud

Use `imlistening.emails@gmail.com` to administer the OAuth project and Google
Auth Platform consent settings. Keep development, staging and production on
separate Web application clients and isolate production credentials and project
access. Use one fixed HTTPS staging domain. Register each exact callback.

| Environment | App origin | Redirect URI |
| --- | --- | --- |
| Development | `http://localhost:3100` | `http://localhost:3100/api/auth/google/callback` |
| Staging | Fixed staging HTTPS origin | Staging origin plus `/api/auth/google/callback` |
| Production | `https://im-listening.vercel.app` | `https://im-listening.vercel.app/api/auth/google/callback` |

This server-side flow uses the Authorized redirect URIs list. Leave Authorized
JavaScript origins empty unless a separately approved browser integration needs
one. Use a fixed staging origin and an isolated client for preview sign-in
testing. In Google Auth Platform, complete
Branding, Audience and Data Access for `openid email`. Set a support address,
homepage, privacy policy and terms links. Verify ownership of the required
domains and complete any review Google requests before public rollout. Use an
owned frontend domain and update `CLIENT_ORIGIN` and the callback together if
Google cannot verify the current hosted domain. [Google OAuth setup](https://developers.google.com/identity/protocols/oauth2/web-server) · [Google brand verification](https://developers.google.com/identity/verification)

### VPS enablement and rotation

Production requires the Google OAuth client ID and secret at startup. Before
the first restricted release containing Google sign-in, provision the secret
and apply the updated stack manifest with the currently verified API digest.
Check service health and record the spec with
`sudo /usr/local/libexec/portfolio-release record im-listening`. Restricted
releases update the image and preserve the configured credentials.

Deploy the reviewed Google-capable API image and frontend. Confirm the
migration applied and password sign-in and reset still work. This first release
requires users with older sessions to sign in again. To rotate the Google
secret, create a new versioned Swarm secret and update the source in
`docker-stack.yaml`, keeping the mount target. Deploy the stack, record the
spec, and verify a live sign-in before revoking the previous secret.

### Live verification and rollback

- Confirm the Vercel rewrite forwards Google form POSTs and the redirect to
  the callback GET on the frontend host. Test with a disposable flow before
  public rollout. The Traefik auth router disables access logs and traces for
  this path. Verify that Vercel, WAF, error monitoring, analytics and log drains
  exclude callback bodies, query strings and sensitive headers. Vercel rewrite
  logs can include query strings, so the POST carries the code in the body and
  the GET URL carries only a short-lived receipt. [Vercel log drains](https://vercel.com/docs/drains/reference/logs) · [Traefik router logs](https://doc.traefik.io/traefik/observe/logs-and-access-logs/)
- On a desktop and a mobile browser, check cancellation, new registration,
  returning sign-in, post return, reload, explicit linking and logout. Confirm
  the HTTPS cookie is Secure, HttpOnly, host-only, Path=/ and SameSite=Lax.
  Verify the same Google email cannot silently merge a password account.
- Track the API's redacted `Google sign-in:` events and HTTP 429/5xx rates.
  Check Google discovery, Redis and SMTP when retries or verification failures
  rise. Record the verified API digest, frontend deployment, browsers, date,
  results and rollback test in [the task log](tasks.md).
- To roll back, redeploy a verified API digest through the release workflow.
  Once a Google-capable release has been verified, use that digest so both
  sign-in methods work. On the initial rollout, the preceding image supports
  password sign-in and reset. Google-only users need a Google-capable image to
  sign in again. Retain the database migration and identity links.
