import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4193);
const files=new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/app.js','app.js'],['/model.js','model.js'],['/icon.svg','icon.svg'],['/qa/viewport.html','qa/viewport.html'],['/qa/print-example.html','qa/print-example.html']]);
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'};
http.createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname;const file=files.get(path);if(!file){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}try{const body=await readFile(join(root,file));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(500);res.end('Could not read application file');}}).listen(port,'127.0.0.1',()=>console.log(`Turnside running at http://127.0.0.1:${port}`));
