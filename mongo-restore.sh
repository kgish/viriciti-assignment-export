#!/usr/bin/env bash

MONGO_USERNAME=${MONGO_USERNAME:-viriciti}
MONGO_PASSWORD=${MONGO_PASSWORD:-viriciti}
DUMPDIR=${DUMPDIR:-db/dump}

if [[ -z "${FORCE}" ]]; then
  DRYRUN="--dryRun"
else
  DRYRUN=
fi

echo mongorestore -v --username=$MONGO_USERNAME --password=****** --authenticationDatabase=admin --stopOnError $DRYRUN $DUMPDIR
mongorestore -v --username=$MONGO_USERNAME --password=$MONGO_PASSWORD --authenticationDatabase=admin --stopOnError $DRYRUN $DUMPDIR

if [[ -z "${FORCE}" ]]; then
    echo
    echo By default the option --dryRun is enabled for safety reasons
    echo If you want to force mongorestore to run, call this script as follows:
    echo FORCE=1 /.mongo_restore.sh
    echo
fi
