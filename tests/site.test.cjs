const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index','studio','capabilities','process','explorations','contact','privacy'];
for(const page of pages) test(`${page}: internal links, IDs and SEO`,()=>{
  const html=fs.readFileSync(path.join(root,page+'.html'),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'IDs must be unique');
  for(const [,href] of html.matchAll(/\bhref="([^"]+)"/g)){
    if(/^(https?:|mailto:)/.test(href))continue;
    const [file,anchor]=href.split('#');
    const target=file?path.join(root,file):path.join(root,page+'.html');
    assert.ok(fs.existsSync(target),`Missing link: ${href}`);
    if(anchor)assert.ok(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`),`Missing anchor: ${href}`);
  }
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes('id="cookie-settings"'));
  assert.ok(html.includes('src="/analytics.js"'));
});
