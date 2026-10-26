/* V44: a single world camera responds to the full page, including commercial sections.
 * All visible stages are views of the same DOM scene; no tunnel, no isolated effect.
 */
(()=>{'use strict';
const root=document.documentElement,world=document.getElementById('v44World'),journey=document.getElementById('portal');
if(!world||!journey)return;
const chapters=[...journey.querySelectorAll('.v44-chapter')],scenes=['top','concept','portal','club','residency','numbers','join'].map(id=>document.getElementById(id));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{let p=clamp((v-a)/(b-a),0,1);return p*p*(3-2*p)};
let frame=0,paused=false,last=0,soft=0,mouseX=0,mouseY=0;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const keys=[
 {t:0,scale:.85,x:0,y:0,yaw:-16,pitch:8,roll:-11,statue:1,statuescale:1,statuex:0,statuey:0,bright:1},
 {t:.13,scale:.95,x:-35,y:3,yaw:-23,pitch:6,roll:-4,statue:.31,statuescale:.74,statuex:130,statuey:-23,bright:1.07},
 {t:.25,scale:1.06,x:55,y:-4,yaw:-6,pitch:2,roll:4,statue:.0,statuescale:.68,statuex:150,statuey:-45,bright:1.12},
 {t:.43,scale:1.18,x:90,y:-9,yaw:20,pitch:-8,roll:11,statue:0,statuescale:.65,statuex:160,statuey:-45,bright:1.14},
 {t:.60,scale:1.10,x:50,y:9,yaw:-17,pitch:5,roll:-9,statue:0,statuescale:.68,statuex:145,statuey:-20,bright:1.05},
 {t:.76,scale:.92,x:28,y:2,yaw:-33,pitch:2,roll:5,statue:.08,statuescale:.70,statuex:130,statuey:0,bright:1.04},
 {t:.90,scale:.88,x:65,y:8,yaw:16,pitch:-8,roll:-5,statue:.18,statuescale:.80,statuex:95,statuey:8,bright:1.0},
 {t:1,scale:.98,x:40,y:1,yaw:-13,pitch:5,roll:0,statue:.50,statuescale:.77,statuex:72,statuey:0,bright:1.1}
];
function interpolate(p){let a=keys[0],b=keys[keys.length-1];for(let i=1;i<keys.length;i++){if(p<=keys[i].t){a=keys[i-1];b=keys[i];break}}
 const q=smooth(0,1,clamp((p-a.t)/(b.t-a.t),0,1));let value={};for(let k of Object.keys(a))if(k!=='t')value[k]=lerp(a[k],b[k],q);return value;}
function sceneProgress(){const scroll=window.scrollY,vh=innerHeight;
 const c=scenes.map(x=>x?x.getBoundingClientRect().top+scroll:scroll);const marks=[0,...c.slice(1),Math.max(scroll,c[6]+scenes[6].offsetHeight-vh)];
 const track=[0,.13,.23,.60,.72,.85,.94,1];
 let prog=0;for(let i=1;i<marks.length;i++){
 if(scroll<=marks[i]||i===marks.length-1){prog=lerp(track[i-1],track[i],clamp((scroll-marks[i-1])/Math.max(1,marks[i]-marks[i-1]),0,1));break}}
 return clamp(prog,0,1);
}
function update(ts){frame=0;const dt=last?Math.min(.08,(ts-last)/1000):.02;last=ts;
 const target=sceneProgress();soft+= (target-soft)*Math.min(1,dt*(reduce||paused?40:5.7));
 const p=reduce||paused?target:soft;
 const d=interpolate(p),idle=(reduce||paused)?0:Math.sin(ts*.00033)*7;
 const px=(reduce||paused)?0:mouseX*13,py=(reduce||paused)?0:mouseY*7;
 world.style.setProperty('--v44-x',(d.x+px*.45)+'px');world.style.setProperty('--v44-y',(d.y+idle+py*.3)+'px');
 world.style.setProperty('--v44-yaw',(d.yaw+mouseX*4)+'deg');world.style.setProperty('--v44-pitch',(d.pitch+mouseY*2)+'deg');
 world.style.setProperty('--v44-roll',d.roll+'deg');world.style.setProperty('--v44-scale',d.scale);
 world.style.setProperty('--v44-bright',d.bright);world.style.setProperty('--v44-photo-opacity',(p<.1?.31:p<.62?.62:p<.83?.17:.3).toFixed(2));
 world.style.setProperty('--v44-statue-opacity',d.statue.toFixed(3));world.style.setProperty('--v44-statue-scale',d.statuescale);
 world.style.setProperty('--v44-statue-x',d.statuex+'px');world.style.setProperty('--v44-statue-y',(d.statuey-idle*.30)+'px');
 root.style.setProperty('--v44-scroll',p.toFixed(4));root.style.setProperty('--v44-pan',(mouseX*16).toFixed(2));
 const rect=journey.getBoundingClientRect(),h=Math.max(1,journey.offsetHeight-innerHeight),j=clamp(-rect.top/h,0,1);
 const alpha=[1-smooth(.17,.28,j),smooth(.17,.28,j)*(1-smooth(.42,.54,j)),smooth(.42,.54,j)*(1-smooth(.67,.79,j)),smooth(.67,.79,j)];
 chapters.forEach((item,i)=>{const a=alpha[i];
 item.style.setProperty('--v44-chapter-alpha',a.toFixed(3));
 item.style.setProperty('--v44-chapter-blur',((1-a)*5).toFixed(2)+'px');
 item.style.setProperty('--v44-chapter-offset',((1-a)*15).toFixed(2)+'px');
 item.querySelectorAll('a,button').forEach(el=>{el.tabIndex=a>.4?0:-1;el.style.pointerEvents=a>.4?'auto':'none'});
 });
 journey.style.setProperty('--v44-journey-fill',Math.round(j*100)+'%');
 if(!reduce&&!paused&&!document.hidden){frame=requestAnimationFrame(update)}
}
const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
addEventListener('pointermove',e=>{mouseX=e.clientX/Math.max(1,innerWidth)-.5;mouseY=e.clientY/Math.max(1,innerHeight)-.5;if(reduce||paused)schedule()},{passive:true});
addEventListener('sandow:motion',e=>{paused=!!e.detail.paused;schedule()});
addEventListener('visibilitychange',schedule);schedule();
})();
