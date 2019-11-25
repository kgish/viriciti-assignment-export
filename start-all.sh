#!/usr/bin/env bash
# ----------------------------------------------------------------------------
#
# Syntax:
#
#     ./start-all.sh
#
# Description:
#
#    Fire up docker-compose, backend and frontend.
#
# ----------------------------------------------------------------------------

docker-compose down -v
docker-compose down -v
docker-compose up -d

(cd backend && npm run start:dev) &
(cd frontend && npm run start:hmr) &
