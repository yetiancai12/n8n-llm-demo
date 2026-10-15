// Generates workflow.json from nodes/*.js
const fs = require('fs');
const code = f => fs.readFileSync(__dirname + '/nodes/' + f, 'utf8');
const wf = {
  name: 'Client Requirement -> Summary + Quote Draft',
  nodes: [
    { parameters: { httpMethod: 'POST', path: 'quote-draft', responseMode: 'responseNode' }, id: 'n1', name: 'Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2, position: [0, 0], webhookId: 'quote-draft-demo' },
    { parameters: { jsCode: code('build-prompt.js') }, id: 'n2', name: 'Build Prompt', type: 'n8n-nodes-base.code', typeVersion: 2, position: [220, 0] },
    { parameters: { method: 'POST', url: '={{ $env.LLM_BASE_URL || "https://api.openai.com/v1" }}/chat/completions', sendHeaders: true, headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer {{PLACEHOLDER_LLM_API_KEY}}' }] }, sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.llmRequest) }}' }, id: 'n3', name: 'Call LLM', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [440, 0] },
    { parameters: { jsCode: code('parse-quote.js') }, id: 'n4', name: 'Parse Quote', type: 'n8n-nodes-base.code', typeVersion: 2, position: [660, 0] },
    { parameters: { respondWith: 'json', responseBody: '={{ $json }}' }, id: 'n5', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: [880, 0] }
  ],
  connections: {
    'Webhook': { main: [[{ node: 'Build Prompt', type: 'main', index: 0 }]] },
    'Build Prompt': { main: [[{ node: 'Call LLM', type: 'main', index: 0 }]] },
    'Call LLM': { main: [[{ node: 'Parse Quote', type: 'main', index: 0 }]] },
    'Parse Quote': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }
};
fs.writeFileSync(__dirname + '/workflow.json', JSON.stringify(wf, null, 2));
console.log('workflow.json written');
