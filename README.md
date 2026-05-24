# 🌟 Birthday App — Rewrite the Stars

A cinematic birthday experience with a secret mailbox system, built with Next.js.

## Pages

| Route | Who sees it | What it does |
|-------|------------|--------------|
| `/` | Her | Main birthday page — countdown, music, mailbox button |
| `/mailbox` | Her | Her inbox — red dot, envelope animation, letters |
| `/send` | You only | Write and send her secret letters |

## The mailbox flow

1. You go to `/send`, enter your secret key, type a message → send
2. A red dot appears on her mailbox button on the main page (polls every 15s)
3. She taps the mailbox → sees the letter list
4. She taps a letter → an envelope appears
5. She taps the envelope → it opens with an animation
6. The letter slides out with floating hearts ♥

## Setup (required before deploy)

### 1. Set your secret key
Create a `.env.local` file:
```
SENDER_SECRET=your-secret-word-here
```
Pick anything — this is what you type in `/send` to authenticate.

### 2. Deploy to Vercel
```bash
npm i -g vercel
vercel
```
When prompted, add the environment variable `SENDER_SECRET`.

Or via GitHub → Vercel dashboard → Environment Variables.

### Important: persistence
By default messages use `/tmp` (ephemeral — resets on redeploy).  
For permanent messages, swap the storage in `app/api/messages/route.ts` with:
- **Vercel KV** (recommended, free tier available) — add `@vercel/kv`
- **Supabase** — add `@supabase/supabase-js`
- **PlanetScale** — add `@planetscale/database`

## Local dev
```bash
npm install
# create .env.local with SENDER_SECRET=anything
npm run dev
```

---
*She deserves every line of code.*
