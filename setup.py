#!/usr/bin/python3

import argparse
import json
import subprocess
import os.path
import math
import base64

parser = argparse.ArgumentParser(description='Create/delete namespaces, users, and functions in OpenWhisk')
parser.add_argument('operation', help="The operation to do", choices=['create','delete'])
parser.add_argument('namespaces', help="Number of namespaces", type=int, choices=range(1,21))
parser.add_argument('users', help="Number of users", type=int, choices=range(1,21))
parser.add_argument('rps', help="Maximum number of requests per second", type=int, choices=range(1,200))
parser.add_argument('host', help="IP or DNS name of host running OpenWhisk")
args = parser.parse_args()

if args.operation == "create":
  credentials = {}
  for n in range(args.namespaces):
    ns_name = "ns{}".format(n)
    credentials[ns_name] = {}

    # create users
    users = math.ceil(args.users/(n+1))
    for u in range(users):
      user_name = "user{}".format(u)
      cmd = "wskadmin user create {} -ns {}".format(user_name, ns_name)
      ret = subprocess.run(cmd.split(" "), stdout=subprocess.PIPE, universal_newlines=True)
      credentials[ns_name][user_name] = str(ret.stdout).strip('\n')
      print("{} {} created".format(user_name, ns_name))
    
    with open('credentials.json', 'w') as outfile:
      json.dump(credentials, outfile)

    # create functions
    with open('functions.json') as json_file:
      data = json.load(json_file)
    
    for f in data:
      # prepare function
      if f['zip'] and not os.path.exists(f['file']):
        subprocess.run(["npm", "install", "--quiet"], cwd=f['path'])
        subprocess.run(["zip", "-r", "function.zip", ".", "-i", "*"], cwd=f['path'])
      
      # create function
      cmd = "wsk -i action create {}{} {} -c {} --kind {} -m {} -t {} -u {}".format(ns_name, f['name'], f['file'], f['concurrency'], f['kind'], f['memory'], f['timeout'], credentials[ns_name]["user0"])
      ret = subprocess.run(cmd.split(" "))
  
  # create requests.json array
  with open('functions.json') as functions_json:
    functions = json.load(functions_json)

  for n in range(args.namespaces):
    ns_name = "ns{}".format(n)
    filename = "data_{}.csv".format(ns_name)
    users = math.ceil(args.users/(n+1))

    with open(filename, "w") as outfile:
      for u in range(users):
        user_name = "user{}".format(u)
        for f in functions:
          # namespace, name, credentials, IP, path, payload
          payload = ""
          if f['params']:
            jsondump = json.dumps(f['params'])
            payload = base64.b64encode(jsondump.encode()).decode()
          r = "{},{},{},{},/api/v1/namespaces/_/actions/{}{}?blocking=true,{}{}".format(ns_name, f['name'], credentials[ns_name][user_name], args.host, ns_name, f['name'], payload, "\n")
          outfile.write(r)

else:
  for n in range(args.namespaces):
    ns_name = "ns{}".format(n)

    # delete functions
    with open('functions.json') as functions_json:
      functions = json.load(functions_json)
    with open('credentials.json') as credentials_json:
      credentials = json.load(credentials_json)

    for f in functions:
      cmd = "wsk -i action delete {}{} -u {}".format(ns_name, f['name'], credentials[ns_name]["user0"])
      ret = subprocess.run(cmd.split(" "))

    # delete users
    users = math.ceil(args.users/(n+1))
    for u in range(users):
      cmd = "wskadmin user delete user{} -ns {}".format(u, ns_name)
      ret = subprocess.run(cmd.split(" "))
      print("user{} {} deleted".format(u, ns_name))
