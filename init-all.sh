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

# Make certain scripts executable
chmod +x ./mongo-restore.sh ./start-all.sh

# Run npm install in all directories
for dir in tooling backend frontend
do
    (cd tooling && npm install)
    (cd backend && npm install)
    (cd frontend && npm install)
done

echo Done!

