/* V45: selected tariff expands INSIDE its own card, never in a duplicate lower panel. */
(()=>{'use strict';
const cards=[...document.querySelectorAll('.tier-card[data-tier]')];
if(!cards.length)return;
let selected=null;
function choose(key){
 const next=selected===key?null:key;
 selected=next;
 for(const card of cards){
  const active=card.dataset.tier===next;
  if(active)card.dataset.selected='true';else card.removeAttribute('data-selected');
  card.setAttribute('aria-expanded',String(active));
  const button=card.querySelector('.tier-select');
  if(button){
   button.setAttribute('aria-expanded',String(active));
   button.textContent=active?'Свернуть условия ':'Подробнее о формате ';
   const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent=active?'×':'＋';button.append(arrow);
  }
  const details=card.querySelector('.tier-inline-details');if(details)details.hidden=!active;
 }
}
for(const card of cards){
 const btn=card.querySelector('.tier-select');
 btn?.addEventListener('click',()=>choose(card.dataset.tier));
 card.addEventListener('click',e=>{
  if(e.target.closest('button,a'))return;
  choose(card.dataset.tier);
 });
 card.addEventListener('keydown',e=>{
  if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choose(card.dataset.tier);}
 });
}
// No tariff is preselected: visitors choose which conditions to reveal.
choose('__none__');
})();
