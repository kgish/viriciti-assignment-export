#!/usr/bin/env bash

# ----------------------------------------------------------------------------
#
# Syntax:
#
#     ./init-all.sh
#
# Description:
#
#    Initialize setups for all components.
#
# ----------------------------------------------------------------------------

chmod +x ./mongo-restore.sh
chmod +x ./start-all.sh
cd tooling
npm install
cd ../backend
npm install
cd ../frontend
npm install
cd ..
