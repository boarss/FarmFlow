# GitHub Setup Guide for FarmFlow

## Current Situation
Your FarmFlow project is currently in a Git repository that was initialized in a parent directory, causing it to track files outside your project folder.

## Solution: Set Up FarmFlow with Its Own Repository

### Step 1: Create a New GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `FarmFlow` (or your preferred name)
4. Description: "Smart farming management platform for Nigerian farmers"
5. Choose: **Private** or **Public** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 2: Initialize Git in FarmFlow Directory Only

Since your current Git setup is tracking parent directories, we need to:

**Option A: Clean Approach (Recommended)**
```powershell
# Remove the existing Git repository
Remove-Item -Recurse -Force .git

# Initialize a fresh Git repository in FarmFlow
git init

# Add all FarmFlow files
git add .

# Create initial commit
git commit -m "Initial commit: FarmFlow project setup"

# Add your new GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/FarmFlow.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Option B: Keep History (If you want to preserve commits)**
```powershell
# Create a new branch with only FarmFlow files
git checkout --orphan farmflow-only

# Remove all files from staging
git rm -rf --cached .

# Add only FarmFlow files
git add .

# Commit
git commit -m "Initial commit: FarmFlow project"

# Replace main branch
git branch -D main
git branch -m main

# Add your new GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/FarmFlow.git

# Push to GitHub
git push -u origin main --force
```

### Step 3: Verify Setup
```powershell
# Check remote
git remote -v

# Check status
git status

# Should show: "On branch main, nothing to commit, working tree clean"
```

### Step 4: Future Workflow
```powershell
# Make changes to your files

# Stage changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push
```

## Important Notes

1. **Your GitHub Repository URL** will be:
   - HTTPS: `https://github.com/YOUR_USERNAME/FarmFlow.git`
   - SSH: `git@github.com:YOUR_USERNAME/FarmFlow.git`

2. **Files Already Ignored** (from .gitignore):
   - node_modules
   - .env files
   - dist folders
   - .supabase

3. **Recommended: Add GitHub Secrets** for CI/CD:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Quick Commands Reference

```powershell
# Clone repository (for team members)
git clone https://github.com/YOUR_USERNAME/FarmFlow.git

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout main

# View commit history
git log --oneline

# View changes
git diff
```

## Troubleshooting

### If you see parent directory files:
The Git repository is still in a parent directory. Use Option A above.

### If push is rejected:
```powershell
git push -u origin main --force
```
(Only use --force for initial setup!)

### If you need to change remote URL:
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/FarmFlow.git
```

## Next Steps After Setup

1. ✅ Repository created on GitHub
2. ✅ Local Git initialized
3. ✅ Code pushed to GitHub
4. 📝 Update README.md with project details
5. 🔒 Add collaborators (if team project)
6. 🚀 Set up GitHub Actions for CI/CD (optional)
7. 📋 Create issues for tasks
8. 🌿 Use branches for features

---

**Need Help?** 
- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc