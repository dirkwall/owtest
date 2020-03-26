#!/bin/bash

OP=$1
NAMESPACES=$2
USERS=$3
CRED_FILE=./credentials.json

[ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] && echo "Three parameters OPERATION, NAMESPACES, USERS needed!" && exit 1

function delete_users() {
  for n in $(seq 1 $NAMESPACES); do
    for u in $(seq 1 $USERS); do
      wskadmin user delete user$u -ns ns$n
      echo "user$u ns$n deleted"
    done
  done
}

function create_users() {
  echo "{" > $CRED_FILE
  echo "  \"namespaces\": [" >> $CRED_FILE
  for n in $(seq 1 $NAMESPACES); do
    echo "    {" >> $CRED_FILE
    echo "      \"name\": \"ns$n\"," >> $CRED_FILE
    echo "      \"users\": [" >> $CRED_FILE
    for u in $(seq 1 $USERS); do
      CREDENTIALS=$(wskadmin user create user$u -ns ns$n)
      echo "user$u ns$n $CREDENTIALS"
      USER_COMMA=","
      if [ $u -eq $USERS ]; then
        USER_COMMA=""
      fi
      echo "        {" >> $CRED_FILE
      echo "          \"name\": \"ns${n}user${u}\"," >> $CRED_FILE
      echo "          \"credentials\": \"$CREDENTIALS\"" >> $CRED_FILE
      echo "        }$USER_COMMA" >> $CRED_FILE
    done
    echo "      ]" >> $CRED_FILE
    NAMESPACE_COMMA=","
    if [ $n -eq $NAMESPACES ]; then
      NAMESPACE_COMMA=""
    fi
    echo "    }$NAMESPACE_COMMA" >> $CRED_FILE
  done
  echo "  ]" >> $CRED_FILE
  echo "}" >> $CRED_FILE
}

function prepare_function() {
  CURDIR=`pwd`
  cd $1
  if [ ! -f function.zip ]; then
    npm install &> /dev/null
    zip -r function.zip *
  fi
  cd $CURDIR
}

function create_functions() {
  #iterate over functions
  jq -c '.[]' functions.json | while read i; do
    F_NAME=`echo $i | jq -r '.name'`
    F_PATH=`echo $i | jq -r '.path'`
    F_FILE=`echo $i | jq -r '.file'`
    F_ZIP=`echo $i | jq -r '.zip'`
    F_KIND=`echo $i | jq -r '.kind'`
    F_CONCURRENCY=`echo $i | jq -r '.concurrency'`
    F_MEMORY=`echo $i | jq -r '.memory'`
    F_TIMEOUT=`echo $i | jq -r '.timeout'`

    if [ $F_ZIP == "true" ]; then
      prepare_function $F_PATH
    fi

    # iterate over namespaces
    for n in $(seq 1 $NAMESPACES); do
      NS="ns$n"
      jq -c '[.[] | select( .namespace == "'$NS'")][0]' credentials.json | while read i; do
        CREDENTIAL=`echo $i | jq -r '.credentials'`
        wsk -i action create $NS$F_NAME $F_FILE -c $F_CONCURRENCY --kind $F_KIND -m $F_MEMORY -t $F_TIMEOUT -u $CREDENTIAL
      done
    done
  done
}

function delete_functions() {
  #iterate over functions
  jq -c '.[]' functions.json | while read i; do
    F_NAME=`echo $i | jq -r '.name'`
    
    # iterate over namespaces
    for n in $(seq 1 $NAMESPACES); do
      NS="ns$n"
      jq -c '[.[] | select( .namespace == "'$NS'")][0]' credentials.json | while read i; do
        CREDENTIAL=`echo $i | jq -r '.credentials'`
        wsk -i action delete $NS$F_NAME -u $CREDENTIAL
      done
    done
  done
}

if [ "$OP" = "c" ]; then
  create_users
  create_functions
elif [ "$OP" = "d" ]; then
  delete_users
  delete_functions
else
  echo "OPERATION must be either 'c' for create or 'd' for delete" && exit 1
fi