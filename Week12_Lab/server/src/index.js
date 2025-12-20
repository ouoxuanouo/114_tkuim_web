import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '30m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '7', 10);
const RESET_MINS = parseInt(process.env.RESET_TOKEN_EXPIRES_IN_MINUTES || '15', 10);

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined');
  process.exit(1);
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error('Error: REFRESH_TOKEN_SECRET is not defined');
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

const users = db.collection('users');
const participants = db.collection('participants');
const refreshTokens = db.collection('refresh_tokens');
const passwordResets = db.collection('password_resets');
const auditLogs = db.collection('audit_logs');

function now() { return new Date(); }
function ipOf(req) {
  return (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '').toString();
}
async function logAction({ action, userId = null, ip = null, targetId = null, meta = null }) {
  await auditLogs.insertOne({ action, userId, ip, targetId, meta, at: now() });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tokenHash(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: '缺少授權資訊' });
  try {
    const p = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = { id: p.sub, email: p.email, role: p.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token 無效或已過期' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: '權限不足' });
    next();
  };
}

// Health (runtime)
app.get('/health', (req, res) => res.json({ ok: true }));

// --- Auth: signup ---
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email 格式不正確' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: '密碼至少 6 碼' });

    if (await users.findOne({ email })) return res.status(409).json({ error: 'Email 已被註冊' });

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = { email, passwordHash, role: 'student', createdAt: now() };
    const r = await users.insertOne(doc);

    await logAction({ action: 'auth.signup', userId: r.insertedId.toString(), ip: ipOf(req), meta: { email } });

    return res.status(201).json({ id: r.insertedId.toString(), email, role: 'student' });
  } catch {
    return res.status(500).json({ error: '註冊失敗' });
  }
});

// --- Auth: login ---
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email 格式不正確' });
    if (typeof password !== 'string') return res.status(400).json({ error: '缺少密碼' });

    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: '帳號或密碼錯誤' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: '帳號或密碼錯誤' });

    const accessToken = signAccessToken(user);

    const refreshRaw = crypto.randomBytes(48).toString('base64url');
    const refreshSig = crypto.createHmac('sha256', process.env.REFRESH_TOKEN_SECRET).update(refreshRaw).digest('hex');
    const refreshToken = `${refreshRaw}.${refreshSig}`;
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

    await refreshTokens.insertOne({
      userId: user._id.toString(),
      tokenHash: tokenHash(refreshToken),
      createdAt: now(),
      expiresAt
    });

    await logAction({ action: 'auth.login', userId: user._id.toString(), ip: ipOf(req), meta: { email } });

    return res.json({
      token: accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
      refreshToken,
      refreshExpiresInDays: REFRESH_DAYS,
      user: { id: user._id.toString(), email: user.email, role: user.role }
    });
  } catch {
    return res.status(500).json({ error: '登入失敗' });
  }
});

// --- Auth: refresh ---
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== 'string' || refreshToken.length < 20) {
      return res.status(400).json({ error: '缺少 refreshToken' });
    }

    const [raw, sig] = refreshToken.split('.');
    if (!raw || !sig) return res.status(401).json({ error: 'Refresh Token 無效' });
    const expectedSig = crypto.createHmac('sha256', process.env.REFRESH_TOKEN_SECRET).update(raw).digest('hex');
    if (sig !== expectedSig) return res.status(401).json({ error: 'Refresh Token 無效' });

    const rec = await refreshTokens.findOne({ tokenHash: tokenHash(refreshToken) });
    if (!rec) return res.status(401).json({ error: 'Refresh Token 已失效' });

    const user = await users.findOne({ _id: new ObjectId(rec.userId) });
    if (!user) return res.status(401).json({ error: '使用者不存在' });

    const accessToken = signAccessToken(user);
    await logAction({ action: 'auth.refresh', userId: user._id.toString(), ip: ipOf(req) });

    return res.json({
      token: accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
      user: { id: user._id.toString(), email: user.email, role: user.role }
    });
  } catch {
    return res.status(500).json({ error: '刷新失敗' });
  }
});

