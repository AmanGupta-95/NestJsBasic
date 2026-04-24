#!/bin/bash
set -e

# Copy keyfile to a writable location and set permissions
cp /tmp/mongo-keyfile /data/mongo-keyfile
chmod 400 /data/mongo-keyfile
chown 999:999 /data/mongo-keyfile

# Start MongoDB in background
/usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /data/mongo-keyfile &

# Wait for MongoDB to start
sleep 5

# Initialize replica set if not already initialized
mongosh --quiet --eval "
  try {
    rs.status()
    print('Replica set already initialized')
  } catch(e) {
    if (e.codeName === 'NotYetInitialized') {
      rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})
      print('Replica set initialized successfully')
    }
  }
"

# Keep container running (wait for background MongoDB process)
wait
