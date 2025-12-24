# Quick Start - Deploy Your App

## 🎯 You Have 2 Options

### Option 1: Deploy with GitHub (Recommended)

**Requires:** Git installed
**Time:** ~10 minutes
**Access:** Permanent public URL

**Steps:**

1. Install Git: https://git-scm.com/download/win
2. Follow: [DEPLOYMENT.md](DEPLOYMENT.md)

---

### Option 2: Deploy via ZIP Upload (No Git Needed)

**Requires:** Nothing!
**Time:** ~15 minutes  
**Access:** Permanent public URL

**Steps:**

1. **Prepare your project:**

   - Delete `node_modules` folder (if exists)
   - Make sure `.env` is in `.gitignore`

2. **Create ZIP file:**

   - Right-click `todo-app` folder
   - Send to → Compressed (zipped) folder

3. **Upload to GitHub:**

   - Go to: https://github.com/new
   - Name: `todo-app-fullstack`
   - Create repository
   - Click "uploading an existing file"
   - Drag your ZIP file
   - Click "Commit changes"

4. **Set up MongoDB Atlas:**

   - Go to: https://mongodb.com/cloud/atlas
   - Create FREE account
   - Create FREE cluster (M0)
   - Create database user (save password!)
   - Network Access → Allow 0.0.0.0/0
   - Get connection string

5. **Deploy to Render:**

   - Go to: https://render.com
   - Sign up with GitHub
   - New → Web Service
   - Connect your repository
   - Configure:
     - Build: `npm install`
     - Start: `npm start`
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=5000
     MONGODB_URI=your-atlas-connection-string
     JWT_SECRET=create-long-random-string-here
     JWT_EXPIRE=30d
     ```
   - Deploy!

6. **Get your URL:**
   - Render gives you: `https://your-app.onrender.com`
   - Share it with anyone!

---

## ⚡ Even Easier: Use Render CLI

1. Install Render CLI:

   ```bash
   npm install -g render
   ```

2. Deploy:
   ```bash
   render login
   render deploy
   ```

---

## 🆘 Need Help?

Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions with screenshots.
