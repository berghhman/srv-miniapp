/* SRV Detailing — общее ядро сайта: данные прайса, расчёт плёнки, схема на фото авто, подбор, примерка тонировки.
   Перенесено из мини-аппа (index.html в корне репозитория) без изменения логики. */
const ROOT = window.SRV_ROOT || '../';
const LINKS = {
  tg:'https://t.me/srv_roman', channel:'https://t.me/srvdetailing',
  wa:'https://wa.me/79213028511', max:'https://max.ru/u/f9LHodD0cOLo27LbOB5GHpdtIrcdj2GOQ26cN7FxoW6RQfyk2yIjY1RW4RU',
  yandex:'https://yandex.ru/maps/-/CThXj29K', gis:'https://go.2gis.com/YpZce',
  reviews:'https://yandex.ru/maps/org/srv/51187556779/reviews/', price:'https://srv-auto.ru/wp-content/themes/srv/price/price-srv-simonova.pdf',
  vk:'https://vk.ru/srv_detailing', yt:'https://youtube.com/channel/UCMr5-1sLnA-QrMiX2cCDy0w', ig:'https://www.instagram.com/srv_detailing', tt:'https://www.tiktok.com/@srv_detailing_'
};
const PHONE = '+7 (812) 372-98-11';
const PROMO_END = new Date('2026-10-31T23:59:59+03:00');

const PRICES = [
 {id:'ppf', title:'Плёнка: отдельные элементы', sub:'Полиуретан с самовосстановлением', items:[
  ['Фара передняя (2 шт.)',8000],['Лобовое стекло',35000],['Противотуманная фара (2 шт.)',2000],['Бампер передний',20000],['Полоса на капот (40 см)',10000],['Стойка лобового стекла (2 шт.)',8000],['Боковое зеркало (2 шт.)',8000],['Капот',18000],['Крыло переднее (2 шт.)',20000],['Расширитель колёсных арок (1 шт.)',5000],['Дверь (1 шт.)',14000],['Ниша под ручками (1 шт.)',1000],['Кромки дверей',1000],['Дверная стойка',6000],['Наружный порог (1 шт.)',12000],['Порог внутренний (1 шт.)',1000],['Крыло заднее (2 шт.)',30000],['Бампер задний',20000],['Зона погрузки',6000],['Крышка багажника',15000],['Полоса на крышу (20 см)',8000],['Крыша целиком',25000],['Антихром','15000','отдельные элементы — по расчёту'],['Оклейка внутренних элементов',15000,'от 15 000 до 35 000 ₽']],
  note:'<b>Сроки:</b> фары — 1 час, лобовое — 5–6 часов, отдельные элементы — от 1 часа. Цена зависит от сложности авто и может быть ниже прайса — уточняйте.'},
 {id:'zones', title:'Плёнка: зоны риска', sub:'Пакеты Лайт · Оптима · Премиум', pkgs:true,
  note:'<b>Срок:</b> сутки. В пакетах «Оптима» и «Премиум» — <b>антидождь передней полусферы в подарок</b>.'},
 {id:'full', title:'Плёнка: полная оклейка', sub:'Прозрачная, матовая, 1000+ цветов', items:[
  ['Полная оклейка с полосой на крыше',160000],['Полная оклейка с крышей',180000],['Полная оклейка цветным полиуретаном',350000,'более 1000 цветов']],
  note:'<b>Срок:</b> от 3 дней. Подготовка поверхностей включена. В подарок: <b>химчистка дисков, мойка люкс и антидождь всех стёкол</b>.'},
 {id:'ceramic', title:'Керамика и жидкое стекло', sub:'Составы Krytex для кузова и салона', items:[
  ['Krytex 9H (2 слоя) + Krytex 8 (1 слой)',35000,'всего 3 слоя'],['Krytex 9H (1 слой) + жидкое стекло Krytex 7H',25000],['Керамика для плёнки PPF',15000],['Керамическое покрытие кожи',20000],['Krytex 9H (1 слой) + Krytex 8 (1 слой)',20000,'всего 2 слоя'],['Керамическое покрытие дисков',25000],['Жидкое стекло',15000]],
  note:'Цены для <b>новых автомобилей без полировки</b>. Итог зависит от марки, размера и состояния ЛКП.'},
 {id:'polish', title:'Полировка', sub:'Абразивная и восстановительная', items:[
  ['Полировка всего кузова',20000],['Локальная полировка одной детали (царапина)',5000],['Полировка оптики',2000],['Полировка глянцевых вставок салона',5000]],
  note:'Полируем в несколько проходов: грубая → средняя → финишная паста.'},
 {id:'tint', title:'Тонировка', sub:'Евротонировка и атермальные плёнки', tintViz:true, items:[
  ['Задняя полусфера (евротонировка)',5000,'спецпредложение до 31 октября','fixed'],['Два передних стекла',3000],['Лобовое стекло',3500],['Заднее стекло',3000],['Целиком без лобового стекла',12000],['Два передних стекла (атермальная плёнка)',5000],['Лобовое стекло (атермальная плёнка)',12000],['Одно боковое стекло',2000],['Полоса на лобовое стекло',2000]]},
 {id:'dents', title:'Удаление вмятин без покраски', sub:'С сохранением заводского ЛКП', items:[
  ['Удаление вмятины',null,'стоимость — после осмотра']],
  note:'Пришлите фото повреждения менеджеру — оценим заранее.'},
 {id:'noise', title:'Шумоизоляция', sub:'Тише салон, меньше вибраций', items:[
  ['Полная шумоизоляция',100000],['Двери (4 шт.)',35000],['Колёсные арки',35000]]},
 {id:'clean', title:'Химчистка салона', sub:'Экстракторная чистка, озонирование', items:[
  ['Химчистка всего салона',20000],['Химчистка потолка',8000],['Химчистка пола (одно место)',4000],['Химчистка багажника',4000],['Химчистка одного сиденья',2000],['Химчистка двери',4000],['Химчистка пола полностью',8000]],
  note:'Гарантия на материалы и работу.'}
];

