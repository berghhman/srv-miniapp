/* SRV Detailing — сайт: интерфейс. Логика расчёта — в core.js (общая с мини-аппом). */
const CONFIG = {
  /* воркер srv-bot: заявки с сайта уходят менеджеру в Telegram */
  leadEndpoint: 'https://srv-bot.aldiksema.workers.dev',
  manager: 'srv_roman',
  phone: '+7 (812) 372-98-11', phoneHref: 'tel:+78123729811'
};
const MEDIA = window.SRV_MEDIA || {services:{},works:[],videos:[],blog:[],team:[],studio:[],packages:{},brand:{},icons:{}};
const M = p => p ? (/^https?:/.test(p) ? p : ROOT + p) : '';
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const store = {
  get(k,d){ try{ const v=localStorage.getItem('srvsite_'+k); return v?JSON.parse(v):d }catch(e){ return d } },
  set(k,v){ try{ localStorage.setItem('srvsite_'+k, JSON.stringify(v)) }catch(e){} }
};
const state = {
  ppf:{ sel:{hood:2, fenderF:1, headlights:1, mirrors:1}, mode:'custom', finish:'gloss', filmColor:3, heat:false },
  cart: store.get('cart', []), tintLevel:15, tintZone:'rear', src: ''
};
const IC = {
  plus:'<path d="M12 5v14M5 12h14"/>', check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', x:'<path d="M7 7l10 10M17 7L7 17"/>',
  play:'<path d="M7 4.5v15l13-7.5z"/>', chev:'<path d="M9 6l6 6-6 6"/>', chevl:'<path d="M15 6l-6 6 6 6"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  tg:'<path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M10 13l11-10"/>', cal:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  pin:'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3.5-5-1.2C7 8 9.5 8 12 8zM12 8c1.5-3 5-3.5 5-1.2C17 8 14.5 8 12 8z"/>',
  car:'<path d="M4 15l1.5-5A2 2 0 0 1 7.4 8.6h9.2a2 2 0 0 1 1.9 1.4L20 15"/><rect x="3" y="15" width="18" height="4" rx="1.5"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>', polish:'<circle cx="12" cy="13" r="6"/><path d="M12 7V3M9 3h6"/>',
  seat:'<path d="M7 3h6a2 2 0 0 1 2 2v8H7z"/><path d="M5 13h12l1 4H6z"/><path d="M7 17v4M16 17v4"/>', shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  wave:'<path d="M3 12h2l2-5 3 10 3-12 3 14 2-7h3"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>'
};
const ico = (k, cls='ic') => `<svg class="${cls}" viewBox="0 0 24 24">${IC[k]||''}</svg>`;
const I_PLUS = ico('plus'), I_CHECK = ico('check'), I_X = ico('x');
const img = (src, alt='', cls='', extra='') => src ? `<img ${cls?`class="${cls}"`:''} src="${M(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>` : '';
const mmss = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
const blogUrl = s => `https://srv-auto.ru/${s}/`;
let toastT;
function toast(msg){ const t=$('#toast'); if(!t) return; t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),2400); }
function goal(name, params){ try{ if(window.ym && window.SRV_METRIKA) ym(window.SRV_METRIKA,'reachGoal',name,params) }catch(e){} }

