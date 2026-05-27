# World Cup 2026 Tracker — Setup Guide
Built by FrempahBrand

## Files In This Package
```
index.html                  → App shell
app.js                      → All React components + logic
style.css                   → All styles
manifest.json               → PWA config
sw.js                       → Service worker (offline support)
about.html                  → About page
privacy.html                → Privacy policy (required for AdSense)
netlify/functions/matches.js → API proxy (protects your API key)
SETUP.md                    → This file
```

---

## BEFORE YOU UPLOAD — Do These 3 Things

### 1. Add Your Paystack Live Key
Open `app.js` → line 18:
```
const PAYSTACK_PUBLIC_KEY = 'pk_live_YOUR_PAYSTACK_KEY_HERE';
```
Replace with your actual Paystack live public key from:
Paystack Dashboard → Settings → API Keys

### 2. Add Your Football API Key to Netlify
DO NOT put this in any file — set it as an environment variable:
```
Netlify Dashboard
→ Your Site
→ Site Configuration
→ Environment Variables
→ Add variable:
   Key:   FOOTBALL_API_KEY
   Value: your_football_data_org_key
→ Save → Trigger Redeploy
```

### 3. Add App Icons
Create two PNG icon files and upload to repo root:
- icon-192.png  (192×192 pixels)
- icon-512.png  (512×512 pixels)

Quick way: Go to https://favicon.io/favicon-generator/
- Text: WC
- Background: #c9a84c
- Font color: #0a0e1a
- Download → use android-chrome-192x192.png and android-chrome-512x512.png
- Rename them to icon-192.png and icon-512.png

---

## UPLOAD TO GITHUB
Upload ALL files to your repo root EXCEPT the netlify/ folder needs to stay in its folder structure:
```
repo root/
├── index.html
├── app.js
├── style.css
├── manifest.json
├── sw.js
├── about.html
├── privacy.html
├── icon-192.png       ← you create this
├── icon-512.png       ← you create this
└── netlify/
    └── functions/
        └── matches.js
```

---

## NETLIFY DEPLOY SETTINGS
- Build command: (leave empty)
- Publish directory: /  (root)
- Node version: 18

---

## WHAT YOUR KEYS ARE
- AdSense Publisher ID: ca-pub-9960426175142172 (already in index.html)
- Paystack: get from dashboard.paystack.com → Settings → API Keys
- Football API: get from football-data.org → My Account

---

## AFTER EVERYTHING IS LIVE
1. Visit world26cup.netlify.app — confirm app loads
2. Click all 4 tabs — confirm they work
3. Test install prompt on your phone
4. Test Paystack payment with test key first
5. Switch to live Paystack key
6. Share the link and start marketing!

Built with ❤️ by FrempahBrand · Sunyani, Ghana