/* ---------- PPF elements (prices: srv-auto.ru/czeny) ---------- */
const PPF_GROUPS = [['front','Передняя часть'],['glass','Лобовое стекло и стойки'],['side','Боковины'],['rear','Задняя часть и крыша'],['extra','Дополнительно']];
const ITEMS = [
 {id:'bumperF', g:'front', name:'Бампер передний', price:20000, risk:3},
 {id:'hood', g:'front', name:'Капот', opts:[['Полоса 40 см',10000],['Целиком',18000]], risk:3},
 {id:'headlights', g:'front', name:'Фары (2 шт.)', price:8000, risk:3},
 {id:'fog', g:'front', name:'Противотуманные фары (2 шт.)', price:2000, risk:3},
 {id:'fenderF', g:'front', name:'Крылья передние (2 шт.)', price:20000, risk:2},
 {id:'mirrors', g:'front', name:'Боковые зеркала (2 шт.)', price:8000, risk:3},
 {id:'windshield', g:'glass', name:'Лобовое стекло', price:35000, risk:3, note:'Оклейка 5–6 часов'},
 {id:'pillarA', g:'glass', name:'Стойки лобового стекла (2 шт.)', price:8000, risk:2},
 {id:'doorsF', g:'side', name:'Передние двери (2 шт.)', price:28000, risk:1, note:'14 000 ₽ за дверь'},
 {id:'doorsR', g:'side', name:'Задние двери (2 шт.)', price:28000, risk:1, note:'14 000 ₽ за дверь'},
 {id:'sills', g:'side', name:'Пороги наружные (2 шт.)', price:24000, risk:2, note:'12 000 ₽ за порог'},
 {id:'innerSills', g:'side', name:'Пороги внутренние (4 шт.)', price:4000, risk:2, note:'1 000 ₽ за порог'},
 {id:'niches', g:'side', name:'Ниши под ручками (4 шт.)', price:4000, risk:2, note:'1 000 ₽ за нишу'},
 {id:'edges', g:'side', name:'Кромки дверей', price:1000, risk:2},
 {id:'pillarB', g:'side', name:'Дверная стойка', price:6000, risk:1},
 {id:'fenderR', g:'rear', name:'Крылья задние (2 шт.)', price:30000, risk:2},
 {id:'trunk', g:'rear', name:'Крышка багажника', price:15000, risk:1},
 {id:'bumperR', g:'rear', name:'Бампер задний', price:20000, risk:1},
 {id:'loading', g:'rear', name:'Зона погрузки', price:6000, risk:2},
 {id:'roof', g:'rear', name:'Крыша', opts:[['Полоса 20 см',8000],['Целиком',25000]], risk:1},
 {id:'arches', g:'extra', name:'Расширители колёсных арок (4 шт.)', price:20000, risk:2, note:'5 000 ₽ за шт.'},
 {id:'antichrome', g:'extra', name:'Антихром', price:15000, note:'отдельные элементы — по расчёту'},
 {id:'interior', g:'extra', name:'Внутренние элементы салона', price:15000, note:'от 15 000 до 35 000 ₽'}
];
const ITEM = Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const RISK = {3:'Зона сколов',2:'Средний риск',1:'Низкий риск'};
const FULL_EXTRA = new Set(['windshield','antichrome','interior','arches']); // не входят в полную оклейку
const PKG = {
 light:{name:'Лайт', price:15000, set:{hood:1, headlights:1}, desc:'Полоса на капот + фары'},
 optima:{name:'Оптима', price:45000, set:{hood:2, fenderF:1, headlights:1, mirrors:1}, desc:'Капот + передние крылья + фары + зеркала'},
 premium:{name:'Премиум', price:75000, set:{hood:2, fenderF:1, headlights:1, mirrors:1, bumperF:1, loading:1, innerSills:1, niches:1}, desc:'Оптима + передний бампер + зона погрузки + внутренние пороги + ниши под ручками'}
};
const FULL = {
 full160:{name:'Полная с полосой на крыше', price:160000, desc:'Весь кузов, на крыше — полоса 20 см'},
 full180:{name:'Полная с крышей', price:180000, desc:'Весь кузов, включая крышу'},
 color:{name:'Цветной полиуретан', price:350000, desc:'Смена цвета, более 1000 оттенков'}
};
const FILM_COLORS = [['#e8eaee','Белый жемчуг'],['#121417','Сатин-чёрный'],['#59636e','Нардо'],['#1f6f78','Петроль'],['#c2412b','Оранжевый'],['#6d4ab0','Фиолетовый']];


