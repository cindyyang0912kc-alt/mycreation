import {build} from 'esbuild';
import {cpSync,mkdirSync,writeFileSync} from 'node:fs';
await build({entryPoints:['scripts/qr-entry.cjs'],bundle:true,minify:true,platform:'browser',outfile:'public/qr.js'});
mkdirSync('dist',{recursive:true});
for(const file of ['index.html','app.js','style.css','demo.js','catalog.js','qr.js'])cpSync('public/'+file,'dist/'+file);
writeFileSync('dist/.nojekyll','');
console.log('Static H5 ready in dist/. No backend, secrets or accounts required.');
