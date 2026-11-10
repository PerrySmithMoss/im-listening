# Im Listening tasks

## Task 1 — Switch Im Listening to PostgreSQL

Start with an empty database. Existing MySQL data does not need to be migrated.

- [x] Switch the Prisma provider and runtime adapter to PostgreSQL. Create an initial PostgreSQL migration and verify that it applies to an empty database.
- [x] Replace MySQL in local Docker Compose and update the environment examples, setup instructions, CI, and integration tests for PostgreSQL.
- [x] Check that the switch preserves account lookup and uniqueness behavior, including differences in case sensitivity. Run the API tests for registration, login, posts, and password reset against PostgreSQL.

## Task 2 — Deploy the API to the VPS

Complete Task 1 first. Use the Chinwag and VitaTrack deployment workflows and the `perry-infra` portfolio release broker as references.

- [x] Provision a dedicated Im Listening database and credentials on the shared PostgreSQL service. Add a Docker Swarm stack for the API and Redis, with HTTPS routing through Traefik, health checks, and a documented step to apply Prisma migrations.
- [x] Manually create the app's Docker secrets on the VPS for the database connection, session signing key, and Resend sending key. Add Redis and Spotify credentials if the deployment uses them. Mount the secrets into the services that need them and document their names and how to rotate them.
- [x] Add a GitHub Actions workflow that runs the checks, publishes the API image to GHCR, and deploys by digest through an app-specific restricted release account. Support redeploying a known good digest. Configure `APP_RELEASE_KEY` as a secret in the `VPS Production` GitHub environment and `VPS_HOST` and `VPS_KNOWN_HOSTS` as environment variables.
- [x] Configure the verified Resend sender and set `CLIENT_ORIGIN` to the live frontend origin. Point Vercel at the VPS API using a route that preserves browser session cookies. Verify health, login, and password reset email delivery from the live app using `imlistening.emails@gmail.com`.

The [manual redeploy](https://github.com/PerrySmithMoss/im-listening/actions/runs/42833781264) verified the restricted release account against the production digest.

The full password reset flow passed on `im-listening.vercel.app`. The reset email reached the test Gmail inbox, and the emailed link opened the live reset form. After changing the password, the test account signed in with the new password in a fresh session. The site rejected a second attempt to use the same link.