const rub = n => n==null ? 'по осмотру' : n.toLocaleString('ru-RU').replace(/,/g,' ')+' ₽';
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function mskNow(){
  const p = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',weekday:'short',hour12:false}).formatToParts(new Date());
  const o={}; p.forEach(x=>o[x.type]=x.value);
  return {y:+o.year,m:+o.month,d:+o.day,h:+o.hour%24,min:+o.minute,wd:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday)};
}

const SVC_META = {
  ppf:{title:'Оклейка защитной плёнкой', icon:'shield', from:'от 8 000 ₽', cats:['zones','ppf','full'],
    text:'Полиуретановая плёнка с эффектом самовосстановления: защищает от сколов, царапин и реагентов. Прозрачная, матовая или цветная — более 1000 оттенков. Подготовка поверхности входит в стоимость.'},
  ceramic:{title:'Керамика и жидкое стекло', icon:'drop', from:'от 15 000 ₽', cats:['ceramic'],
    text:'Составы Krytex высокой твёрдости для кузова, плёнки, кожи и дисков. Глубокий блеск, гидрофобный эффект, стойкость к химии и лёгкой механике — на годы.'},
  tint:{title:'Тонировка стёкол', icon:'tint', from:'от 2 000 ₽', cats:['tint'],
    text:'Евротонировка задней полусферы, атермальные плёнки на передние стёкла и лобовое — в рамках закона. Отдельные стёкла или комплексно.'},
  polish:{title:'Полировка кузова', icon:'polish', from:'от 2 000 ₽', cats:['polish'],
    text:'Абразивная и восстановительная полировка в несколько проходов: убираем микроцарапины, голограммы и матовость, возвращаем глубину цвета.'},
  clean:{title:'Химчистка салона', icon:'seat', from:'от 2 000 ₽', cats:['clean'],
    text:'Экстракторная чистка текстиля, уход за кожей, пластиком и потолком, озонирование. Убираем пятна, бактерии и запахи.'},
  noise:{title:'Шумоизоляция', icon:'wave', from:'от 35 000 ₽', cats:['noise'],
    text:'Снижаем шум от дороги и вибрации: двери, арки, пол, крыша, багажник или весь автомобиль. Тише в салоне — лучше звучит музыка.'},
  dents:{title:'Удаление вмятин без покраски', icon:'hammer', from:'по осмотру', cats:['dents'],
    text:'Технология PDR: выправляем вмятины с сохранением заводского лакокрасочного покрытия, без шпаклёвки и покраски. Стоимость — после осмотра или по фото.'}
};
const SVC_ORDER = ['ppf','ceramic','tint','polish','clean','noise','dents'];

