/**
 * Vercel Serverless Function: /api/projects
 * Fetches live project + task data from Asana and returns
 * a structured JSON payload for the dashboard.
 *
 * Required env variable: ASANA_TOKEN
 */

const ASANA_BASE = 'https://app.asana.com/api/1.0';

// ─── Project manifest ────────────────────────────────────────────────────────
// Edit this list to add/remove/recategorize projects at any time.
const PROJECT_MANIFEST = [
  // LAUNCHES — T1
  { gid: '1211763087952569', name: 'Command',                        channel: 'launches', tier: 'T1',    horizon: 'now'     },
  { gid: '1211763087952579', name: 'Books',                          channel: 'launches', tier: 'T1',    horizon: 'now'     },
  { gid: '1211143532261078', name: 'Personal Banking',               channel: 'launches', tier: 'T1',    horizon: 'complete'},
  { gid: '1212248030221450', name: 'Payroll',                        channel: 'launches', tier: 'T1',    horizon: 'future'  },
  { gid: '1211763087952574', name: 'Spend Management + IO Launch',   channel: 'launches', tier: 'T1',    horizon: 'now'     },
  { gid: '1211540656653237', name: 'Insights',                       channel: 'launches', tier: 'T1',    horizon: 'complete'},
  // LAUNCHES — T2
  { gid: '1211763088111276', name: 'RTP',                            channel: 'launches', tier: 'T2',    horizon: 'now'     },
  { gid: '1211540379893085', name: '1099 Filing GTM',                channel: 'launches', tier: 'T2',    horizon: 'complete'},
  { gid: '1214110024504418', name: 'Trust Account',                  channel: 'launches', tier: 'T2',    horizon: 'planning'},
  { gid: '1211763088111306', name: 'Treasury Ladders',               channel: 'launches', tier: 'T2',    horizon: 'future'  },
  { gid: '1213405959763815', name: 'Security Week Campaign',         channel: 'launches', tier: 'T2',    horizon: 'now'     },
  { gid: '1211763088111294', name: 'Insights V2 2026',               channel: 'launches', tier: 'T2',    horizon: 'planning'},
  { gid: '1213104973335475', name: 'Receipt Texting & Gmail',        channel: 'launches', tier: 'T2',    horizon: 'now'     },
  { gid: '1211763088111300', name: 'SaaS 2026',                      channel: 'launches', tier: 'T2',    horizon: 'planning'},
  { gid: '1211666357665546', name: 'Checkbooks Product Launch',      channel: 'launches', tier: 'T2',    horizon: 'complete'},
  { gid: '1211763088111282', name: 'Subscription Management 2026',   channel: 'launches', tier: 'T2',    horizon: 'planning'},
  // PERFORMANCE MARKETING
  { gid: '1213230592066421', name: 'Growth Marketing Refresh',       channel: 'perf',     tier: 'Cross', horizon: 'now'     },
  { gid: '1212983183477758', name: 'Meta',                           channel: 'perf',     tier: 'Chan',  horizon: 'now'     },
  { gid: '1211952376017962', name: 'Paid Search',                    channel: 'perf',     tier: 'Chan',  horizon: 'now'     },
  { gid: '1213954193960599', name: 'New Channel Testing',            channel: 'perf',     tier: 'Test',  horizon: 'soon'    },
  { gid: '1212932269547543', name: 'Performance Marketing Roadmap',  channel: 'perf',     tier: 'Road',  horizon: 'now'     },
  // LIFECYCLE
  { gid: '1212908514911104', name: '2026 Email Roadmap',             channel: 'lifecycle',tier: 'Road',  horizon: 'now'     },
  // BRAND STUDIO
  { gid: '1214142079866508', name: 'Open Brand Studio Work',         channel: 'brand',    tier: 'Studio',horizon: 'now'     },
  { gid: '1203406522483558', name: 'Brand Design Requests',          channel: 'brand',    tier: 'Intake',horizon: 'now'     },
  { gid: '1204836487815183', name: 'Brand Guidelines',               channel: 'brand',    tier: 'Internal',horizon:'now'    },
  // ORGANIC SOCIAL
  { gid: '1212884248653453', name: 'Social Content Calendar',        channel: 'social',   tier: 'Chan',  horizon: 'now'     },
  // EVENTS
  { gid: '1208559134629831', name: 'Brand Event Requests',           channel: 'events',   tier: 'Events',horizon: 'now'     },
  // STRAT OPS
  { gid: '1213143543009016', name: 'Marketing Ops Roadmap',          channel: 'ops',      tier: 'Ops',   horizon: 'now'     },
  { gid: '1212688312350374', name: 'Copywriting Review Calendar',    channel: 'ops',      tier: 'Ops',   horizon: 'now'     },
];

