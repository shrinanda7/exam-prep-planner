# 🚀 How to Upload NityaVerse to GitHub

Follow these simple steps to upload your KCET Planner to GitHub!

## Prerequisites
1. **Create a GitHub Account**: If you don't have one, sign up at [github.com](https://github.com/).
2. **Download & Install Git**: Download it from [git-scm.com](https://git-scm.com/downloads) and install it with default settings.

## Step 1: Create a New Repository on GitHub
1. Go to your GitHub homepage and click the **New** button (or `+` icon top right -> "New repository").
2. Name your repository (e.g., `nitya-verse-planner`).
3. Keep it **Public** (or Private if you prefer).
4. **IMPORTANT**: Do NOT check "Add a README file" or "Add .gitignore". Keep it completely empty.
5. Click **Create repository**. 
6. Keep the next page open, you will need the URL.

## Step 2: Push Your Code from Terminal
Open your terminal (Command Prompt, PowerShell, or VS Code Terminal) making sure you are inside your project folder (`e:\antigravityproductivityapp`), and run these commands one by one:

```bash
# 1. Initialize Git in your project
git init

# 2. Add all your files to be pushed
git add .

# 3. Save the changes with a message
git commit -m "Initial commit of NityaVerse 🌸"

# 4. Connect to your GitHub repository
# Replace THE_URL with the link from the GitHub page (e.g., https://github.com/username/nitya-verse.git)
git remote add origin THE_URL

# 5. Push the code to GitHub!
git branch -M main
git push -u origin main
```

## Step 3: Deploying for Free (Optional)
If you want to host this website so you don't have to keep `npm run dev` running locally:
1. Go to [vercel.com](https://vercel.com/) and sign up with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your new `nitya-verse-planner` repository.
4. Click **Deploy**. Vercel will automatically configure Vite and give you a fast, free live URL!
