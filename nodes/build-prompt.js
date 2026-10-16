// n8n Code node 1: build LLM request from webhook body
const body = $input.first().json.body || $input.first().json;
const text = String(body.requirement || '').slice(0, 4000);
if (!text.trim()) throw new Error('requirement is required');
const system = 'You are a freelance deployment engineer. Return ONLY JSON: {"summary":string,"deliverables":string[],"risks":string[],"package":"starter|plus","price_usd":number,"timeline_days":number}. Starter = $349 fixed (single repo, one env, 3-4 days). Plus = $899 fixed (adds CI/CD, custom domain, staging, 5-7 days). Use exactly these two prices.';
return [{ json: { client: body.client || 'unknown', llmRequest: { model: 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: text }] } } }];
