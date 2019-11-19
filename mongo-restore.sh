#!/usr/bin/env bash

# ----------------------------------------------------------------------------
#
# Syntax:
#
#     [FORCE=true] ./mongo-restore.sh
#
# Description:
#
#     Restore mongo database from previous dump which is located at 'db/dump'
#     unless otherwise indicated.
#
#     By default will execute a dry run, unless the FORCE=true option is used.
#
#     Ensure that the mongodb container is running first by calling:
#
#         $ docker-compose up -d
#
# ----------------------------------------------------------------------------

MONGO_USERNAME=${MONGO_USERNAME:-viriciti}
MONGO_PASSWORD=${MONGO_PASSWORD:-viriciti}
DUMPDIR=${DUMPDIR:-db/dump}

if [[ -z "${FORCE}" ]]; then
  DRYRUN="--dryRun"
else
  DRYRUN=
fi

echo
echo mongorestore -v --username=$MONGO_USERNAME --password=****** --authenticationDatabase=admin --stopOnError $DRYRUN $DUMPDIR
echo

mongorestore -v --username=$MONGO_USERNAME --password=$MONGO_PASSWORD --authenticationDatabase=admin --stopOnError $DRYRUN $DUMPDIR

if [[ -z "${FORCE}" ]]; then
    echo
    echo "By default the '--dryRun' option is enabled for safety reasons."
    echo
    echo "If you want to force execution, then call this script as follows:"
    echo
    echo "    FORCE=true ./mongo-restore.sh"
    echo
fi