/* ---------- шапка ---------- */
function updateStatus(){
  const n=mskNow(); const open = n.wd>=1 && n.wd<=6 && n.h>=10 && n.h<20;
  const txt = open ? 'Открыто до 20:00' : (n.wd===0 || (n.wd===6 && n.h>=20)) ? 'Вс — по записи' : n.h<10 ? 'Откроемся в 10:00' : 'Завтра с 10:00';
  $$('[data-status]').forEach(el=> el.innerHTML = `<i class="dot ${open?'':'off'}"></i>${txt}`);
}
function initHeader(){
  const b=$('#burger'), mn=$('#mnav');
  b && b.addEventListener('click',()=>{ const on=mn.hidden; mn.hidden=!on; b.setAttribute('aria-expanded',on); document.body.style.overflow=on?'hidden':''; });
  $$('.dd>button').forEach(btn=>btn.addEventListener('click',()=>btn.parentElement.classList.toggle('open')));
  document.addEventListener('click',e=>{ if(!e.target.closest('.dd')) $$('.dd.open').forEach(d=>d.classList.remove('open')); });
  const pb=$('#promo-bar');
  if(pb){ if(store.get('promoClosed','')===PROMO_END.toISOString() || PROMO_END<Date.now()) pb.hidden=true;
    $('#promo-x') && $('#promo-x').addEventListener('click',()=>{ pb.hidden=true; store.set('promoClosed',PROMO_END.toISOString()); }); }
  updateStatus(); setInterval(updateStatus,60000);
}
function countdown(){
  const ms=PROMO_END-Date.now(); if(ms<=0){ $$('[data-promo]').forEach(e=>e.hidden=true); return; }
  const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5), m=Math.floor(ms%36e5/6e4), s=Math.floor(ms%6e4/1e3);
  $$('[data-cdn]').forEach(e=> e.textContent = `${d} ${plural(d,'день','дня','дней')} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
  const cell=(v,l)=>`<div><b class="num">${String(v).padStart(2,'0')}</b><span>${l}</span></div>`;
  $$('[data-cd]').forEach(e=> e.innerHTML = cell(d,'дней')+cell(h,'часов')+cell(m,'минут')+cell(s,'секунд'));
}

/* ---------- корзина и запись ---------- */
function inCart(id){ return state.cart.some(i=>i.id===id) }
function saveCart(){ store.set('cart',state.cart); updateBadge(); }
function addCart(item, silent){ const i=state.cart.findIndex(x=>x.id===item.id); if(i>=0) state.cart[i]=item; else state.cart.push(item); saveCart(); if(!silent) toast('Добавлено в запись'); goal('add_to_cart',{id:item.id}); }
function removeCart(id){ state.cart=state.cart.filter(i=>i.id!==id); saveCart(); }
function cartTotal(){ return state.cart.reduce((s,i)=>s+(i.price||0),0) }
function updateBadge(){ $$('[data-badge]').forEach(b=>{ b.hidden=!state.cart.length; b.textContent=state.cart.length; }); }
function refreshAddButtons(){ $$('[data-add]').forEach(b=>{ const on=inCart(b.dataset.add); b.classList.toggle('in',on); b.innerHTML=on?I_CHECK:I_PLUS; }); }
const form = Object.assign({name:'',phone:'',car:'',comment:'',day:null,time:null}, store.get('form',{}));
form.day=null; form.time=null;
let formOpenedAt = Date.now(), sending=false;
function nextDays(){ const n=mskNow(); const base=Date.UTC(n.y,n.m-1,n.d); const out=[];
  for(let k=0;k<14;k++){ const dt=new Date(base+k*864e5); out.push({key:dt.toISOString().slice(0,10), d:dt.getUTCDate(), wd:dt.getUTCDay(), today:k===0}); } return out; }
function maskPhone(v){ let d=v.replace(/\D/g,''); if(d.startsWith('8')) d='7'+d.slice(1); if(d && !d.startsWith('7')) d='7'+d; d=d.slice(0,11);
  if(!d) return ''; let o='+7'; if(d.length>1) o+=' ('+d.slice(1,4); if(d.length>=4) o+=')'; if(d.length>4) o+=' '+d.slice(4,7); if(d.length>7) o+='-'+d.slice(7,9); if(d.length>9) o+='-'+d.slice(9,11); return o; }
function leadFormHTML(ctx){
  const days=nextDays(), n=mskNow(), isToday=form.day===days[0].key;
  const tot=cartTotal(), hasNull=state.cart.some(i=>i.price==null);
  return `<form class="form" data-leadform="${ctx}" novalidate>
   ${state.cart.length?`<div class="card" style="padding:14px 16px">${state.cart.map(i=>`<div class="cart-item"><span>${esc(i.title)}</span><span style="display:flex;gap:8px;align-items:center"><span class="p">${i.price==null?'по осмотру':(i.fixed?'':'от ')+rub(i.price)}</span><button type="button" data-del="${i.id}" aria-label="Убрать">${I_X}</button></span></div>`).join('')}
     <div class="total"><span class="mini">Предварительно${hasNull?', без позиций «по осмотру»':''}</span><b class="num">${tot?'от '+rub(tot):'—'}</b></div></div>`
   : `<p class="mini">Услуги можно не выбирать: мастер перезвонит, проконсультирует и посчитает стоимость.</p>`}
   <div class="field"><label>Когда удобно приехать</label><div class="days">${days.map(d=>`<button type="button" class="day" data-day="${d.key}" aria-pressed="${form.day===d.key}"><small>${d.today?'сегодня':WD[d.wd]}</small><b class="num">${d.d}</b><i>${d.wd===0?'по записи':''}</i></button>`).join('')}</div></div>
   ${form.day?`<div class="times">${Array.from({length:10},(_,k)=>k+10).map(h=>`<button type="button" class="time" data-time="${h}:00" aria-pressed="${form.time===h+':00'}" ${isToday&&h<=n.h?'disabled':''}>${h}:00</button>`).join('')}</div>`:''}
   <div class="fgrid">
    <div class="field" data-f="name"><label for="${ctx}-name">Имя</label><input id="${ctx}-name" name="name" autocomplete="given-name" value="${esc(form.name)}" placeholder="Как к вам обращаться"><span class="err">Укажите имя</span></div>
    <div class="field" data-f="phone"><label for="${ctx}-phone">Телефон</label><input id="${ctx}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(form.phone)}" placeholder="+7 (___) ___-__-__"><span class="err">Нужен номер из 11 цифр</span></div>
   </div>
   <div class="field"><label for="${ctx}-car">Автомобиль</label><input id="${ctx}-car" name="car" value="${esc(form.car)}" placeholder="Марка, модель, год"></div>
   <div class="field"><label for="${ctx}-comment">Комментарий</label><textarea id="${ctx}-comment" name="comment" rows="2" placeholder="Что беспокоит, удобное время для звонка">${esc(form.comment)}</textarea></div>
   <input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
   <label class="consent"><input type="checkbox" name="consent" ${form.consent?'checked':''}><span>Даю согласие на обработку персональных данных в соответствии с <a class="link" href="https://srv-auto.ru/privacy-policy/" target="_blank" rel="noopener">политикой конфиденциальности</a></span></label>
   <button class="btn btn-red" type="submit" style="height:54px;font-size:16px">${state.cart.length?'Записаться':'Получить консультацию'}</button>
   <p class="mini">Или позвоните: <a class="link" href="${CONFIG.phoneHref}">${CONFIG.phone}</a> · ПН–СБ 10:00–20:00</p>
  </form>`;
}
function renderLeadForms(){ $$('[data-lead-slot]').forEach(slot=> slot.innerHTML = leadFormHTML(slot.dataset.leadSlot)); }
function readForm(f){ ['name','phone','car','comment'].forEach(k=>{ const el=f.elements[k]; if(el) form[k]=el.value; }); form.consent = f.elements.consent && f.elements.consent.checked; }
function leadText(id){
  const d = form.day ? new Date(form.day+'T12:00:00Z') : null;
  const when = d ? `${d.getUTCDate()} ${MON[d.getUTCMonth()]}, ${WD[d.getUTCDay()]}${form.time?' в '+form.time:''}` : 'согласовать по телефону';
  const tot=cartTotal();
  return [`Заявка ${id} с сайта SRV`, state.src?`Источник: ${state.src}`:'', `Страница: ${document.title}`, `Имя: ${form.name}`, `Телефон: ${form.phone}`, form.car?`Авто: ${form.car}`:'', `Когда: ${when}`,
    state.cart.length?'Услуги:':'Услуги: консультация', ...state.cart.map(i=>`• ${i.title} — ${i.price==null?'по осмотру':(i.fixed?'':'от ')+rub(i.price)}`), tot?`Итого: от ${rub(tot)}`:'', form.comment?`Комментарий: ${form.comment}`:''].filter(Boolean).join('\n');
}
async function submitLead(f){
  if(sending) return; readForm(f);
  const digits=form.phone.replace(/\D/g,''); let ok=true;
  const bad=(k,b)=>{ const el=f.querySelector(`[data-f="${k}"]`); el && el.classList.toggle('bad',b); if(b) ok=false; };
  bad('name', !form.name.trim()); bad('phone', digits.length!==11);
  const c=f.querySelector('.consent'); c.classList.toggle('bad', !form.consent); if(!form.consent) ok=false;
  if(!ok){ toast(!form.consent && form.name && digits.length===11 ? 'Отметьте согласие на обработку данных' : 'Проверьте имя и телефон'); return; }
  store.set('form',{name:form.name,phone:form.phone,car:form.car});
  const id='SRV-'+String(Date.now()).slice(-5), text=leadText(id);
  const btn=f.querySelector('[type=submit]'); sending=true; btn.disabled=true; btn.textContent='Отправляем…';
  let how='fail';
  try{
    const r=await fetch(CONFIG.leadEndpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({web:true,text,phone:form.phone,name:form.name,hp:f.elements.company.value,ms:Date.now()-formOpenedAt,
      lead:{id,car:form.car,day:form.day,time:form.time,src:state.src,page:location.pathname,total:cartTotal(),items:state.cart.map(i=>({title:i.title,price:i.price}))}})});
    if(r.ok) how='sent';
  }catch(e){}
  sending=false;
  goal(how==='sent'?'lead_sent':'lead_failed');
  const box=f.parentElement;
  const tgUrl=`https://t.me/${CONFIG.manager}?text=${encodeURIComponent(text)}`;
  box.innerHTML = how==='sent'
    ? `<div class="done"><span class="ok">${ico('check')}</span><h3>Заявка ${id} отправлена</h3><p class="muted">Менеджер SRV перезвонит в рабочее время (ПН–СБ 10:00–20:00) и подтвердит время. Ждём вас на Симонова, 11.</p><a class="btn btn-ghost btn-sm" href="https://yandex.ru/maps/-/CThXj29K" target="_blank" rel="noopener">${ico('pin')} Маршрут</a></div>`
    : `<div class="done"><h3>Не получилось отправить</h3><p class="muted">Связь с сервером пропала. Отправьте заявку менеджеру в Telegram — текст уже готов — или позвоните.</p><div class="row"><a class="btn btn-red btn-sm" href="${tgUrl}" target="_blank" rel="noopener">${ico('tg')} Отправить в Telegram</a><a class="btn btn-ghost btn-sm" href="${CONFIG.phoneHref}">${CONFIG.phone}</a></div></div>`;
  if(how==='sent'){ state.cart=[]; saveCart(); refreshAddButtons(); form.day=null; form.time=null; }
}
function openDrawer(){ renderDrawer(); $('#overlay').classList.add('on'); $('#drawer').classList.add('on'); document.body.style.overflow='hidden'; formOpenedAt=Date.now(); goal('booking_open'); }
function renderDrawer(){ const b=$('#drawer-b'); if(b) b.innerHTML = `<div data-lead-slot="dr">${leadFormHTML('dr')}</div>`; }
function closeAll(){ $('#overlay').classList.remove('on'); $$('.drawer.on,.modal.on').forEach(x=>x.classList.remove('on')); document.body.style.overflow=''; $$('.modal video').forEach(v=>{try{v.pause()}catch(e){}}); }

