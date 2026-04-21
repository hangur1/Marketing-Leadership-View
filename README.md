# Mercury Marketing · Leadership View

A holistic marketing leadership dashboard for Rachel showing everything in flight and on the horizon — organized by channel, not just by tier.

## Structure

The dashboard is organized into 7 sections:

| Section | What it covers |
|---|---|
| **Launches (T1/T2)** | All product GTM — in flight, wrapping up, and planning |
| **Performance Marketing** | Paid channels, Growth Refresh, new channel tests |
| **Lifecycle** | Email roadmap, Growth Refresh lifecycle workstream, upcoming builds |
| **Brand Studio** | Open studio work, design requests, brand guidelines |
| **Organic Social** | Business + Personal content calendars |
| **Events** | All upcoming brand events (Apr–May) |
| **Strat Ops** | Infrastructure, workflows, DAM, copywriting reviews |

## Horizon filters

The top nav lets Rachel filter by time horizon:
- **Now** — active work due Apr–May
- **Soon** — Jun–Aug
- **Future** — Sep+
- **Planning** — not yet started / scoping

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import from GitHub
3. Select this repo → **Deploy**

Zero config needed. Static site, no build step.

## Updating data

All project data is hardcoded in `index.html`. To refresh:
- Update task counts, percentages, and `proj-next` descriptions per project
- Add/remove event cards in the events section
- Adjust horizon badges as timelines shift

For live Asana sync, the next step would be a lightweight API route that fetches from the Asana API on load.
