// MongoDB Initialization Script
// This script runs automatically when MongoDB container starts for the first time

// Switch to the cybersensei_updates database
db = db.getSiblingDB('cybersensei_updates');

// Create a user with read/write permissions
db.createUser({
  user: 'cybersensei',
  pwd: 'cybersensei123',
  roles: [
    {
      role: 'readWrite',
      db: 'cybersensei_updates'
    }
  ]
});

// Create collections (optional, will be created automatically when used)
db.createCollection('update_packages.files');
db.createCollection('update_packages.chunks');

// Create indexes for GridFS (automatic, but explicit for documentation)
db.getCollection('update_packages.files').createIndex({ filename: 1 });
db.getCollection('update_packages.files').createIndex({ uploadDate: -1 });
db.getCollection('update_packages.chunks').createIndex({ files_id: 1, n: 1 }, { unique: true });

print('✅ MongoDB initialization completed successfully');
print('✅ Database: cybersensei_updates');
print('✅ User: cybersensei created');
print('✅ Collections: update_packages.files, update_packages.chunks');