/* ---------- просмотр фото и видео ---------- */
let viewerList=[];
function openViewer(list, idx, title){
  viewerList=list; const v=$('#viewer');
  v.innerHTML=`<div class="vw-top"><span id="vwc">${idx+1} / ${list.length}</span><b>${esc(title||'')}</b><button data-vclose aria-label="Закрыть">${I_X}</button></div>
   <div class="vw-track" id="vwt">${list.map((p,i)=>`<div class="vw-slide"><img src="${Math.abs(i-idx)<2?M(p.f):''}" data-src="${M(p.f)}" alt="" decoding="async"></div>`).join('')}</div>
   ${list.length>1?`<button class="vw-nav vw-prev" data-vnav="-1" aria-label="Назад">${ico('chevl')}</button><button class="vw-nav vw-next" data-vnav="1" aria-label="Дальше">${ico('chev')}</button>`:''}
   <div class="vw-sub" id="vws">${esc(list[idx].cap||'')}</div>`;
  v.hidden=false; document.body.style.overflow='hidden';
  const tr=$('#vwt'); requestAnimationFrame(()=>{ tr.scrollLeft=idx*tr.clientWidth; });
  let raf; tr.addEventListener('scroll',()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{ const i=Math.round(tr.scrollLeft/tr.clientWidth);
    $('#vwc').textContent=`${i+1} / ${list.length}`; $('#vws').textContent=(list[i]&&list[i].cap)||'';
    tr.querySelectorAll('img').forEach((im,k)=>{ if(Math.abs(k-i)<2 && !im.getAttribute('src')) im.src=im.dataset.src; }); }); });
}
function openVideo(i){ const vd=MEDIA.videos[i]; if(!vd) return; const v=$('#viewer');
  v.innerHTML=`<div class="vw-top"><span></span><b>${esc(vd.title)}</b><button data-vclose aria-label="Закрыть">${I_X}</button></div><div class="vw-track"><div class="vw-slide"><video src="${M(vd.v)}" poster="${M(vd.p)}" controls autoplay playsinline></video></div></div>`;
  v.hidden=false; document.body.style.overflow='hidden'; goal('video_play',{id:vd.id}); }
