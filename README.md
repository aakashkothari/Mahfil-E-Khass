# Mahfil

Mahfil is a full-stack Hinglish poetry and shayari forum built with:

- React + Vite + Tailwind CSS
- Netlify Functions
- Supabase PostgreSQL + Supabase Auth
- Groq as the primary AI provider with Gemini fallback

## Features

- Infinite-scroll feed with `latest` and `following` scopes
- Trending page powered by `trending_score`
- Compose flow with:
  - Roman-script writing
  - Hindi translation
  - AI mood detection
  - polished Roman transliteration
- Supabase email/password auth
- Public profiles and diwans
- Weekly spotlight page
- Scheduled Netlify jobs for trending refresh and star recalculation
- Secure RLS policies

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` into `.env` and fill:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=
```

3. In Supabase SQL editor, run:

```sql
-- file: supabase/schema.sql
```

4. Start the frontend locally:

```bash
npm run dev
```

5. For local functions + redirects, run through Netlify Dev if desired:

```bash
npx netlify dev
```

## Deployment

1. Push this project to a Git provider or connect the folder to Netlify.
2. In Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. Add the same environment variables in Netlify site settings.
4. Deploy.

## Serverless functions

- `feed.js`
- `trending.js`
- `createPost.js`
- `toggleLike.js`
- `addComment.js`
- `ai-translate.js`
- `ai-transliterate.js`
- `ai-tag-mood.js`
- `ai-weekly-spotlight.js`
- `update-trending.js`
- `recalculate-stars.js`

## Important note

The requested star formula includes `+0.5` increments, so `users.stars_total` is implemented as `numeric(10,1)` instead of integer to preserve the scoring rule exactly.
