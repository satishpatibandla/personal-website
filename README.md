# Satish Patibandla — Personal Website

A modern, dark-themed personal website with blog, knowledge resources, skills showcase, and contact form.

**Live URL**: `https://YOUR_SITE_NAME.netlify.app/` (after deployment)

---

## 🚀 Quick Deployment Guide (Netlify)

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

### Step 2: Deploy on Netlify

1. Go to [netlify.com](https://app.netlify.com) and sign in with GitHub
2. Click **Add new site** → **Import an existing project**
3. Select your `personal-website` repository
4. Keep default build settings (publish directory: `.`)
5. Deploy
6. Your site will be available at:
   - `https://YOUR_SITE_NAME.netlify.app/`

### Step 3: Enable the Admin CMS (`/admin`)

This project uses **Decap CMS + GitHub OAuth (PKCE)**.

1. In GitHub, create an OAuth App with callback URL:
   - `https://YOUR_SITE_NAME.netlify.app/admin/`
2. Copy the OAuth app/client ID and set it in `admin/config.yml` as `app_id`
3. Update `repo` in `admin/config.yml` to `YOUR_USERNAME/personal-website`
4. Commit and push
5. Open:
   - `https://YOUR_SITE_NAME.netlify.app/admin/`
6. Login with GitHub and publish changes

---

## 📁 Project Structure

```
├── index.html              # Main page (Hero, About, Skills, Contact)
├── blog.html               # Blog listing page
├── post.html               # Individual blog post viewer
├── resources.html          # Knowledge documents page
├── css/style.css           # Design system (dark theme)
├── js/
│   ├── main.js             # Navigation, animations, forms
│   ├── blog.js             # Blog listing & filtering
│   ├── post.js             # Single post rendering
│   └── resources.js        # Resource listing & filtering
├── content/
│   ├── blog/               # Blog posts (.md) and metadata index
│   └── resources/          # Resource metadata index
├── admin/
│   ├── index.html          # Decap CMS admin panel
│   └── config.yml          # CMS configuration
└── README.md               # This file
```

## ✏️ Managing Content

### Via CMS (No Coding Needed)

1. Go to `https://YOUR_SITE_NAME.netlify.app/admin/`
2. Login with GitHub
3. Edit **Blog Posts Index** and **Resources Index**
4. Click **Publish** (commits directly to your repo)

> For blog posts, keep the `slug` matched with a markdown filename in `content/blog/<slug>.md` for full article rendering.

### Via Code

- **Blog listing metadata**: edit `content/blog/posts.json`
- **Blog article body**: edit/add markdown files in `content/blog/`
- **Resources listing metadata**: edit `content/resources/resources.json`
- **Profile photo**: replace `images/profile.png`

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
- ✅ CMS for easy content management
- ✅ Smooth scroll animations
- ✅ SEO-friendly
- ✅ Fast loading (no framework overhead)

## 📄 License

MIT License — feel free to customize and make it your own!