function itemPrice(id,v){ const it=ITEM[id]; if(!v) return 0; return it.opts ? it.opts[v-1][1] : it.price; }
function itemName(id,v){ const it=ITEM[id]; return it.opts && v ? `${it.name}: ${it.opts[v-1][0].toLowerCase()}` : it.name; }
// уровень покрытия элемента на схеме: 0 — нет, 1 — полоса/да, 2 — целиком
function level(id){
  const P=state.ppf;
  if(P.mode!=='custom'){
    if(FULL_EXTRA.has(id)) return P.sel[id]||0;
    if(id==='roof') return P.mode==='full160'?1:2;
    return ITEM[id].opts?2:1;
  }
  return P.sel[id]||0;
}
function ppfCalc(){
  const P=state.ppf;
  if(P.mode!=='custom'){
    const f=FULL[P.mode];
    const lines=ITEMS.filter(i=>FULL_EXTRA.has(i.id)&&P.sel[i.id]).map(i=>({key:i.id,name:itemName(i.id,P.sel[i.id]),price:itemPrice(i.id,P.sel[i.id])}));
    return {total:f.price+lines.reduce((s,l)=>s+l.price,0), full:f, base:f.price, lines, pkg:null, inPkg:new Set(), save:0, time:'от 3 дней', gifts:'Химчистка дисков, мойка люкс и антидождь всех стёкол — в подарок'};
  }
  const lines=ITEMS.filter(i=>P.sel[i.id]).map(i=>({key:i.id,name:itemName(i.id,P.sel[i.id]),price:itemPrice(i.id,P.sel[i.id])}));
  const raw=lines.reduce((s,l)=>s+l.price,0);
  let pkg=null;
  for(const k of ['premium','optima','light']){
    const set=PKG[k].set;
    if(Object.keys(set).every(id=> id==='hood' ? P.sel.hood===set.hood : !!P.sel[id])){ pkg=k; break; }
  }
  const inPkg=new Set(pkg?Object.keys(PKG[pkg].set):[]);
  const total = pkg ? raw - lines.filter(l=>inPkg.has(l.key)).reduce((s,l)=>s+l.price,0) + PKG[pkg].price : raw;
  let time='—';
  if(lines.length){
    if(pkg==='optima'||pkg==='premium'||lines.length>5) time='около суток';
    else if(P.sel.windshield) time='5–6 часов';
    else if(lines.length===1&&P.sel.headlights) time='около часа';
    else time='от 1 часа';
  }
  return {total, raw, lines, pkg, inPkg, time, save:pkg?raw-total:0, gifts:(pkg==='optima'||pkg==='premium')?'Антидождь передней полусферы — в подарок':''};
}

