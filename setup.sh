#!/bin/bash

OP=$1
NAMESPACES=$2
MAX_USERS=$3
MAX_RPS=$4

[ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ] && echo "Four parameters OPERATION, NAMESPACES, MAX_USERS, MAX_RPS needed!" && exit 1

function delete_users() {
  for n in $(seq 1 $NAMESPACES); do
    for u in $(seq 1 $MAX_USERS); do
      wskadmin user delete user$u -ns ns$n
      echo "user$u ns$n deleted"
    done
  done
}

function create_users() {
  echo "[\n" > credentials.json
  for n in $(seq 1 $NAMESPACES); do
    for u in $(seq 1 $MAX_USERS); do
      CREDENTIALS=$(wskadmin user create user$u -ns ns$n)
      echo "user$u ns$n $CREDENTIALS"
      B64CREDS=$(echo -n $CREDENTIALS | base64 -w0)
      echo "  {\"namespace\":\"ns$n\", \"credentials\":\"$B64CREDS\"}"
      if [ $u eq $MAX_USERS]; then
        echo ",\n"
      else
        echo "\n"
      fi
    done
  done
  echo "]\n" >> credentials.json
}

if [ "$OP" = "c" ]; then
  create_users
elif [ "$OP" = "d" ]; then
  delete_users
else
  echo "OPERATION must be either 'c' for create or 'd' for delete" && exit 1
fi

# create functions

# generate config.json

