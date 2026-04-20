# Deploying Mnemo to Vercel

Step-by-step guide. Takes ~10 minutes total.

## 1. Make sure your main branch is up to date

```bash
cd C:\Users\Hajrarahan007\Desktop\Mnemo
git status
git push origin main
```

## 2. Import the repo into Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up / Log in with GitHub**
2. Click **"Add New…"** → **Project**
3. Pick `hajrahrehan/Mnemo` from the list → **Import**
4. Framework: **Next.js** (auto-detected) — don't change build settings

## 3. Add environment variables

Before you click **Deploy**, expand **"Environment Variables"** and add these four (same values as your `.env.local`):

| Name | Value |
| --- | --- |
| `GROQ_API_KEY` | your Groq key (`gsk_...`) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://boceihalavtfwsmuqvmg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase publishable key (`sb_publishable_...`) |

Leave the scope on "All environments" (Production + Preview + Development).

Click **Deploy** — the first build takes 2-3 minutes.

## 4. Add the Vercel URL to Supabase Auth

Vercel will give you a URL like `https://mnemo-xxxx.vercel.app`. Copy it.

Open your Supabase project:

1. **Authentication → URL Configuration**
2. **Site URL** → set to `https://mnemo-xxxx.vercel.app`
3. **Redirect URLs** → add:
   - `https://mnemo-xxxx.vercel.app/**`
   - `http://localhost:3000/**` (keep this for local dev)
4. Click **Save**

If you skip this, login/signup will fail on the deployed site with a redirect error.

## 5. Test the deployed app

Visit `https://mnemo-xxxx.vercel.app`:

1. Sign up with a new email
2. Upload a small PDF (< 4 MB — see "Known limits" below)
3. Verify you see the deck page with cards
4. Start a review → flip cards → hit confetti 🎉

## Known limits on Vercel Hobby tier

- **Request body: 4 MB** — hard limit for Vercel functions on the free plan. Larger PDFs 413.
- **Function duration: 60 s** — plenty for our 6-chunk pipeline, but a very dense PDF could timeout.
- **Bandwidth: 100 GB/month** — more than enough for a portfolio project.

If you need to lift these later:
- Upgrade to Vercel Pro (300s duration, 4.5 MB → still same default)
- Or switch the upload flow to direct-to-Supabase-Storage (browser → Supabase) and have the API accept just a `storage_path` string. This bypasses Vercel's body limit entirely.

## Custom domain (optional)

1. Vercel project → **Settings → Domains**
2. Add your domain (or use a free `.vercel.app` alias like `mnemo-hajrah.vercel.app` via **Settings → Domains** → "Aliases")
3. Update the Supabase Site URL + Redirect URLs to match.

## Troubleshooting

**Build fails with "Module not found: pdf-parse"**
Check that `next.config.ts` has `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]`.

**Signup works but redirect fails (`access_denied`)**
You haven't added the Vercel URL to Supabase Auth → URL Configuration.

**Upload returns 413 Payload Too Large**
PDF exceeds 4 MB. Compress it ([smallpdf.com](https://smallpdf.com)), or split it.

**Upload returns 504 Gateway Timeout**
Very large/dense PDF hit the 60s ceiling. Try a smaller chapter, or increase `MAX_CHUNKS` in `src/app/api/decks/route.ts` after upgrading to Pro.
