# Satish Patibandla — Personal Website

A modern, dark-themed personal website with blog, knowledge resources, skills showcase, and contact form.

**Live URL**: `https://satishpatibandla.netlify.app` (after deployment)

---

## 🚀 Quick Deployment Guide

### Step 1: Push to GitHub

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - personal website"

# Create a repo on GitHub (github.com/new) named "personal-website"
git remote add origin https://github.com/YOUR_USERNAME/personal-website.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Netlify (Free)

1. Go to [netlify.com](https://app.netlify.com) and sign up with your GitHub account
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select the `personal-website` repository
4. **Build settings**: Leave defaults (publish directory: `.`)
5. Click **"Deploy site"**
6. Once deployed, go to **Site settings** → **Change site name** → Enter `satishpatibandla`
7. Your site is now live at **`satishpatibandla.netlify.app`** ✨

### Step 3: Enable Content Management (CMS)

1. In Netlify dashboard, go to **Integrations** → **Identity** → **Enable Identity**
2. Under **Identity** → **Registration**, set to **Invite only**
3. Under **Identity** → **External providers**, add **GitHub** (optional)
4. Under **Identity** → **Services**, enable **Git Gateway**
5. Go to **Identity** → **Invite users** and invite your email: `stshpatibandla@gmail.com`
6. Check your email and accept the invitation
7. Visit `https://satishpatibandla.netlify.app/admin/` to manage content 🎉

---

## 📁 Project Structure

```
├── index.html              # Main page (Hero, About, Skills, Contact)
├── blog.html               # Blog listing page
├── post.html               # Individual blog post viewer
├── resources.html           # Knowledge documents page
├── css/style.css            # Design system (dark theme)
├── js/
│   ├── main.js              # Navigation, animations, forms
│   ├── blog.js              # Blog listing & filtering
│   ├── post.js              # Single post rendering
│   └── resources.js         # Resource listing & filtering
├── content/
│   ├── blog/                # Blog posts (.md) and metadata
│   └── resources/           # Resource metadata (.json)
├── admin/
│   ├── index.html           # Decap CMS admin panel
│   └── config.yml           # CMS configuration
├── netlify.toml             # Deployment config
└── README.md                # This file
```

## ✏️ Managing Content

### Via CMS (No Coding Needed)

1. Go to `your-site.netlify.app/admin/`
2. Log in with your credentials
3. Create/edit blog posts and resources using the visual editor
4. Click "Publish" — changes auto-deploy!

### Via Code

- **Blog posts**: Add `.md` files to `content/blog/` and update `content/blog/posts.json`
- **Resources**: Add entries to `content/resources/resources.json`
- **Profile photo**: Replace the placeholder in the About section with your image

## 🎨 Customization

- **Colors**: Edit CSS variables in `css/style.css` (`:root` section)
- **Skills**: Edit the skills section in `index.html`
- **Social links**: Update URLs in `index.html` (About and Contact sections)
- **Content**: Use the CMS or edit JSON/Markdown files directly

## 📱 Features

- ✅ Dark theme with teal accent
- ✅ Mobile responsive
- ✅ Blog with markdown support
- ✅ Knowledge resources with downloads
- ✅ Contact form (Netlify Forms)
- ✅ CMS for easy content management
- ✅ Smooth scroll animations
- ✅ SEO-friendly
- ✅ Fast loading (no framework overhead)

## 📄 License

MIT License — feel free to customize and make it your own!