function closeViewer(){ const v=$('#viewer'); v.querySelectorAll('video').forEach(x=>{try{x.pause()}catch(e){}}); v.hidden=true; v.innerHTML=''; document.body.style.overflow=''; }

/* ---------- динамические блоки ---------- */
const workPhotos = w => w.photos.map(p=>({...p,cap:`${w.title} — ${w.sub}`}));
function renderBlocks(){
  $$('[data-works]').forEach(el=>{ const lim=+el.dataset.works||99; el.innerHTML = MEDIA.works.slice(0,lim).map((w,i)=>`<button class="wcard" data-work="${i}">${img(w.photos[0].f,w.title)}<span class="cnt">${w.photos.length} фото</span><span class="wt"><b>${esc(w.title)}</b><span>${esc(w.sub)}</span></span></button>`).join(''); });
  $$('[data-videos]').forEach(el=>{ const f=el.dataset.videos; const list=MEDIA.videos.map((v,i)=>[v,i]).filter(([v])=>!f||f==='all'||v.svc===f);
    el.innerHTML = list.map(([v,i])=>`<button class="vcard" data-video="${i}"><span class="vp">${img(v.p,v.title)}<span class="pl"><i><svg viewBox="0 0 24 24">${IC.play}</svg></i></span><span class="dur num">${mmss(v.d)}</span></span><b>${esc(v.title)}</b></button>`).join('');
    if(!list.length) el.closest('section') && (el.closest('[data-hide-empty]')||{}).hidden!==undefined && (el.closest('[data-hide-empty]').hidden=true); });
  $$('[data-team]').forEach(el=>{ el.innerHTML = MEDIA.team.map((p,i)=>`<button data-teamph="${i}" aria-label="Фото мастера">${img(p.f,'Мастер SRV')}</button>`).join(''); });
  $$('[data-blog]').forEach(el=>{ const lim=+el.dataset.blog||4, f=(el.dataset.blogFilter||'').split(',').filter(Boolean);
    let list=MEDIA.blog.filter(b=>b.i); if(f.length){ const m=list.filter(b=>f.some(w=>b.t.toLowerCase().includes(w))); if(m.length>=2) list=m; }
    el.innerHTML = list.slice(0,lim).map(b=>`<a class="bcard" href="${blogUrl(b.s)}" target="_blank" rel="noopener">${img(b.i,b.t)}<b>${esc(b.t)}</b></a>`).join(''); });
  $$('[data-svc-photos]').forEach(el=>{ const id=el.dataset.svcPhotos, s=MEDIA.services[id]; if(!s) return; const lim=+el.dataset.limit||99;
    el.innerHTML = s.photos.slice(0,lim).map((p,i)=>`<button data-svph="${id}:${i}">${img(p.t||p.f,SVC_META[id].title)}</button>`).join(''); });
  $$('[data-zones]').forEach(el=>{ const s=MEDIA.services.noise; if(!s||!s.zones) return; const D=el.dataset.zonesDesc?JSON.parse(el.dataset.zonesDesc):{};
    el.innerHTML = s.zones.map(z=>`<div class="zone-c">${img(z.f,z.t)}${esc(z.t)}<small>${z.price?'от '+rub(z.price):'цена — у мастера'}</small>${D[z.t]?`<p>${esc(D[z.t])}</p>`:''}</div>`).join(''); });
  $$('[data-gallery]').forEach(renderGallery);
  $$('[data-blog-list]').forEach(el=>renderBlogList(el,''));
  $$('[data-prices]').forEach(el=>{ el.innerHTML = pricesHTML(el.dataset.prices||''); });
  $$('[data-pkg-img]').forEach(el=>{ el.innerHTML = pkgThumb(el.dataset.pkgImg); });
  refreshAddButtons();
}
function galleryTabs(){
  const t=[['works','Работы',MEDIA.works.flatMap(workPhotos)]];
  SVC_ORDER.forEach(id=>{ const s=MEDIA.services[id]; if(s&&s.photos.length) t.push([id,SVC_META[id].title,s.photos.map(p=>({...p,cap:SVC_META[id].title}))]); });
  if(MEDIA.studio.length) t.push(['studio','Студия',MEDIA.studio.map(p=>({...p,cap:'Студия SRV'}))]);
  if(MEDIA.team.length) t.push(['team','Команда',MEDIA.team.map(p=>({...p,cap:'Команда SRV'}))]);
  return t;
}
function renderGallery(el){
  const tabs=galleryTabs(); const cur=tabs.find(t=>t[0]===el.dataset.cur)||tabs[0]; el.dataset.cur=cur[0];
  el.innerHTML = `<div class="chips" style="margin-bottom:16px">${tabs.map(t=>`<button class="chip" data-gtab="${t[0]}" aria-pressed="${t[0]===cur[0]}">${t[1]} · ${t[2].length}</button>`).join('')}</div>
   <div class="pgrid">${cur[2].map((p,i)=>`<button data-gph="${i}">${img(p.t||p.f)}</button>`).join('')}</div>`;
}
function renderBlogList(el,q){ q=q.trim().toLowerCase(); const list=MEDIA.blog.filter(b=>!q||b.t.toLowerCase().includes(q));
  const box=el.closest('.wrap')||document; $('[data-blog-out]',box).innerHTML = list.length ? list.map(b=>`<a class="bcard" href="${blogUrl(b.s)}" target="_blank" rel="noopener">${img(b.i,b.t)}<b>${esc(b.t)}</b></a>`).join('') : '<p class="muted">Ничего не нашли — попробуйте другое слово.</p>';
  const c=$('[data-blog-count]',box); if(c) c.textContent = `${list.length} ${plural(list.length,'статья','статьи','статей')}`; }