/* ---- схема покрытия на фото автомобиля (рендер AIMLAPI, зоны по панелям кузова) ---- */
const CAR = {
  side:{img:ROOT+'media/car/side.webp', mask:ROOT+'media/car/side-mask.png', w:1370, h:510},
  front:{img:ROOT+'media/car/front.webp', mask:ROOT+'media/car/front-mask.png', w:1200, h:940},
  rear:{img:ROOT+'media/car/rear.webp', mask:ROOT+'media/car/rear-mask.png', w:1120, h:970}
};
function z(id,d,part=1,cls=''){
  /* part 0 — видно при любом уровне; 2 — только «целиком»; 1 — для деталей с вариантами только «полоса» */
  const lv=level(id), on = (part===0 ? lv>=1 : part===2 ? lv>=2 : (ITEM[id].opts ? lv===1 : lv>=1)) ? ' on':'';
  return `<path class="pz ${cls}${on}" data-z="${id}" data-r="${ITEM[id].risk||1}" d="${d}"><title>${ITEM[id].name}</title></path>`;
}
const mir = (v,d,part,cls,w) => z(v,d,part,cls)+`<g transform="translate(${w},0) scale(-1,1)">${z(v,d,part,cls)}</g>`;
function carSvg(view, zones, extra=''){
  const c=CAR[view];
  return `<svg viewBox="0 0 ${c.w} ${c.h}" aria-label="${view==='side'?'Вид сбоку':view==='front'?'Вид спереди':'Вид сзади'}">
   <defs>
    ${view==='side'?`<pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="rgba(227,38,47,.30)"/><rect width="2.4" height="9" fill="rgba(255,77,85,.9)"/></pattern>
    <pattern id="hatchM" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="rgba(227,38,47,.28)"/><circle cx="3.5" cy="3.5" r="1.4" fill="rgba(255,107,114,.95)"/></pattern>`:''}
    <mask id="m-${view}" maskUnits="userSpaceOnUse" x="0" y="0" width="${c.w}" height="${c.h}"><image href="${c.mask}" x="0" y="0" width="${c.w}" height="${c.h}" preserveAspectRatio="none"/></mask>
   </defs>
   <image href="${c.img}" x="0" y="0" width="${c.w}" height="${c.h}" preserveAspectRatio="none"/>
   <g class="zones" mask="url(#m-${view})">${zones}</g>${extra}
  </svg>`;
}
/* миниатюра пакета: та же машина сбоку, подсвечено, что входит */
function pkgThumb(k){
  const P=state.ppf, s0=P.sel, m0=P.mode;
  if(PKG[k]){ P.sel=Object.assign({},PKG[k].set); P.mode='custom'; } else { P.sel={}; P.mode=k; }
  try{ return drawSide(true); } finally { P.sel=s0; P.mode=m0; }
}
function drawSide(thumb){
  const zones =
    z('bumperR','M28,288 L105,282 L180,332 L195,360 L178,395 L60,398 L30,370 Z') +
    z('fenderR','M40,200 L80,168 L162,88 L150,68 L230,57 L224,72 L208,98 L224,128 L240,142 L338,150 L345,250 L340,300 L300,262 L245,262 L195,300 L180,332 L105,282 L28,288 L40,240 Z M46,178 L166,178 L150,202 L60,206 Z') +
    z('doorsR','M338,150 L625,160 L630,385 L430,385 L425,340 L400,295 L345,262 Z') +
    z('doorsF','M625,160 L905,172 L925,250 L938,365 L630,385 Z') +
    z('fenderF','M905,172 L990,178 L1100,196 L1185,222 L1205,262 L1180,300 L1130,272 L1070,262 L1000,272 L950,320 L938,365 L925,250 Z') +
    z('bumperF','M1185,222 L1320,240 L1340,272 L1345,330 L1335,395 L1190,398 L1185,350 L1170,300 L1205,262 Z') +
    z('hood','M905,168 L1110,182 L1250,205 L1328,236 L1300,242 L1180,216 L1000,192 L922,182 Z',2) +
    z('hood','M1120,186 L1250,205 L1328,236 L1300,242 L1180,216 L1115,200 Z',1) +
    z('roof','M232,52 L700,44 L800,60 L640,62 L235,66 Z',2) +
    z('roof','M600,46 L700,44 L800,60 L640,62 L600,62 Z',1) +
    z('pillarA','M770,58 L808,64 L912,166 L892,174 Z') +
    z('pillarB','M596,62 L628,62 L628,170 L600,168 Z') +
    z('mirrors','M820,140 L880,138 L894,196 L852,200 L822,176 Z') +
    z('headlights','M1186,222 L1300,236 L1320,262 L1240,258 L1198,242 Z') +
    z('fog','M1268,342 L1335,346 L1332,384 L1270,380 Z') +
    z('niches','M352,194 L412,194 L412,214 L352,214 Z') + z('niches','M638,202 L706,202 L706,222 L638,222 Z') +
    z('sills','M425,366 L940,362 L940,394 L430,396 Z') +
    z('edges','M340,160 L346,300','1','arc') + z('edges','M627,162 L630,384','1','arc') + z('edges','M908,175 L938,364','1','arc');
  const arches = `<g>${z('arches','M172,368 Q178,262 300,258 Q420,262 430,368',1,'arc wide')}${z('arches','M942,368 Q950,262 1070,258 Q1190,262 1196,368',1,'arc wide')}</g>`;
  const dims = (level('hood')===1?`<g class="dim"><path d="M1120,160 L1328,212 M1120,150 L1120,172 M1328,202 L1328,224"/><text x="1190" y="168">40 см</text></g>`:'') +
               (level('roof')===1?`<g class="dim"><path d="M600,26 L700,24 M600,16 L600,36 M700,14 L700,34"/><text x="618" y="16">20 см</text></g>`:'');
  return carSvg('side', zones, thumb ? arches : arches+dims);
}
function drawFront(){
  const W=1200;
  const zones =
    z('roof','M300,60 L900,60 L915,98 L285,98 Z',0) +
    z('windshield','M292,100 L908,100 L1000,290 L200,290 Z',1,'gz') +
    mir('pillarA','M262,72 L300,98 L208,292 L178,292 Z',1,'',W) +
    mir('mirrors','M52,240 L150,234 L158,300 L62,292 Z',1,'',W) +
    z('hood','M178,292 L1022,292 L1046,332 L1070,384 L900,374 L600,364 L300,374 L130,384 L154,332 Z',2) +
    z('hood','M150,336 L1050,336 L1070,384 L900,374 L600,364 L300,374 L130,384 Z',1) +
    z('bumperF','M96,452 L124,420 L340,414 L600,378 L860,414 L1076,420 L1104,452 L1112,680 L1050,758 L150,758 L88,680 Z') +
    mir('headlights','M126,382 L345,412 L330,452 L150,436 L124,420 Z',1,'',W) +
    mir('fenderF','M88,452 L126,392 L150,440 L104,640 L88,700 Z',1,'',W) +
    mir('fog','M110,650 L245,660 L250,700 L116,696 Z',1,'',W);
  const dims = level('hood')===1?`<g class="dim"><path d="M1090,336 L1090,384 M1080,336 L1100,336 M1080,384 L1100,384"/><text x="1104" y="366">40 см</text></g>`:'';
  return carSvg('front', zones, dims);
}
function drawRear(){
  const W=1120;
  const zones =
    z('roof','M250,92 L870,92 L890,128 L230,128 Z',2) +
    z('trunk','M195,290 L925,290 L930,345 L925,400 L915,560 L905,596 L212,596 L202,560 L190,400 L190,345 Z') +
    mir('fenderR','M56,400 L100,346 L190,346 L190,400 L205,596 L100,652 L66,666 L54,560 Z',1,'',W) +
    z('bumperR','M60,600 L212,596 L908,596 L1060,600 L1060,700 L980,760 L140,760 L60,700 Z') +
    z('loading','M206,588 L914,588 L910,628 L210,628 Z');
  return carSvg('rear', zones);
}