// --- Auth: logout ---
app.post('/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== 'string') return res.status(400).json({ error: '缺少 refreshToken' });

    const r = await refreshTokens.deleteOne({ tokenHash: tokenHash(refreshToken) });
    await logAction({ action: 'auth.logout', userId: null, ip: ipOf(req), meta: { deleted: r.deletedCount } });

    return res.json({ message: '登出完成' });
  } catch {
    return res.status(500).json({ error: '登出失敗' });
  }
});

// --- Forgot / Reset password (demo) ---
app.post('/auth/forgot', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email 格式不正確' });

    const user = await users.findOne({ email });

    const resetToken = crypto.randomBytes(32).toString('base64url'); // demo raw
    const expiresAt = new Date(Date.now() + RESET_MINS * 60 * 1000);

    if (user) {
      await passwordResets.insertOne({
        userId: user._id.toString(),
        tokenHash: tokenHash(resetToken),
        createdAt: now(),
        expiresAt
      });
      await logAction({ action: 'auth.forgot', userId: user._id.toString(), ip: ipOf(req) });
    } else {
      await logAction({ action: 'auth.forgot', userId: null, ip: ipOf(req), meta: { emailNotFound: true } });
    }

    return res.json({ message: '若帳號存在，已產生重設資訊', resetToken, expiresInMinutes: RESET_MINS });
  } catch {
    return res.status(500).json({ error: '處理失敗' });
  }
});

app.post('/auth/reset', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body ?? {};
    if (typeof resetToken !== 'string' || resetToken.length < 10) return res.status(400).json({ error: 'resetToken 不正確' });
    if (typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ error: '新密碼至少 6 碼' });

    const rec = await passwordResets.findOne({ tokenHash: tokenHash(resetToken) });
    if (!rec) return res.status(401).json({ error: 'resetToken 無效或已過期' });

    const userId = rec.userId;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordHash } });
    await passwordResets.deleteOne({ _id: rec._id });

    await logAction({ action: 'auth.reset', userId, ip: ipOf(req) });

    return res.json({ message: '密碼已更新，請用新密碼登入' });
  } catch {
    return res.status(500).json({ error: '重設失敗' });
  }
});

// --- Signup API ---
app.get('/api/signup', authMiddleware, async (req, res) => {
  const data = req.user.role === 'admin'
    ? await participants.find({}).sort({ createdAt: -1 }).toArray()
    : await participants.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).toArray();
  return res.json({ total: data.length, data });
});

app.post('/api/signup', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body ?? {};
  if (!name || !email || !phone) return res.status(400).json({ error: '欄位不足' });

  const doc = { name, email, phone, ownerId: req.user.id, createdAt: now() };
  const r = await participants.insertOne(doc);

  await logAction({ action: 'participant.create', userId: req.user.id, ip: ipOf(req), targetId: r.insertedId.toString() });

  return res.status(201).json({ data: { ...doc, id: r.insertedId.toString() } });
});

app.delete('/api/signup/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(404).json({ error: '找不到資料' });

  const doc = await participants.findOne({ _id: new ObjectId(id) });
  if (!doc) return res.status(404).json({ error: '找不到資料' });

  const isOwner = doc.ownerId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ error: '權限不足' });

  await participants.deleteOne({ _id: doc._id });

  await logAction({ action: 'participant.delete', userId: req.user.id, ip: ipOf(req), targetId: id, meta: { asAdmin: isAdmin } });

  return res.json({ message: '刪除完成' });
});

// --- Admin audit logs ---
app.get('/admin/audit-logs', authMiddleware, requireRole('admin'), async (req, res) => {
  const data = await auditLogs.find({}).sort({ at: -1 }).limit(200).toArray();
  return res.json({ total: data.length, data });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