// ─── Asana fetch helper ──────────────────────────────────────────────────────
async function asanaFetch(path) {
  const token = process.env.ASANA_TOKEN_1;
  if (!token) throw new Error('ASANA_TOKEN_1 environment variable is not set');

  const res = await fetch(`${ASANA_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Asana-Enable': 'new_user_task_lists',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.data;
}

// ─── Fetch one project + its incomplete tasks ────────────────────────────────
async function fetchProject(manifest) {
  try {
    const [projectData, tasks] = await Promise.all([
      asanaFetch(`/projects/${manifest.gid}?opt_fields=name,gid,permalink_url,completed,due_on,start_on,num_tasks,num_incomplete_tasks,num_completed_tasks,current_status`),
      asanaFetch(`/projects/${manifest.gid}/tasks?opt_fields=name,gid,completed,due_on,assignee.name&limit=100&completed_since=now`),
    ]);

    const incompleteTasks = tasks.filter(t => !t.completed);
    const completedCount = (projectData.num_completed_tasks ?? 0);
    const totalCount = (projectData.num_tasks ?? 0);
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Sort incomplete by due date
    const sorted = incompleteTasks.sort((a, b) => {
      if (!a.due_on && !b.due_on) return 0;
      if (!a.due_on) return 1;
      if (!b.due_on) return -1;
      return a.due_on.localeCompare(b.due_on);
    });

    // Derive status
    let status;
    if (pct === 100) status = 'complete';
    else if (totalCount === 0) status = 'not_started';
    else if (pct >= 60) status = 'on_track';
    else if (pct > 0 || incompleteTasks.length > 0) status = 'in_progress';
    else status = 'not_started';

    // Override for planning horizon
    if (manifest.horizon === 'planning' && status === 'not_started') status = 'planning';
    if (manifest.horizon === 'complete') status = 'complete';

    return {
      gid: manifest.gid,
      name: manifest.name,
      channel: manifest.channel,
      tier: manifest.tier,
      horizon: manifest.horizon,
      url: projectData.permalink_url,
      total_tasks: totalCount,
      completed_tasks: completedCount,
      incomplete_tasks: incompleteTasks.length,
      pct_complete: pct,
      status,
      current_status: projectData.current_status?.text ?? null,
      due_on: projectData.due_on,
      upcoming_tasks: sorted.slice(0, 4).map(t => ({
        name: t.name,
        due: t.due_on ?? null,
        assignee: t.assignee?.name ?? null,
      })),
    };
  } catch (err) {
    // Return a degraded entry rather than breaking the whole page
    return {
      gid: manifest.gid,
      name: manifest.name,
      channel: manifest.channel,
      tier: manifest.tier,
      horizon: manifest.horizon,
      url: `https://app.asana.com/0/${manifest.gid}`,
      total_tasks: 0,
      completed_tasks: 0,
      incomplete_tasks: 0,
      pct_complete: 0,
      status: 'unknown',
      error: err.message,
      upcoming_tasks: [],
    };
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Cache for 5 minutes on Vercel's edge
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Fetch all projects in parallel
    const projects = await Promise.all(PROJECT_MANIFEST.map(fetchProject));

    res.status(200).json({
      ok: true,
      fetched_at: new Date().toISOString(),
      projects,
    });
  } catch (err) {
    console.error('Fatal error in /api/projects:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
