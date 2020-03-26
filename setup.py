#!/usr/bin/python3

import argparse
import json
import subprocess
import os.path

parser = argparse.ArgumentParser(description='Create/delete namespaces, users, and functions in OpenWhisk')
parser.add_argument('operation', help="The operation to do", choices=['create','delete'])
parser.add_argument('namespaces', help="Number of namespaces", type=int, choices=range(1,21))
parser.add_argument('users', help="Number of users", type=int, choices=range(1,21))
args = parser.parse_args()

credentials = {}

if args.operation == "create":
  for n in range(args.namespaces):
    ns_name = "ns{}".format(n)
    credentials[ns_name] = {}

    # create users
    for u in range(args.users):
      user_name = "user{}".format(u)
      cmd = "wskadmin user create {} -ns {}".format(user_name, ns_name)
      #ret = subprocess.run(cmd.split(" "), stdout=subprocess.PIPE, universal_newlines=True)
      #credentials[ns_name][user_name] = str(ret.stdout).strip('\n')
      #print("{} {} created".format(user_name, ns_name))
    #print(credentials)
    with open('credentials.json', 'w') as outfile:
      json.dump(credentials, outfile)

    # create functions
    with open('functions.json') as json_file:
      data = json.load(json_file)
    
    for f in data:
      print("##################################")
      print(f)
      # prepare function
      if f['zip'] and not os.path.exists(f['file']):
        subprocess.run(["npm", "install", "--quiet"], cwd=f['path'])
        subprocess.run(["zip", "-r", "function.zip", ".", "-i", "*"], cwd=f['path'])
      
      # create function
      cmd = "wsk -i action create {}{} {} -c {} --kind {} -m {} -t {} -u {}".format(ns_name, f['name'], f['file'], f['concurrency'], f['kind'], f['memory'], f['timeout'], credentials[ns_name]["user0"])
      ret = subprocess.run(cmd.split(" "))

        

else:
  for n in range(args.namespaces):
    ns_name = "ns{}".format(n)

    # delete users
    for u in range(args.users):
      cmd = "wskadmin user delete user{} -ns {}".format(u, ns_name)
      ret = subprocess.run(cmd.split(" "))
      print("user{} {} deleted".format(u, ns_name))
    
    # delete functions
    with open('functions.json') as functions_json:
      functions = json.load(functions_json)
    with open('credentials.json') as credentials_json:
      credentials = json.load(credentials_json)

    for f in functions:
      cmd = "wsk -i action delete {}{} -u {}".format(ns_name, f['name'], credentials[ns_name]["user0"])
      ret = subprocess.run(cmd.split(" "))