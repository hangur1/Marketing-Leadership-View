# Mercury Marketing · Leadership View (Live)

A holistic marketing leadership dashboard that pulls **live data from Asana** every page load, with a 5-minute cache on Vercel's edge.

---

## Repo structure

```
/
├── api/
│   └── projects.js       ← Vercel serverless function (fetches Asana)
├── public/
│   └── index.html        ← Dashboard UI
├── vercel.json           ← Routing config
└── README.md
```

---

## Deploy in 4 steps

### 1. Push to GitHub
Create a new GitHub repo and push all files as-is.

### 2. Import to Vercel
Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select your repo → click **Deploy**.

### 3. Add your Asana token
In Vercel, go to your project → **Settings** → **Environment Variables** → add:

| Name | Value |
|---|---|
| `ASANA_TOKEN` | your personal access token |

To get your Asana token:
1. Go to [app.asana.com](https://app.asana.com) → your profile picture → **My Settings**
2. **Apps** tab → **Developer Apps** → **Create new token**
3. Copy the token — paste it into Vercel

### 4. Redeploy
After adding the env variable, go to **Deployments** → click **Redeploy** on the latest deployment (so it picks up the token).

That's it — your dashboard is live.

---

## How it works

- `/api/projects.js` runs as a Vercel serverless function. It fetches all projects in parallel from the Asana REST API using your token (server-side only — the token is never exposed to the browser).
- Responses are cached for **5 minutes** at Vercel's edge (`Cache-Control: s-maxage=300`), so the page is fast even when Asana is slow.
- The dashboard auto-renders on load from the API response — no manual data entry needed.

---

## Updating which projects appear

Edit the `PROJECT_MANIFEST` array at the top of `api/projects.js`. Each entry has:

```js
{ 
  gid: '1234567890',       // Asana project GID (from the URL)
  name: 'Display name',    // What shows on the dashboard
  channel: 'launches',     // launches | perf | lifecycle | brand | social | events | ops
  tier: 'T1',              // T1 | T2 | Cross | Channel | etc.
  horizon: 'now',          // now | soon | future | planning | complete
}
```

To find a project's GID: open the project in Asana → look at the URL → it's the long number after `/project/`.

---

## Channels

| Channel | What it covers |
|---|---|
| `launches` | T1 + T2 product GTM |
| `perf` | Performance marketing, Growth Refresh, new channels |
| `lifecycle` | Email roadmap, lifecycle workstreams |
| `brand` | Brand Studio, design requests, guidelines |
| `social` | Organic social content calendars |
| `events` | Brand events (uses tasks from Brand Events project) |
| `ops` | Strat Ops infrastructure |
