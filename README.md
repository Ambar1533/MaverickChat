# 💬 Maverick Chat

A **real-time private chatting app** built using **React**, **Node.js**, **Socket.IO**, and **MongoDB Atlas**.

- 🔐 Secure login and registration
- 💬 Instant messaging with WebSocket
- 🧑‍🤝‍🧑 Real-time presence and typing indicators
- 💾 Backend deployed on **Render**
- 🌐 Frontend deployed on **Vercel**

---

## 🚀 Live Demo

🔗 Frontend: [https://maverick-chat.vercel.app](https://maverick-chat.vercel.app)  
🔗 Backend API: [https://chatapp-api-fars.onrender.com](https://chatapp-api-fars.onrender.com)

---

## 📸 Screenshots

### 🔐 Login Page

![Login](./screenshots/login.png)

### 💬 Chat Interface

![Chat](./screenshots/chat.png)

---

## 🧱 Tech Stack

### Frontend

- React 16.14
- Bootstrap 4
- Axios
- Socket.IO Client

### Backend

- Node.js (Express)
- MongoDB Atlas
- Socket.IO
- JWT Authentication
- Rate Limiting + Helmet + CORS

---

## 📁 Project Structure

```
Chatting-app/
│
├── Nodejs API/
│   ├── config/
│   ├── handlers/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── React App/
│   ├── src/
│   ├── public/
│   ├── .env
│   └── package.json
│
├── screenshots/
│   ├── login.png
│   └── chat.png
│
├── README.md
└── LICENSE
```

---

## 🛠️ Setup & Deployment

### Clone Repository

```bash
git clone https://github.com/Ambar1533/MaverickChat.git
cd MaverickChat
```

### Backend Setup (Node.js)

```bash
cd "Nodejs API"
npm install
npm start
```

Make sure your `.env` contains:

```env
PORT=4000
HOST=0.0.0.0
DB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chatAppDB
JWT_SECRET=yourJWTSecret
```

### Frontend Setup (React)

```bash
cd "../React App"
npm install
npm start
```

Your `.env` file should be:

```env
REACT_APP_API_URL=https://chatapp-api-fars.onrender.com
REACT_APP_SOCKET_URL=https://chatapp-api-fars.onrender.com
```

---

## 📄 License

Licensed under the [MIT License](./LICENSE).

---

## 🙌 Author

**Ambar Mistry** – [LinkedIn](https://www.linkedin.com/in/ambar1533)

---

## 🌟 Show Your Support

If you like this project, leave a ⭐ on the repo and share it with others!
