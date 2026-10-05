import { readFileSync, existsSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
const html=readFileSync('app.html','utf8');
for(const feature of ['karaokeView','diagnosticView','liveModeView','rhythmView','exerciseView','learning-path','pedagogy/'])assert(!html.includes(feature),feature+' must be removed');
for(const area of ['readingView','gamesView','tasksView','printablesView','songView','soundBubblesView'])assert(html.includes('id="'+area+'"'),area+' missing');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const path of ['assets/karaoke','assets/pedagogy','assets/live','api/midi-score.js','api/sightreading-progress.js','super-paw-paw.html','paw-paw-notas.html','atelie-musical.html'])assert(!existsSync(path),path+' retained');
for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g))assert(existsSync(match[1].slice(1)),match[1]+' missing');
function syntax(path){execFileSync(process.execPath,['--check',path]);}
function walk(path){for(const name of readdirSync(path,{withFileTypes:true})){const p=path+'/'+name.name;if(name.isDirectory())walk(p);else if(p.endsWith('.js'))syntax(p)}}walk('assets');walk('api');
const source=readFileSync('assets/simple-core.js','utf8');const songsSource=source.slice(source.indexOf('const songs='),source.indexOf("let songKey="));
const songs=vm.runInNewContext(songsSource+';songs');
for(const [key,song] of Object.entries(songs))for(const hand of ['right','left'])for(const bar of song[hand]||[])assert(Math.abs(bar.reduce((sum,n)=>sum+n.d,0)-song.meter[0])<.001,key+' has invalid measure');
const illustrated=Object.values(songs).filter(song=>song.illustrated);
assert.equal(illustrated.length,5);
for(const song of illustrated){
 const notes=song.right.flat();
 assert(notes.every(note=>typeof note.lyric==='string'&&note.lyric.length>0),song.title+' has missing syllables');
 assert(new Set(notes.map(note=>note.n)).size<=5,song.title+' exceeds beginner range');
}
assert.equal(JSON.parse(readFileSync('data/requested-repertoire.json')).length,200);
console.log('Simplified app: routes, deleted features, assets, JavaScript and score measures verified.');
