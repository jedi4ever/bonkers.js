# bonkers

A distributed load test framework using Amazon EC2 instances.

This project makes it simple to launch and control lots of Amazon EC2 instances. By default, 
it will test the amount of persistent connections a server can manage, but can be easily rewritten to make any test.

Originally it was written to make a [Node.js 1 million connections test](https://github.com/ashtuchkin/node-millenium)
using 40 EC2 Micro instances.  

## Usage
```bash
# First, install Node.js (see http://nodejs.org)
# The installation is tested on Ubuntu 12.04.

git clone git://github.com/jedi4ever/bonkers.git
cd bonkers

# Install all needed modules.
npm install

# Edit accessKeyId, accessKeySecret in bonkers.json
# https://portal.aws.amazon.com/gp/aws/securityCredentials
# Also, choose regions where you wish your instances to be launched.
# Full list: ["ap-northeast-1", "ap-southeast-1", "eu-west-1", "sa-east-1", "us-east-1", "us-west-1", "us-west-2"]
# Important! In all these regions you should edit Security Group 'default' to open control port 8889 for TCP 0.0.0.0/0 
nano bonkers.json

# Start 10 instances evenly distributed across the regions.
# All instances are tagged according to 'instanceTags' field in bonkers.json.
./bin/bonkers start 10

# Watch status of our instances (similar to 'top' command).
# Launch a separate terminal for this.
./bin/bonkers status

# Set the target IP of server to test.
./bin/bonkers set host <ip>

# Set the amount of connections to keep with the target from EACH instance.
./bin/bonkers set n 1000

# Maximum recommended value = 25000 for EC2 Micro instance.
./bin/bonkers set n 25000

# Restart node process in all instances (recommended to do between tests).
./bin/bonkers set restart 1

# After all tests, terminate all instances that we started (all existing instances are not touched).
./bin/bonkers stop all
```

## How does it work?

The framework uses a 'Cloud Init' feature of Ubuntu AWS images. When an instance is to be started, a vanilla 
image of Ubuntu is used (by default Ubuntu 12.04 64bit EBS), which runs a script given in file cloud-config.sh. 
The script installs Node.js, main file client.js and an Upstart job to launch it. After this, the client.js 
starts listening on control port (8889 by default) and obeys given commands (see the source).

At any time you can edit client.js and all new instances will use the new version of it.

License: MIT






