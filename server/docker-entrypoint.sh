#!/bin/sh
set -eu

if [ -n "${DATABASE_URL_FILE:-}" ]; then
    export DATABASE_URL="$(cat "$DATABASE_URL_FILE")"
fi

case "$1" in
    migrate)
        exec ./node_modules/.bin/prisma migrate deploy
        ;;
    serve)
        if [ -n "${SESSION_SECRET_FILE:-}" ]; then
            export SESSION_SECRET="$(cat "$SESSION_SECRET_FILE")"
        fi
        if [ -n "${SMTP_PASSWORD_FILE:-}" ]; then
            export SMTP_PASSWORD="$(cat "$SMTP_PASSWORD_FILE")"
        fi
        if [ -n "${REDIS_URL_FILE:-}" ]; then
            export REDIS_URL="$(cat "$REDIS_URL_FILE")"
        fi
        if [ -n "${GOOGLE_CLIENT_SECRET_FILE:-}" ]; then
            export GOOGLE_CLIENT_SECRET="$(cat "$GOOGLE_CLIENT_SECRET_FILE")"
        fi
        if [ -n "${GOOGLE_PROXY_SECRET_FILE:-}" ]; then
            export GOOGLE_PROXY_SECRET="$(cat "$GOOGLE_PROXY_SECRET_FILE")"
        fi
        if [ -n "${SPOTIFY_CLIENT_ID_FILE:-}" ]; then
            SPOTIFY_CLIENT_ID="$(cat "$SPOTIFY_CLIENT_ID_FILE")"
            export SPOTIFY_CLIENT_ID
        fi
        if [ -n "${SPOTIFY_CLIENT_SECRET_FILE:-}" ]; then
            SPOTIFY_CLIENT_SECRET="$(cat "$SPOTIFY_CLIENT_SECRET_FILE")"
            export SPOTIFY_CLIENT_SECRET
        fi
        ./node_modules/.bin/prisma migrate deploy
        exec node dist/src/index.js
        ;;
    *) exec "$@" ;;
esac