function plural(n,a,b,c){ n=Math.abs(n)%100; const n1=n%10; if(n>10&&n<20) return c; if(n1>1&&n1<5) return b; if(n1===1) return a; return c; }
function ppfDescribe(){
  const P=state.ppf, c=ppfCalc();
  if(P.mode!=='custom') return `Плёнка: ${FULL[P.mode].name.toLowerCase()}${P.mode==='color'?' ('+FILM_COLORS[P.filmColor][1]+')':''}${c.lines.length?' + '+c.lines.map(l=>l.name.toLowerCase()).join(', '):''}`;
  const names = c.lines.filter(l=>!c.inPkg.has(l.key)).map(l=>l.name.toLowerCase());
  return 'Плёнка '+(P.finish==='matte'?'(матовая)':'(глянцевая)')+': '+(c.pkg?`пакет «${PKG[c.pkg].name}»`+(names.length?' + ':''):'')+names.join(', ');
}

function applyPkg(k){
  const P=state.ppf;
  if(k==='clear'){ P.sel={}; P.mode='custom'; return; }
  if(FULL[k]){ const keep={}; FULL_EXTRA.forEach(x=>{ if(P.sel[x]) keep[x]=P.sel[x]; }); P.sel=keep; P.mode=k; return; }
  P.mode='custom'; P.sel=Object.assign({}, PKG[k].set);
}


function itemById(id){
  const [cid,i]=id.split('-'); const cat=PRICES.find(c=>c.id===cid); const it=cat.items[+i];
  const fixed=it[3]==='fixed'; const price=it[1]==null?null:+it[1];
  const t = cid==='ppf'?'Плёнка: '+it[0].toLowerCase(): (cid==='full'?it[0]:(cid==='tint'?'Тонировка: '+it[0].toLowerCase():it[0]));
  return {id, title:t, price, fixed};
}


