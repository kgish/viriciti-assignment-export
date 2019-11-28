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

# Make certain all scripts are executable
chmod +x *.sh

# Run npm install in all directories
for dir in tooling backend frontend
do
    (cd tooling && npm install)
    (cd backend && npm install)
    (cd frontend && npm install)
done

sudo apt-get install jq

echo Done!

