// Local simulation: mock LLM server + run the workflow's real Code-node sources + a minimal chain executor.
const http = require('http'), fs = require('fs'), assert = require('assert');
const wf = JSON.parse(fs.readFileSync(__dirname + '/workflow.json'));
const input = JSON.parse(fs.readFileSync(__dirname + '/sample-input.json'));
const mock = http.createServer((req, res) => {
  let b = ''; req.on('data', d => b += d); req.on('end', () => {
    const r = JSON.parse(b); assert(r.messages.length === 2 && r.response_format);
    const reply = { summary: 'Deploy a single Node API on Render with auto-deploy, staging, custom HTTPS domain and handover doc.', deliverables: ['render.yaml','GitHub Actions CI','staging service','custom domain + HTTPS','handover doc'], risks: ['DNS access needed from client'], package: 'advanced', price_usd: 950, timeline_days: 6 };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(reply) } }] }));
  });
}).listen(0, async () => {
  const run = (name, items, ctx) => new (Object.getPrototypeOf(async () => {}).constructor)('$input', '$', ctx, wf.nodes.find(n => n.name === name).parameters.jsCode);
  const state = {};
  const $ = n => ({ first: () => state[n][0] });
  const exec = async name => {
    const fn = run(name); return fn({ first: () => prev[0] }, $, null);
  };
  let prev = [{ json: { body: input } }];
  prev = await exec('Build Prompt'); state['Build Prompt'] = prev.map(x => x);
  // adapt: .first().json
  const llmReq = prev[0].json.llmRequest;
  const r = await fetch(`http://127.0.0.1:${mock.address().port}/chat/completions`, { method: 'POST', body: JSON.stringify(llmReq) });
  prev = [{ json: await r.json() }];
  const out = await exec('Parse Quote');
  console.log(JSON.stringify(out[0].json, null, 2));
  assert.equal(out[0].json.status, 'draft'); assert(out[0].json.price_usd >= 350 && out[0].json.price_usd <= 1200);
  fs.writeFileSync(__dirname + '/sample-output.json', JSON.stringify(out[0].json, null, 2));
  // negative: empty requirement
  prev = [{ json: { body: {} } }];
  await exec('Build Prompt').then(() => { throw new Error('should fail'); }, e => console.log('empty input rejected:', e.message));
  console.log('SIMULATION PASSED'); mock.close();
});
