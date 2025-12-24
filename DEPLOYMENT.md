# Deployment Guide - Render.com (Free)

## 🚀 Deploy Your Todo App to the Cloud

Get your app online in ~10 minutes with free hosting!

---

## Prerequisites

- GitHub account (free)
- Render.com account (free)
- MongoDB Atlas account (free)

---

## Step 1: Push to GitHub

1. **Create a GitHub repository:**

   - Go to https://github.com/new
   - Name: `todo-app-fullstack`
   - Make it **Public**
   - Don't initialize with README (we already have files)
   - Click "Create repository"

2. **Initialize Git in your project:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Full-stack todo app with authentication"
   ```

3. **Connect to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/todo-app-fullstack.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set Up MongoDB Atlas

1. **Create account:** https://mongodb.com/cloud/atlas
2. **Create FREE cluster (M0)**
3. **Create database user:**
   - Username: `todoapp`
   - Password: Create strong password (SAVE IT!)
4. **Network Access:**
   - Click "Add IP Address"
   - Click "**Allow Access from Anywhere**" (0.0.0.0/0)
5. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Example: `mongodb+srv://todoapp:PASSWORD@cluster0.xxxxx.mongodb.net/todo-app?retryWrites=true&w=majority`
   - **Replace `<password>` with your actual password!**

---

## Step 3: Deploy to Render

1. **Create Render account:** https://render.com (sign up with GitHub)

2. **Create new Web Service:**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `todo-app-fullstack`

3. **Configure the service:**

   - **Name:** `todo-app` (or anything you like)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"

   Add these:

   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = your-atlas-connection-string-here
   JWT_SECRET = your-super-secret-key-at-least-32-characters-long
   JWT_EXPIRE = 30d
   ```

   **Important:**

   - Replace `MONGODB_URI` with your Atlas connection string
   - Create a strong random `JWT_SECRET` (e.g., use: https://randomkeygen.com/)

5. **Click "Create Web Service"**

6. **Wait for deployment** (2-3 minutes)

   - Render will install dependencies
   - Build your app
   - Start the server
   - You'll see logs in real-time

7. **Get your URL:**
   - Once deployed, you'll see: `https://todo-app-xxxx.onrender.com`
   - This is your public URL!

---

## Step 4: Test Your App

1. **Open your Render URL**
2. **You'll see the login page!**
3. **Sign up for an account**
4. **Start adding tasks!**

---

## 🌍 Access from Anywhere

Now you can access your app from:

- ✅ Your PC: `https://todo-app-xxxx.onrender.com`
- ✅ Another PC
- ✅ Phone/tablet
- ✅ Any device with internet

Just bookmark the URL and login!

---

## 📱 Share with Others

Want others to use your app?

1. Share your Render URL
2. They create their own accounts
3. Everyone gets their own private task list!

---

## ⚠️ Important Notes

**Free Tier Limitations:**

- App "sleeps" after 15 minutes of inactivity
- First load after sleep takes ~30 seconds
- Perfect for personal use!

**To keep app always awake (optional):**

- Upgrade to Render paid plan ($7/month)
- Or use a service like UptimeRobot to ping every 10 minutes

---

## 🐛 Troubleshooting

**"Application failed to respond":**

- Check environment variables are set correctly
- Verify MongoDB connection string is correct
- Check Render logs for errors

**Can't login:**

- Make sure JWT_SECRET is set
- Check MongoDB Atlas network access allows all IPs

**App is slow:**

- Normal on free tier after sleeping
- First request wakes it up (takes 20-30s)

---

## 🎉 Success!

Your app is now live on the internet! You can:

- Access from any device
- Share with friends/family
- Login from multiple devices with same account
- Your data is stored securely in MongoDB Atlas

**Your live URL:** Check Render dashboard for your custom URL!
