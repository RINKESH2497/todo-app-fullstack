# Full-Stack Todo App

Live Demo: [Your Render URL here after deployment]

A modern, secure todo application with user authentication and cross-device sync.

## ✨ Features

- 🔐 User authentication (JWT + bcrypt)
- 📝 Personal todo lists
- 🌐 Access from any device
- 🎨 Beautiful dark UI
- ✅ Task priorities & categories
- 📅 Due dates
- 🔍 Search & filters
- 📊 Statistics dashboard

## 🚀 Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 💻 Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up MongoDB (Atlas or local)
4. Configure `.env` file
5. Run: `npm run dev`
6. Open: `http://localhost:5000`

## 📝 Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=30d
```

## 🛠️ Tech Stack

**Frontend:** HTML, CSS, JavaScript
**Backend:** Node.js, Express
**Database:** MongoDB
**Auth:** JWT, bcryptjs

## 📄 License

ISC
