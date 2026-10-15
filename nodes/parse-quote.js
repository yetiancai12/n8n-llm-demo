// n8n Code node 2: parse LLM reply into a quote draft (always a DRAFT for human review)
const client = $('Build Prompt').first().json.client;
const raw = $input.first().json.choices[0].message.content;
let q;
try { q = JSON.parse(raw); } catch (e) { throw new Error('LLM returned non-JSON'); }
const price = Math.min(Math.max(Number(q.price_usd) || 0, 350), 1200);
return [{ json: { status: 'draft', client, summary: q.summary, deliverables: q.deliverables || [], risks: q.risks || [], package: q.package, price_usd: price, timeline_days: q.timeline_days, note: 'AI-generated draft. Review before sending to client.' } }];
