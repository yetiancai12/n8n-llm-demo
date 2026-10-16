// n8n Code node 2: parse LLM reply into a quote draft (always a DRAFT for human review)
const client = $('Build Prompt').first().json.client;
const raw = $input.first().json.choices[0].message.content;
let q;
try { q = JSON.parse(raw); } catch (e) { throw new Error('LLM returned non-JSON'); }
// Prices follow the service page: Starter $349 / Plus $899. Legacy label 'advanced' is treated as Plus.
const PRICES = { starter: 349, plus: 899 };
let pkg = String(q.package || '').toLowerCase();
if (pkg === 'advanced') pkg = 'plus';
let price;
if (PRICES[pkg]) { price = PRICES[pkg]; }
else { price = Math.min(Math.max(Number(q.price_usd) || 0, 349), 899); pkg = price >= 899 ? 'plus' : 'starter'; }
return [{ json: { status: 'draft', client, summary: q.summary, deliverables: q.deliverables || [], risks: q.risks || [], package: pkg, price_usd: price, timeline_days: q.timeline_days, note: 'AI-generated draft. Review before sending to client.' } }];
