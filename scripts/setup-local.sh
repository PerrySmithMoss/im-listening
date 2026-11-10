#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

if [ ! -e server/.env ]; then
  secret=$(openssl rand -hex 32)
  (umask 077; sed "s/^SESSION_SECRET=$/SESSION_SECRET=$secret/" server/.env.example > server/.env)
fi

if [ ! -e client/.env.local ]; then
  cp client/.env.example client/.env.local
fi