/* ---------- прайс ---------- */
function pricesHTML(only){
  const cats = only ? only.split(',').map(id=>PRICES.find(c=>c.id===id)).filter(Boolean) : PRICES;
  return cats.map(cat=>{
    let body='';
    if(cat.pkgs) body += Object.entries(PKG).map(([k,p])=>`<div class="pitem"><div class="n">Пакет «${p.name}»<small>${p.desc}</small></div><div class="p">от ${rub(p.price)}</div><a class="add" href="${ROOT}site/raschet.html?pkg=${k}" aria-label="Показать на схеме">${ico('chev')}</a></div>`).join('');
    body += (cat.items||[]).map((it,i)=>{ const id=cat.id+'-'+i, fixed=it[3]==='fixed', price=it[1]==null?null:+it[1];
      return `<div class="pitem" data-q="${esc((it[0]+' '+(it[2]||'')+' '+cat.title).toLowerCase())}"><div class="n">${esc(it[0])}${it[2]?`<small>${esc(it[2])}</small>`:''}</div><div class="p ${fixed?'hot':''}">${price==null?'по осмотру':(fixed?'':'от ')+rub(price)}</div><button class="add" data-add="${id}" aria-label="Добавить в запись: ${esc(it[0])}">${I_PLUS}</button></div>`; }).join('');
    return `<div class="pcat" id="p-${cat.id}"><h3>${cat.title}</h3><div class="sub">${cat.sub}</div><div class="price-tbl">${body}</div>${cat.note?`<div class="pnote">${cat.note}</div>`:''}</div>`;
  }).join('');
}

