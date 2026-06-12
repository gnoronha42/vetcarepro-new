#!/bin/sh
set -e

# Popula dados demo na primeira subida (idempotente — ignora se já existir)
node dist/seed.js

exec node dist/main.js
