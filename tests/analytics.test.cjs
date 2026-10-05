const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('analytics.js', 'utf8');
function run(savedConsent) {
  const scripts = [];
  const handlers = {};
  const banner = { setAttribute() {}, addEventListener(type, callback) { handlers.banner = callback; }, querySelector() { return { focus() {} }; } };
  const context = {
    window: {}, location: { origin: 'https://robodev.online', pathname: '/', hostname: 'robodev.online', reload() {} },
    localStorage: { getItem() { return savedConsent; }, setItem() {} },
    document: {
      cookie: '',
      createElement(type) { return type === 'section' ? banner : { type }; },
      head: { appendChild(element) { if (element.type === 'script') scripts.push(element); } },
      body: { appendChild() {} }, getElementById() { return null; },
      addEventListener() {}, querySelector() { return null; }
    }
  };
  vm.runInNewContext(source, context);
  return { scripts, context, handlers, banner };
}
test('No analytics requests before consent or after rejection', () => {
  for (const choice of [null, 'rejected']) assert.equal(run(choice).scripts.length, 0);
});
test('Accepting loads one GA tag and keeps advertising consent denied', () => {
  const state = run(null);
  state.handlers.banner({ target: { closest() { return { dataset: { consent: 'accepted' } }; } } });
  assert.equal(state.scripts.length, 1);
  assert.match(state.scripts[0].src, /G-9TM5P8R1MW/);
  const commands = state.context.window.dataLayer.map(args => Array.from(args));
  assert.equal(commands[0][2].ad_storage, 'denied');
  assert.equal(commands.find(args => args[0] === 'config')[2].page_location, 'https://robodev.online/');
});
test('Saved consent starts analytics; withdrawing disables collection', () => {
  const state = run('accepted');
  assert.equal(state.scripts.length, 1);
  state.handlers.banner({ target: { closest() { return { dataset: { consent: 'rejected' } }; } } });
  assert.equal(state.context.window['ga-disable-G-9TM5P8R1MW'], true);
});