/* ---------- конфигуратор плёнки ---------- */
function ppfHTML(){
  const P=state.ppf, c=ppfCalc(), isColor=P.mode==='color';
  const pk = [...Object.entries(PKG).map(([k,p])=>[k,p.name,p.price,p.desc,P.mode==='custom'&&c.pkg===k])];
  const finLabel = isColor ? 'цветная · '+FILM_COLORS[P.filmColor][1].toLowerCase() : (P.finish==='matte'?'матовая':'глянцевая');
  const groups = PPF_GROUPS.map(([g,title])=>{
    const rows = ITEMS.filter(i=>i.g===g).map(it=>{
      const lv=level(it.id), inFull=P.mode!=='custom'&&!FULL_EXTRA.has(it.id), inP=c.inPkg.has(it.id);
      const sub = it.risk ? `<span><i class="rk r${it.risk}"></i>${RISK[it.risk]}${it.note?' · '+it.note:''}</span>` : (it.note?`<span>${it.note}</span>`:'');
      const priceTxt = inFull ? '<span class="inc">входит</span>' : (it.opts ? (lv?rub(itemPrice(it.id,lv)):'от '+rub(it.opts[0][1])) : rub(it.price));
      const ctrl = it.opts ? '<span></span>' : `<button class="tg" data-tog="${it.id}" aria-pressed="${lv>0}" aria-label="${it.name}"></button>`;
      const seg = it.opts ? `<div class="mseg" role="group" aria-label="${it.name}"><button data-opt="${it.id}:0" aria-pressed="${lv===0}">Нет</button>${it.opts.map((o,i)=>`<button data-opt="${it.id}:${i+1}" aria-pressed="${lv===i+1}">${o[0]}</button>`).join('')}</div>` : '';
      return `<div class="it ${lv?'on':''} ${inP?'inpkg':''}"><div class="it-n"><b>${it.name}</b>${sub}</div><div class="it-p">${priceTxt}</div>${ctrl}${seg}</div>`;
    }).join('');
    const cnt=ITEMS.filter(i=>i.g===g&&level(i.id)).length;
    return `<div class="grp"><div class="grp-h"><span>${title}</span><span>${cnt?'выбрано '+cnt:''}</span></div>${rows}</div>`;
  }).join('');
  const sub = P.mode!=='custom' ? `${FULL[P.mode].name} · от 3 дней` : (c.pkg?`Пакет «${PKG[c.pkg].name}» · экономия ${rub(c.save)}`:(c.lines.length?`${c.lines.length} ${plural(c.lines.length,'элемент','элемента','элементов')} · срок ${c.time}`:'Ничего не выбрано'));
  return `<div class="ppf">
   <div class="ppf-left">
    <div class="draw ${P.heat?'heat':''} ${P.finish==='matte'&&!isColor?'matte':''} ${isColor?'colorfilm':''}" style="--fc:${FILM_COLORS[P.filmColor][0]}">
     <div class="draw-top"><div class="legend">${P.heat?'':`<i></i>Плёнка, ${finLabel}`}</div><button class="heat-btn" data-heat aria-pressed="${P.heat}">Где летят сколы</button></div>
     ${P.heat?`<div class="heat-legend"><span><i class="rk r3"></i>Высокий риск</span><span><i class="rk r2"></i>Средний</span><span><i class="rk r1"></i>Низкий</span></div>`:''}
     <figure class="vw">${drawSide()}<figcaption>Вид сбоку · нажмите на деталь</figcaption></figure>
     <div class="views"><figure class="vw">${drawFront()}<figcaption>Спереди</figcaption></figure><figure class="vw">${drawRear()}<figcaption>Сзади</figcaption></figure></div>
    </div>
    <div class="finish" role="group" aria-label="Тип плёнки">
     <button data-fin="gloss" aria-pressed="${P.finish==='gloss'&&!isColor}">Глянцевая</button><button data-fin="matte" aria-pressed="${P.finish==='matte'&&!isColor}">Матовая</button><button data-fin="color" aria-pressed="${isColor}">Цветная</button>
    </div>
    ${isColor?`<div class="fcolors">${FILM_COLORS.map((f,i)=>`<button style="background:${f[0]}" data-fc="${i}" aria-pressed="${i===P.filmColor}" aria-label="${f[1]}"></button>`).join('')}<span class="mini">${FILM_COLORS[P.filmColor][1]} · более 1000 оттенков в студии</span></div>`:''}
   </div>
   <div class="ppf-right">
    <div class="pk-rail">${pk.map(([k,n,p,d,on])=>`<button class="pk" data-pkg="${k}" aria-pressed="${on}"><span class="pthumb draw">${pkgThumb(k)}</span><b>${n}</b><span class="pp">от ${rub(p)}</span><span>${d}</span></button>`).join('')}</div>
    <div class="full-row">${Object.entries(FULL).map(([k,f])=>`<button class="fw" data-pkg="${k}" aria-pressed="${P.mode===k}"><b>${f.name}</b><span>${f.desc}</span><span class="p num">от ${rub(f.price)}</span></button>`).join('')}</div>
    ${c.gifts?`<div class="gift">${ico('gift')}<span>${c.gifts}</span></div>`:''}
    ${P.mode==='custom'&&c.total>=140000?`<div class="tip">Набрано элементов на ${rub(c.total)}. Полная оклейка с полосой на крыше — от 160 000 ₽, плюс мойка люкс, химчистка дисков и антидождь в подарок. <button class="inline-btn" data-pkg="full160">Посмотреть</button></div>`:''}
    <div class="ppf-sum"><div class="tot"><b class="num">${c.total?'от '+rub(c.total):'0 ₽'}</b><span>${sub}</span></div><button class="btn btn-red" data-ppf-add ${c.total?'':'disabled'}>${inCart('ppf-calc')?'Обновить в записи':'Добавить в запись'}</button></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><b>Элементы</b>${c.lines.length||P.mode!=='custom'?'<button class="inline-btn" data-pkg="clear">Сбросить</button>':''}</div>
    ${groups}
    <p class="mini">Цены «от» — для типового легкового автомобиля. Итог зависит от сложности кузова и может быть ниже прайса: мастер уточнит на осмотре.</p>
   </div></div>`;
}
function renderPPF(){ $$('[data-ppf]').forEach(el=>{ el.innerHTML=ppfHTML(); }); }
function setItem(id,v){ const P=state.ppf;
  if(P.mode!=='custom' && !FULL_EXTRA.has(id)){ P.mode='custom'; const keep=P.sel; P.sel={}; ITEMS.forEach(i=>{ if(!FULL_EXTRA.has(i.id)) P.sel[i.id]=i.opts?2:1; else if(keep[i.id]) P.sel[i.id]=keep[i.id]; }); }
  if(v) P.sel[id]=v; else delete P.sel[id]; renderPPF(); }
function tapZone(id){ const it=ITEM[id], cur=level(id), next=it.opts?(cur+1)%3:(cur?0:1); setItem(id,next); toast(next?`${itemName(id,next)} · ${rub(itemPrice(id,next))}`:`${it.name} — убрано`); goal('ppf_zone'); }

