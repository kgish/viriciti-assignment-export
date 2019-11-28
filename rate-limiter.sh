#!/usr/bin/env bash
# ----------------------------------------------------------------------------
#
# Syntax:
#
#     ./rate-limiter.sh
#
# Description:
#
#    Demonstrate that the backend rate limiter is working.
#
# ----------------------------------------------------------------------------

USERNAME=${USERNAME:-rate-limiter}
PASSWORD=${PASSWORD:-asdQWE123!@#}
HOST=${HOST:-localhost}
PORT=${PORT:-3000}
URL="http://${HOST}:${PORT}"

OK=$(curl -s -H 'Accept: application/json' ${URL}/health-check)

if [[ "${OK}" == "OK" ]]
then
    echo "Health check => OK"
else
    echo "Health check failed => ${OK}"
    exit
fi

DATA='{"username": "rate-limiter", "password": "asdQWE123!@#"}'
echo DATA=${DATA}

REQUEST="curl -s -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' --data '${DATA}' ${URL}/auth/signin"
echo REQUEST=${REQUEST}

RESPONSE=`curl -s --request POST -H "Content-Type:application/json" ${URL}/auth/signin --data "${DATA}"`
echo RESPONSE=${RESPONSE}

#TOKEN=`echo ${RESPONSE} | `

echo
echo Done!
