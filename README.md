# MIYORA MD — Web Pairing

A lightweight, responsive Vercel frontend for the existing Sakura/MIYORA Baileys pairing backend.

## 1. Configure the backend URL

Open `config.js` and change:

```js
API_BASE_URL: "https://YOUR-HEROKU-APP.herokuapp.com/pair"
```

Use the exact public base path where the existing Express pairing router is mounted. In the supplied `sakura.js`, the router already has:

- `GET /?number=9477...` — starts pairing and returns `{ "code": "..." }`
- `GET /active` — lists active sessions

For example, if your main server mounts the router using `app.use('/pair', router)`, use the Heroku URL ending in `/pair`. If it mounts at `/`, use the origin URL without `/pair`.

## 2. Enable CORS in the existing backend

The website and Heroku backend have different origins. Add this middleware to the Express app **before mounting the pairing router**. Replace the example origin with your deployed Vercel domain.

```js
const allowedOrigins = [
  'https://YOUR-VERCEL-PROJECT.vercel.app',
  'https://www.your-custom-domain.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
```

Do not use `Access-Control-Allow-Origin: *` for a public pairing endpoint. Keep the backend's existing session/database logic unchanged.

## 3. Deploy to Vercel

1. Upload the contents of this ZIP to a GitHub repository (the files must be at the repository root).
2. In Vercel, import that repository.
3. Framework Preset: **Other**.
4. Build Command: leave empty.
5. Output Directory: `.` (project root).
6. Deploy.

This is a static site; no Node build step or database is required on Vercel.

## 4. Test

1. Open the Vercel website.
2. Enter the WhatsApp number with country code, digits only.
3. Press **Generate pairing code**.
4. On the phone: WhatsApp → Linked devices → Link a device → Link with phone number.
5. Enter the code shown on the website.

## Important

- This frontend does not create a second WhatsApp socket or a separate session store. It calls the existing `EmpirePair()` flow through the existing `GET /?number=` route.
- Keep the Heroku/VPS backend online. Vercel only hosts the web page.
- Do not expose MongoDB URIs, admin passwords, or internal tokens in `config.js`.
- Add backend rate limiting to the pairing endpoint before making the site public. Restrict allowed CORS origins to your own Vercel domain.
- The current backend route can return `already_connected` when a number is already online. Pairing codes are only returned for numbers that need to register/link.
