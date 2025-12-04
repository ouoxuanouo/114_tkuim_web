# Week11 Lab：報名資料庫實作（Week11_Lab）

本專案示範 Week11 Lab 的完整開發流程：
使用 Docker 啟動 MongoDB、Express 建立 REST API、實作分頁、唯一索引與前端表單串接。

---

## 一、指定資料夾結構

```
Week11_Lab/
  docker/
    docker-compose.yml
    mongo-init.js
    mongo-data/        # Docker 自動產生
  server/
    app.js
    db.js
    routes/
    repositories/
    package.json
    .env.example
  tests/
    api.http
  client/
    signup_form.html
    signup_form.js
  screenshot/
    1124畫面.png
    API 測試成功畫面.png
    docker ps.png
    MongoDB Compass.png
    mongosh 查詢結果.png
  README.md
```

---

## 二、環境需求
- Docker / Docker Compose
- Node.js 18+
- VS Code（建議安裝 REST Client）或 Postman
- MongoDB Compass（可視覺化檢查資料）

---

## 三、.env 設定（server/.env.example）

```env
PORT=3001
MONGO_URI=mongodb://signup_user:signup_pass@localhost:27017/signupdb?authSource=signupdb
ALLOWED_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

- **PORT**：Express API 伺服器 port
- **MONGO_URI**：Docker 啟動的 MongoDB 連線字串
- **ALLOWED_ORIGIN**：允許前端來源（CORS）

> 請複製 `.env.example` 成 `.env` 使用，不要上傳 `.env`。

---

## 四、啟動流程

### 1. 啟動 MongoDB（Docker）

```bash
cd docker
docker compose up -d
docker ps
```

截圖：
`screenshot/docker ps.png`

---

### 2. 使用 mongosh / Compass 確認初始化

```bash
mongosh "mongodb://signup_user:signup_pass@localhost:27017/signupdb?authSource=signupdb"

use signupdb
show collections
db.participants.getIndexes()
```

需看到：

- `participants` 集合
- email 唯一索引

截圖：
`screenshot/mongosh 查詢結果.png`

---

### 3. 啟動 API 伺服器

```bash
cd ../server
npm install
npm run dev
```

成功後可測試：

```
GET http://localhost:3001/health
```

---

### 4. 使用 REST Client/Postman 測試 API

請打開 `tests/api.http`，測試：

- POST `/api/signup`（新增報名）
- POST（重複 email）→ 應回 409
- GET `/api/signup?page=1&limit=10`（分頁）
- PATCH `/api/signup/:id`
- DELETE `/api/signup/:id`

截圖：
`screenshot/API 測試成功畫面.png`

---

### 5. 使用 Compass 確認資料

連線字串：

```
mongodb://signup_user:signup_pass@localhost:27017/signupdb?authSource=signupdb
```

需看到：

- `signupdb`
- `participants` 集合
- 至少一筆 document

截圖：
`screenshot/MongoDB Compass.png`

---

## 五、Mongo Shell 指令

```js
use signupdb
db.participants.find().pretty()
db.participants.find().skip(0).limit(5)
db.participants.getIndexes()
```

---

## 六、API 一覽

### POST /api/signup
建立報名，email 重複時回 409。

### GET /api/signup?page=1&limit=10
使用 `skip` / `limit` 分頁。

### PATCH /api/signup/:id
可更新 phone 或 status。

### DELETE /api/signup/:id
刪除特定報名資料。

---

## 七、常見問題（FAQ）

### Q1：無法連線到 MongoDB？
- Docker 未啟動：請確認 `docker ps` 是否看到 `week11-mongo`
- `.env` 的帳號密碼與 `mongo-init.js` 是否一致
- Port 27017 若被占用可改成 27018，並同步修改 `MONGO_URI`

### Q2：重複 email 報名一直回 409？
因為 `participants.email` 有唯一索引。
測試時可：
```js
db.participants.deleteMany({})
```
或更換 email。

### Q3：出現 CORS 錯誤？
請確認 `.env` 的 ALLOWED_ORIGIN 是否包含你目前的前端網址。

### Q4：PATCH 或 DELETE 回傳 404？
- 傳入的 ID 格式不是 ObjectId
- 該筆資料不存在或已刪除

### Q5：Compass 無法連線？
請使用：
```
mongodb://signup_user:signup_pass@localhost:27017/signupdb?authSource=signupdb
```

---
