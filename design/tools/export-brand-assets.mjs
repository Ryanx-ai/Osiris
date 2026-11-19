// npm install --prefix /tmp/osiris-brand-tools sharp@0.34.5
// OSIRIS_BRAND_TOOLS=/tmp/osiris-brand-tools node design/tools/export-brand-assets.mjs
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const sharp=createRequire(resolve(process.env.OSIRIS_BRAND_TOOLS||process.cwd(),'package.json'))('sharp');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=resolve(root,'brand-assets');const out=resolve(base,'exports');await mkdir(out,{recursive:true});
const full=await readFile(resolve(base,'masters/osiris-logo.svg'),'utf8');
const mark=await readFile(resolve(base,'masters/osiris-mark.svg'),'utf8');
for(const svg of [full,mark])if(/<(script|foreignObject|image|text)\b|(?:href|onload|onclick)=/i.test(svg))throw Error('Unexpected active, raster or font-dependent source');
const paths=full.match(/<path\b[^>]*\/>/g);if(paths?.length!==4)throw Error('Unexpected logo structure');
const inner=s=>s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const wrap=(body,w,h)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
// The third path is the supplied outlined wordmark. Crop its viewport, never redraw type.
const word=`<svg xmlns="http://www.w3.org/2000/svg" width="704" height="118" viewBox="393 83 704 118">${paths[2]}</svg>`;
const square=(size,occupancy=.86)=>{const w=size*occupancy,h=w*283/307;return wrap(`<rect width="${size}" height="${size}" fill="#000000"/><svg x="${(size-w)/2}" y="${(size-h)/2}" width="${w}" height="${h}" viewBox="0 0 307 283">${inner(mark)}</svg>`,size,size);};
const results=[];
async function save(name,data){await writeFile(resolve(out,name),data);results.push({file:name,bytes:Buffer.byteLength(data),sha256:createHash('sha256').update(data).digest('hex')});}
async function png(name,svg,width){const b=await sharp(Buffer.from(svg),{density:288}).resize({width}).png().toBuffer();await save(name,b);return b;}
await save('osiris-logo.svg',full);await save('osiris-mark.svg',mark);await save('osiris-wordmark.svg',word);
for(const width of [160,240,320,480,640,960]){await png(`osiris-logo-${width}.png`,full,width);await png(`osiris-wordmark-${width}.png`,word,width);}
for(const n of [24,32,48,64,128,256,512,1024]){const w=n*.86,h=w*283/307;await png(`osiris-mark-${n}.png`,wrap(`<svg x="${(n-w)/2}" y="${(n-h)/2}" width="${w}" height="${h}" viewBox="0 0 307 283">${inner(mark)}</svg>`,n,n),n);}
const favicon=square(64);await save('favicon.svg',favicon);
const ico=[];
for(const n of [16,32,48])ico.push({n,bytes:await png(`favicon-${n}.png`,square(n),n)});
const header=Buffer.alloc(6+ico.length*16);header.writeUInt16LE(1,2);header.writeUInt16LE(ico.length,4);let offset=header.length;
ico.forEach(({n,bytes},i)=>{const p=6+i*16;header[p]=n;header[p+1]=n;header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(bytes.length,p+8);header.writeUInt32LE(offset,p+12);offset+=bytes.length;});
await save('favicon.ico',Buffer.concat([header,...ico.map(x=>x.bytes)]));
for(const [name,n,occ] of [['apple-touch-icon.png',180,.78],['icon-192.png',192,.78],['icon-512.png',512,.78],['icon-maskable-512.png',512,.56],['social-avatar-400.png',400,.78],['social-avatar-1080.png',1080,.78]])await png(name,square(n,occ),n);
const og=wrap(`<rect width="1200" height="630" fill="#000000"/><svg x="140" y="192" width="920" height="238" viewBox="0 0 1095 283">${inner(full)}</svg>`,1200,630);await save('open-graph.svg',og);await png('open-graph.png',og,1200);
await writeFile(resolve(base,'asset-manifest.json'),JSON.stringify({source:'Founder-supplied SVG exports, 19 November 2026',logoOrange:'#FF5100',logoCyan:'#00FFE1',logoWhite:'#FFFFFF',wordmark:'Original outlined paths; typeface unspecified',files:results},null,2)+'\n');
await writeFile(resolve(root,'../prototype/assets/favicon.svg'),favicon);
for (const name of ['favicon.ico','apple-touch-icon.png']) await writeFile(resolve(root,'../prototype/assets',name),await readFile(resolve(out,name)));
await writeFile(resolve(root,'../prototype/assets/osiris-logo.svg'),full);
await writeFile(resolve(root,'assets/osiris-mark.svg'),mark);
await writeFile(resolve(root,'assets/osiris-logo.svg'),full);
console.log(`Exported ${results.length} assets from original paths`);