/* ---------- модалки: подбор и тонировка ---------- */
function quizHTML(){
  if(quiz.step<QUIZ.length){ const Q=QUIZ[quiz.step];
    return `<h2>Подбор за 30 секунд</h2><p class="sub">Три вопроса — и готовый план ухода с ценами.</p><div class="qprog">${QUIZ.map((_,i)=>`<i class="${i<=quiz.step?'on':''}"></i>`).join('')}</div>
     <p class="qq">${Q.q}</p><div class="opts">${Q.o.map(o=>`<button class="opt" data-qa="${o[0]}"><span><b style="font-weight:600">${o[1]}</b><small>${o[2]}</small></span></button>`).join('')}</div>
     ${quiz.step?`<button class="inline-btn" style="margin-top:12px" data-qback>← Назад</button>`:''}`; }
  const R=quizRecs(), tot=R.reduce((s,r)=>s+(r.price||0),0);
  return `<h2>Ваш план ухода</h2><p class="sub">Подобрали по ответам. Итоговую цену мастер подтвердит после осмотра.</p>
   ${R.map(r=>`<div class="rec"><div class="n"><b>${esc(r.title)}</b><span>${esc(r.why)}</span></div><div style="display:flex;align-items:center;gap:10px"><span class="num" style="font-weight:600;white-space:nowrap">${r.price==null?'по осмотру':(r.fixed?'':'от ')+rub(r.price)}</span><button class="add" data-rec="${r.id}">${inCart(r.id)?I_CHECK:I_PLUS}</button></div></div>`).join('')}
   <div class="total"><span class="mini">Всего</span><b class="num">от ${rub(tot)}</b></div>
   <div class="row" style="margin-top:16px"><button class="btn btn-red" data-rec-all>Добавить всё и записаться</button><button class="btn btn-ghost" data-qrestart>Заново</button></div>`;
}
function tintHTML(inline){
  const levels = state.tintZone==='rear'?[5,15,35,50]:[35,50,70,80];
  if(!levels.includes(state.tintLevel)) state.tintLevel = state.tintZone==='rear'?15:70;
  const promo=PROMO_END-Date.now()>0;
  return `${inline?'':'<h2>Примерка тонировки</h2><p class="sub">Выберите стёкла и плотность плёнки — так это будет выглядеть изнутри.</p>'}
   <div class="zone-tabs"><button data-tz="rear" aria-pressed="${state.tintZone==='rear'}">Задняя полусфера</button><button data-tz="front" aria-pressed="${state.tintZone==='front'}">Передние и лобовое</button></div>
   <div class="tint-wrap" data-tintsvg>${tintSVG()}</div>
   <div class="tint-ctrl">${levels.map(l=>`<button data-tl="${l}" aria-pressed="${state.tintLevel===l}">${l}%</button>`).join('')}</div>
   <div data-tintinfo>${tintInfo()}</div>
   <div class="row" style="margin-top:14px">${state.tintZone==='rear'
     ? `<button class="btn btn-red" data-addid="tint-0">${promo?'Задняя полусфера — 5 000 ₽ по акции':'Задняя полусфера — в запись'}</button>`
     : `<button class="btn btn-red" data-addid="tint-5">Атермальная на передние — от 5 000 ₽</button><button class="btn btn-ghost" data-addid="tint-6">Атермальное лобовое — от 12 000 ₽</button>`}</div>`;
}
function openModal(kind){ const m=$('#modal'), b=$('#modal-b'); m.dataset.kind=kind;
  b.innerHTML = kind==='quiz'?quizHTML():tintHTML(false);
  $('#overlay').classList.add('on'); m.classList.add('on'); document.body.style.overflow='hidden'; goal(kind+'_open'); }
function refreshModal(){ const m=$('#modal'); if(!m.classList.contains('on')) return; $('#modal-b').innerHTML = m.dataset.kind==='quiz'?quizHTML():tintHTML(false); }
function refreshTint(){ $$('[data-tint-inline]').forEach(el=>el.innerHTML=tintHTML(true)); refreshModal(); }

