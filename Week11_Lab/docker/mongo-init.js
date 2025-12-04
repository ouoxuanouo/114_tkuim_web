db = db.getSiblingDB('signupdb');

db.createUser({
  user: 'signup_user',
  pwd: 'signup_pass',
  roles: [{ role: 'readWrite', db: 'signupdb' }],
});

db.createCollection('participants');

db.participants.createIndex(
  { email: 1 },
  { unique: true, name: 'uniq_email' }
);
