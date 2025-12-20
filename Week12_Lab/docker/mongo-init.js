db = db.getSiblingDB('week12');

db.createUser({
  user: 'week12-admin',
  pwd: 'week12-pass',
  roles: [{ role: 'readWrite', db: 'week12' }]
});

// participants
db.createCollection('participants');
db.participants.createIndex({ ownerId: 1 });

// users
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

// refresh tokens
db.createCollection('refresh_tokens');
db.refresh_tokens.createIndex({ userId: 1 });
db.refresh_tokens.createIndex({ tokenHash: 1 }, { unique: true });
db.refresh_tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

// password resets
db.createCollection('password_resets');
db.password_resets.createIndex({ tokenHash: 1 }, { unique: true });
db.password_resets.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

// audit logs
db.createCollection('audit_logs');
db.audit_logs.createIndex({ at: -1 });

// 預設 admin（請把 passwordHash 換成你自己 bcrypt hash）
db.users.insertOne({
  email: 'admin@example.com',
  passwordHash: '$2b$10$O8Rn68KWu.BbjD9glEIuYuuD5P/coTGUcAPYhGyjSr0gFem8RWUKm',
  role: 'admin',
  createdAt: new Date()
});