/* ---------- клики ---------- */
document.addEventListener('click', e=>{
  const t=e.target.closest('button,[data-z],[data-open]'); if(!t) return; const d=t.dataset;
  if(d.open==='book'){ e.preventDefault(); return openDrawer(); }
  if(d.open==='quiz'||d.open==='tint'){ e.preventDefault(); return openModal(d.open); }
  if(d.close!==undefined) return closeAll();
  if(d.vclose!==undefined) return closeViewer();
  if(d.vnav){ const tr=$('#vwt'); tr.scrollBy({left:+d.vnav*tr.clientWidth,behavior:'smooth'}); return; }
  if(d.work!==undefined){ const w=MEDIA.works[+d.work]; goal('work_open'); return openViewer(workPhotos(w),0,w.title); }
  if(d.video!==undefined) return openVideo(+d.video);
  if(d.teamph!==undefined) return openViewer(MEDIA.team.map(p=>({...p,cap:'Команда SRV'})),+d.teamph,'Команда SRV');
  if(d.svph){ const [sid,i]=d.svph.split(':'); return openViewer(MEDIA.services[sid].photos.map(p=>({...p,cap:SVC_META[sid].title})),+i,SVC_META[sid].title); }
  if(d.gtab){ const g=t.closest('[data-gallery]'); g.dataset.cur=d.gtab; renderGallery(g); return; }
  if(d.gph!==undefined){ const g=t.closest('[data-gallery]'); const tb=galleryTabs().find(x=>x[0]===g.dataset.cur); return openViewer(tb[2],+d.gph,tb[1]); }
  if(d.add){ if(inCart(d.add)) removeCart(d.add); else addCart(itemById(d.add)); refreshAddButtons(); return; }
  if(d.addid){ addCart(itemById(d.addid)); refreshAddButtons(); return; }
  if(d.addWinter!==undefined){ addCart({id:'winter',title:'Подготовка к зиме (подбор мастером)',price:null}); return; }
  if(d.del){ removeCart(d.del); refreshAddButtons(); const f=t.closest('[data-lead-slot]'); if(f) f.innerHTML=leadFormHTML(f.dataset.leadSlot); return; }
  if(d.day){ const f=t.closest('form'); readForm(f); form.day=d.day; form.time=null; const s=t.closest('[data-lead-slot]'); s.innerHTML=leadFormHTML(s.dataset.leadSlot); return; }
  if(d.time){ form.time=d.time; t.closest('.times').querySelectorAll('.time').forEach(b=>b.setAttribute('aria-pressed',b===t)); return; }
  // ppf
  if(d.z) return tapZone(d.z);
  if(d.tog) return setItem(d.tog, level(d.tog)?0:1);
  if(d.opt){ const [id,v]=d.opt.split(':'); return setItem(id,+v); }
  if(d.pkg){ applyPkg(d.pkg); renderPPF(); goal('ppf_pkg',{pkg:d.pkg}); return; }
  if(d.heat!==undefined){ state.ppf.heat=!state.ppf.heat; renderPPF(); return; }
  if(d.fc!==undefined){ state.ppf.filmColor=+d.fc; renderPPF(); return; }
  if(d.fin){ if(d.fin==='color') applyPkg('color'); else { state.ppf.finish=d.fin; if(state.ppf.mode==='color') state.ppf.mode='full180'; } renderPPF(); return; }
  if(d.ppfAdd!==undefined){ const c=ppfCalc(); addCart({id:'ppf-calc',title:ppfDescribe(),price:c.total},true); renderPPF(); toast('Расчёт добавлен в запись'); openDrawer(); return; }
  // quiz / tint
  if(d.qa){ quiz.a[QUIZ[quiz.step].k]=d.qa; quiz.step++; refreshModal(); return; }
  if(d.qback!==undefined){ quiz.step--; refreshModal(); return; }
  if(d.qrestart!==undefined){ quiz.step=0; quiz.a={}; refreshModal(); return; }
  if(d.rec){ const r=quizRecs().find(x=>x.id===d.rec); if(inCart(r.id)) removeCart(r.id); else addCart({id:r.id,title:r.title,price:r.price,fixed:r.fixed},true); refreshModal(); return; }
  if(d.recAll!==undefined){ quizRecs().forEach(r=>{ if(!inCart(r.id)) addCart({id:r.id,title:r.title,price:r.price,fixed:r.fixed},true); }); closeAll(); openDrawer(); return; }
  if(d.tz){ state.tintZone=d.tz; state.tintLevel=d.tz==='rear'?15:70; refreshTint(); return; }
  if(d.tl){ state.tintLevel=+d.tl; $$('[data-tintsvg]').forEach(x=>x.innerHTML=tintSVG()); $$('[data-tintinfo]').forEach(x=>x.innerHTML=tintInfo()); $$('[data-tl]').forEach(b=>b.setAttribute('aria-pressed', +b.dataset.tl===state.tintLevel)); return; }
});
document.addEventListener('submit', e=>{ const f=e.target.closest('[data-leadform]'); if(f){ e.preventDefault(); submitLead(f); } });
document.addEventListener('input', e=>{
  const el=e.target;
  if(el.name==='phone'){ el.value=maskPhone(el.value); el.closest('.field').classList.remove('bad'); }
  if(el.name==='name') el.closest('.field').classList.remove('bad');
  if(el.name==='consent') el.closest('.consent').classList.remove('bad');
  if(el.id==='blog-q') renderBlogList(el, el.value);
  if(el.id==='price-q'){ const q=el.value.trim().toLowerCase(); $$('[data-prices] .pitem[data-q]').forEach(r=>r.hidden=q&&!r.dataset.q.includes(q)); $$('[data-prices] .pcat').forEach(c=>c.hidden=q&&!c.querySelector('.pitem[data-q]:not([hidden])')); }
});
document.addEventListener('focusin', e=>{ if(e.target.name==='phone' && !e.target.value) e.target.value='+7 ('; });
document.addEventListener('keydown', e=>{
  if((e.key==='Enter'||e.key===' ') && e.target.dataset && e.target.dataset.z){ e.preventDefault(); tapZone(e.target.dataset.z); }
  if(e.key==='Escape'){ if(!$('#viewer').hidden) closeViewer(); else closeAll(); }
  if(!$('#viewer').hidden && (e.key==='ArrowRight'||e.key==='ArrowLeft')){ const tr=$('#vwt'); tr && tr.scrollBy({left:(e.key==='ArrowRight'?1:-1)*tr.clientWidth,behavior:'smooth'}); }
});

/* ---------- старт ---------- */
(function boot(){
  const q=new URLSearchParams(location.search);
  state.src = (q.get('utm_source')||q.get('src')||'').replace(/[^\w-]/g,'').slice(0,60);
  const pk=q.get('pkg'); if(pk && (PKG[pk]||FULL[pk])) applyPkg(pk);
  initHeader(); updateBadge(); renderBlocks(); renderPPF(); renderLeadForms(); refreshTint();
  $('#overlay') && $('#overlay').addEventListener('click', closeAll);
  countdown(); setInterval(countdown,1000);
  if(q.get('open')==='book') openDrawer(); else if(q.get('open')==='quiz'||q.get('open')==='tint') openModal(q.get('open'));
  // видео в шапке: не грузим на медленном соединении
  const hv=$('[data-hero-video]'); if(hv && !RM && !(navigator.connection&&navigator.connection.saveData)){ const v=document.createElement('video'); Object.assign(v,{muted:true,autoplay:true,loop:true,playsInline:true}); v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.poster=hv.dataset.poster; v.src=matchMedia('(max-width:760px)').matches?hv.dataset.mob:hv.dataset.heroVideo; hv.appendChild(v); }
})();
