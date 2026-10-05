import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const allowed = new Set(['index.html','studio.html','capabilities.html','process.html','explorations.html','contact.html','privacy.html','site.css','site.js','analytics.js','contact.js','favicon.svg','robots.txt','sitemap.xml']);
const types = {html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml',xml:'application/xml',txt:'text/plain'};
http.createServer(async (req,res) => {
  const path = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if(path==='contact.php'){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({success:false,message:'Contact submissions are available on the published site.'}));return;}
  if(!allowed.has(path)){res.writeHead(404);res.end('Not found');return;}
  try { const body=await readFile(resolve(root,path));res.writeHead(200,{'Content-Type':types[path.split('.').pop()]+'; charset=utf-8','Cache-Control':'no-store'});res.end(body); }
  catch {res.writeHead(404);res.end('Not found');}
}).listen(4178,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4178'));

