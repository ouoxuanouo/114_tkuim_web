# Week12_LAB  
登入、驗證與權限控管（Express + MongoDB + JWT）

---

## 專案結構

```
Week12_LAB/
├─ client/              # 前端（示範用）
├─ server/              # Express API
│  ├─ src/
│  ├─ tests/            # Vitest 測試
│  ├─ .env.example
│  └─ package.json
├─ docker/
│  ├─ docker-compose.yml
│  └─ mongo-init.js
└─ README.md
```

---

## 啟動方式

### 1. 啟動 MongoDB（Docker）

```bash
cd docker
docker compose up -d
```

確認 MongoDB 容器啟動成功：

```bash
docker ps
```

---

### 2. 啟動後端伺服器（Express）

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

看到以下訊息代表啟動成功：

```
Server running on http://localhost:3001
```

---

### 3. 健康檢查

```
GET http://localhost:3001/health
```

成功回傳：

```json
{ "ok": true }
```

---

## 測試方式

### REST Client 測試

測試檔案位置：

```
server/tests/api.http
```

測試項目：

- 未登入存取受保護 API → 401
- 使用者註冊與登入
- 登入後帶 Authorization: Bearer JWT
- student 僅能存取自己的資料
- admin 可存取全部資料
- email 重複註冊回傳 409

---

### 自動化測試（npm test）

在 `server` 目錄下執行：

```bash
npm test
```

成功畫面範例：

```
✓ Health check
Test Files  1 passed
Tests       1 passed
```

---

## 帳號列表

### 管理員帳號

```
Email: admin@example.com
Password: admin1234
Role: admin
```

### 一般學員帳號

```json
{
  "email": "student12@example.com",
  "password": "pass1234"
}
```

角色預設為 `student`。

---

## 安全設計

- 密碼使用 bcrypt 雜湊，資料庫無明碼密碼
- JWT Access Token + Refresh Token
- Middleware 驗證所有受保護 API
- `.env` 未提交，僅提供 `.env.example`

---

## 作業完成項目

- Authentication（登入驗證）
- Authorization（角色與擁有者控管）
- JWT Middleware
- bcrypt 密碼雜湊
- email 唯一索引（409）
- REST Client 驗收
- npm test 自動化測試
