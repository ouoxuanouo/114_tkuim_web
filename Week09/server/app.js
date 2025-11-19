// app.js
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { router as signupRouter } from './routes/signup.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS（多個 origin 用逗號切）
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN?.split(',') ?? '*',
  })
);

// 解析 JSON
app.use(express.json());

// 掛上 /api/signup 路由
app.use('/api/signup', signupRouter);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 500 handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});