const WD=['вс','пн','вт','ср','чт','пт','сб'], MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

const QUIZ = [
 {q:'Какой у вас автомобиль?', k:'age', o:[['new','Новый, из салона','Хочу сохранить как есть','car'],['mid','1–3 года','Есть следы эксплуатации','car'],['old','Старше 3 лет','Нужно освежить','car'],['sale','Готовлю к продаже','Нужен вид «дороже»','tag']]},
 {q:'Что важнее всего сейчас?', k:'need', o:[['chips','Сколы и царапины','Защитить кузов','shield'],['dull','Тусклый цвет, «паутинка»','Вернуть блеск','polish'],['interior','Салон: пятна и запахи','Чистота внутри','seat'],['noise','Шумно в салоне','Тишина и комфорт','wave'],['sun','Солнце и чужие взгляды','Тонировка','sun']]},
 {q:'Ориентир по бюджету', k:'budget', o:[['s','До 20 000 ₽','Самое нужное','tag'],['m','20 000 – 60 000 ₽','Оптимально','tag'],['l','От 60 000 ₽','Максимальный результат','tag']]}
];
const quiz={step:0, a:{}};
function quizRecs(){
  const {age,need,budget}=quiz.a; const R=[];
  const P=(id)=>itemById(id);
  if(need==='chips'){
    if(budget==='s') R.push({id:'pkg-light',title:'Плёнка: пакет «Лайт»',price:15000,why:'Полоса на капот и фары — зона, куда летит больше всего камней'});
    if(budget==='m') R.push({id:'pkg-optima',title:'Плёнка: пакет «Оптима»',price:45000,why:'Капот, крылья, фары и зеркала. Антидождь в подарок'});
    if(budget==='l') R.push(age==='new'?{id:'full-1',title:'Полная оклейка с крышей',price:180000,why:'Новый кузов под плёнкой целиком. Мойка люкс и антидождь в подарок'}:{id:'pkg-premium',title:'Плёнка: пакет «Премиум»',price:75000,why:'Все зоны риска спереди + пороги и зона погрузки'});
    if(budget!=='s') R.push(Object.assign(P('ceramic-2'),{why:'Керамика поверх плёнки: легче мыть, дольше блеск'}));
    if(age!=='new') R.unshift(Object.assign(P('polish-0'),{why:'Перед плёнкой убираем дефекты, чтобы не «законсервировать» их'}));
  }
  if(need==='dull'){
    R.push(Object.assign(P('polish-0'),{why:'Убирает голограммы, «паутинку» и окисление'}));
    if(budget==='m') R.push(Object.assign(P('ceramic-1'),{why:'Закрепляет блеск: Krytex 9H + жидкое стекло 7H'}));
    if(budget==='l') R.push(Object.assign(P('ceramic-0'),{why:'Три слоя Krytex — максимальная твёрдость и гидрофоб'}));
    if(budget==='s') R.push(Object.assign(P('polish-2'),{why:'Мутные фары старят машину сильнее всего'}));
  }
  if(need==='interior'){
    if(budget==='s'){ R.push(Object.assign(P('clean-6'),{why:'Ковролин — основной источник грязи и запахов'})); R.push(Object.assign(P('clean-4'),{why:'Точечно — для самых заметных пятен'})); }
    else R.push(Object.assign(P('clean-0'),{why:'Экстракторная чистка всего салона + озонирование от запахов'}));
    if(budget==='l') R.push(Object.assign(P('ceramic-3'),{why:'Керамика кожи: не трескается и не впитывает грязь'}));
  }
  if(need==='noise'){
    if(budget==='l') R.push(Object.assign(P('noise-0'),{why:'Весь автомобиль: двери, арки, пол, багажник'}));
    else { R.push(Object.assign(P('noise-2'),{why:'Арки дают больше всего шума от дороги и шипов'})); if(budget==='m') R.push(Object.assign(P('noise-1'),{why:'Двери: тише и лучше звучит музыка'})); }
  }
  if(need==='sun'){
    if(PROMO_END-Date.now()>0) R.push(Object.assign(P('tint-0'),{why:'Акция до 31 октября — по фиксированной цене'})); else R.push(Object.assign(P('tint-3'),{why:'Заднее стекло'}));
    if(budget!=='s') R.push(Object.assign(P('tint-5'),{why:'Атермальная плёнка на передние: прохладнее и законно'}));
    if(budget==='l') R.push(Object.assign(P('tint-6'),{why:'Атермальное лобовое — меньше нагрев салона летом'}));
  }
  if(age==='sale'){ R.push({id:'presale',title:'Предпродажная подготовка',price:null,why:'Поднимем вид авто с лучшим соотношением «результат / вложения»'}); }
  return R;
}

function tintSVG(){
  const lvl=state.tintLevel; const a = 1 - lvl/100; // opacity of tint
  const op = Math.min(.96, a*1.02);
  return `<svg class="tint-svg" viewBox="0 0 360 200" aria-label="Тонировка ${lvl}%">
  <defs>
   <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2e6"/><stop offset="1" stop-color="#e7d3b2"/></linearGradient>
   <clipPath id="winClip"><path d="M70,40 C96,22 130,14 170,14 L176,14 L176,96 L46,96 C52,70 58,52 70,40 Z M184,14 L236,14 C268,14 296,30 318,60 L326,96 L184,96 Z"/></clipPath>
   <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="360" height="200" fill="#2a2f39"/>
  <g clip-path="url(#winClip)">
    <rect width="360" height="110" fill="url(#sky)"/>
    <g fill="#5e6a7a">${[[0,40,40],[44,24,30],[80,52,46],[130,30,36],[170,60,28],[204,36,44],[252,46,38],[294,28,52]].map(b=>`<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="80"/>`).join('')}</g>
    <g fill="#ffe7a3" opacity=".8">${Array.from({length:22},(_,i)=>`<rect x="${8+i*16}" y="${70+(i%3)*8}" width="4" height="5"/>`).join('')}</g>
    <circle cx="120" cy="72" r="13" fill="#3b3f47"/><path d="M100,100 C102,86 110,82 120,82 C130,82 138,86 140,100 Z" fill="#3b3f47"/>
    <rect width="360" height="110" fill="#06080b" style="opacity:${op};transition:opacity .4s"/>
    <rect width="360" height="110" fill="url(#glare)"/>
  </g>
  <path d="M20,120 C20,104 30,98 46,96 L70,40 C96,22 130,14 170,14 L236,14 C268,14 296,30 318,60 L330,96 C346,100 352,108 352,120 L352,150 L20,150 Z" fill="none" stroke="#c9ced8" stroke-width="2.2"/>
  <path d="M46,96 L330,96" stroke="#c9ced8" stroke-width="2"/><path d="M180,14 L180,150" stroke="#c9ced8" stroke-width="5"/>
  <path d="M20,96 L20,150 L352,150 L352,110" fill="#3c4250"/>
  <rect x="140" y="112" width="22" height="5" rx="2.5" fill="#1d2027"/><rect x="300" y="112" width="22" height="5" rx="2.5" fill="#1d2027"/>
  <rect x="0" y="160" width="360" height="40" fill="#1b1f27"/>
  <text x="16" y="186" fill="#eef0f4" font-family="Jost,sans-serif" font-size="15" font-weight="700">${lvl}% света</text>
  <text x="344" y="186" fill="#8a92a2" text-anchor="end" font-family="Onest,sans-serif" font-size="12">${state.tintZone==='rear'?'задняя полусфера':'передние / лобовое'}</text>
  </svg>`;
}
function tintInfo(){
  const l=state.tintLevel, z=state.tintZone;
  if(z==='front'){
    const ok = l>=70;
    return `<div class="tint-info"><span class="st ${ok?'ok':'no'}">${ok?'Законно':'Не по нормам'}</span><span>${ok?'Для лобового и передних боковых — подходит атермальная плёнка: режет жару и ИК, а светопропускание остаётся не ниже 70%.':'По техрегламенту лобовое и передние боковые стёкла должны пропускать не меньше 70% света. Предложим атермальную плёнку — она защищает от жары и остаётся в норме.'}</span></div>`;
  }
  return `<div class="tint-info"><span class="st ok">Законно</span><span>На задние стёкла ограничений нет. ${l<=5?'5% — почти непроглядно снаружи, максимум приватности.':l<=15?'15% — самый популярный вариант: салон не видно, обзор назад сохраняется.':l<=35?'35% — лёгкое затемнение, хорошо видно ночью.':'Лёгкая тонировка: меньше бликов и нагрева.'}</span></div>`;
}
