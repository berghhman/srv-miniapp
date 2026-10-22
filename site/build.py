"""Собирает статические страницы сайта SRV Detailing: python3 site/build.py
Шапка, подвал и SEO — общие; интерактив (схема плёнки, прайс, работы, видео, запись) рендерит assets/site.js.
Тексты услуг — с srv-auto.ru (октябрь 2026)."""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = 'https://berghhman.github.io/srv-miniapp/site/'
PHONE, PHONE_HREF = '+7 (812) 372-98-11', 'tel:+78123729811'
LINKS = dict(tg='https://t.me/srv_roman', wa='https://wa.me/79213028511', max='https://max.ru/u/f9LHodD0cOLo27LbOB5GHpdtIrcdj2GOQ26cN7FxoW6RQfyk2yIjY1RW4RU',
             channel='https://t.me/srvdetailing', vk='https://vk.ru/srv_detailing', yt='https://youtube.com/channel/UCMr5-1sLnA-QrMiX2cCDy0w',
             ig='https://www.instagram.com/srv_detailing', tt='https://www.tiktok.com/@srv_detailing_', yandex='https://yandex.ru/maps/-/CThXj29K',
             gis='https://go.2gis.com/YpZce', reviews='https://yandex.ru/maps/org/srv/51187556779/reviews/',
             price_pdf='https://srv-auto.ru/wp-content/themes/srv/price/price-srv-simonova.pdf', policy='https://srv-auto.ru/privacy-policy/')
e = html.escape

SERVICES = [
 dict(id='ppf', slug='okleyka-plenkoy', nav='Оклейка защитной плёнкой', from_='от 8 000 ₽', cats='zones,ppf,full',
  title='Оклейка автомобиля защитной плёнкой в СПб — SRV Detailing',
  desc='Оклейка полиуретановой плёнкой PPF: зоны риска, отдельные детали, полная оклейка и смена цвета. Схема покрытия с ценами онлайн. Пожизненная гарантия на работу. ул. Симонова, 11.',
  h1='Оклейка автомобиля защитной плёнкой',
  intro='Полиуретановая плёнка PPF принимает удары камней, песка и реагентов на себя — заводская краска остаётся целой. Прозрачная, матовая или цветная: оклеиваем зоны риска, отдельные детали или весь кузов. Отметьте детали на схеме — стоимость посчитается сразу.',
  benefits=[('Защита от сколов и царапин','Плёнка принимает удар на себя, ЛКП остаётся целым.'),('Самовосстановление','Мелкие царапины затягиваются под действием тепла.'),('Защита от УФ и выгорания','Цвет кузова сохраняет яркость и насыщенность.'),('Смена цвета без покраски','Цветные и матовые плёнки — более 1000 оттенков, заводская краска под защитой.'),('Снятие без следов','Под плёнкой остаётся заводской слой краски.'),('7–10 лет службы','При правильной оклейке и уходе.')],
  steps=[('Подготовка','Мойка, очистка и обезжиривание. Мелкие сколы — локальная реставрация.'),('Демонтаж','Снимаем ручки, эмблемы и детали, чтобы завернуть плёнку за кромки.'),('Нанесение','Раскрой и монтаж «мокрым» или «сухим» методом — по типу плёнки.'),('Финиш','Прогрев, удаление воздуха, проверка под светом, обратная сборка.')],
  extra='''<div class="cols-2"><div class="card"><h3>Плёнки, с которыми работаем</h3><p>Полиуретан (PPF) премиальных брендов: SunTek, LLumar, Hexis, Spectroll, Crystal. Глянец, мат, сатин, цветные, хамелеон, карбон. На плёнку — гарантия производителя от 3 до 10 лет, на работу — пожизненная.</p></div>
<div class="card"><h3>Подарки и условия</h3><p>При оклейке пакетов «Оптима» и «Премиум» — антидождь передней полусферы в подарок. При полной оклейке — химчистка дисков, мойка «люкс» и антидождь всех стёкол. Подготовка поверхности входит в стоимость. Особые условия для новых китайских моделей: Voyah, Lixiang, Zeekr, Changan, Chery, Haval.</p></div></div>''',
  faq=[('Полиуретан или винил?','Полиуретан эластичен, самовосстанавливается и служит 5–10 лет. Винил дешевле, со временем желтеет и служит 3–5 лет. Мы работаем с полиуретаном.'),('Когда лучше оклеивать?','Сразу после покупки нового автомобиля, пока на кузове нет сколов.'),('Как ухаживать после оклейки?','Первую мойку — через 3–7 дней, мягкой губкой и pH-нейтральным шампунем. Мойку под давлением — через 1–2 недели.'),('Будут ли видны границы?','При полной оклейке с подворотом стыков почти нет. При частичной оклейке остаётся аккуратный шов по краю детали.'),('Можно ли полировать плёнку?','Лёгкую полировку — мягкими средствами, глубокую — только составами для PPF.'),('От чего зависит цена?','От бренда плёнки, площади, набора зон и сложности кузова. Точную сумму мастер назовёт после осмотра — она может быть ниже прайса.')],
  blog='плёнк,пленк,брон,ppf', time='Фары — 1 час · лобовое — 5–6 часов · зоны риска — сутки · полная — от 3 дней'),
 dict(id='ceramic', slug='zashhitnoe-pokrytie', nav='Керамика и жидкое стекло', from_='от 15 000 ₽', cats='ceramic',
  title='Керамическое покрытие и жидкое стекло Krytex в СПб — SRV Detailing',
  desc='Нанесение керамики Krytex 9H, жидкого стекла и керамики для PPF, кожи и дисков. Глянец, гидрофоб и защита на 3–5 лет. Цены, этапы, запись онлайн.',
  h1='Керамическое покрытие и жидкое стекло',
  intro='Составы Krytex высокой твёрдости дают глубокий глянец и гидрофобный эффект: вода, грязь и реагенты скатываются, кузов дольше остаётся чистым. Наносим на кузов, плёнку, кожу и диски в чистом боксе с контролем температуры и влажности.',
  benefits=[('Глубокий глянец','Особенно заметен на тёмных цветах.'),('Гидрофобность','Вода и реагенты скатываются, мыть проще.'),('Защита от химии и выгорания','ЛКП не мутнеет и сохраняет заводской цвет.'),('3–5 лет службы','Керамика 9H; жидкое стекло — около года.'),('Керамика поверх плёнки','Лучшая связка: плёнка от сколов, керамика — глянец и гидрофоб.'),('Простой уход','Достаточно бесконтактной мойки с нейтральным pH.')],
  steps=[('Диагностика ЛКП','Оцениваем состояние, износ и повреждения.'),('Мойка и обезжиривание','Удаляем битум, металл, следы насекомых.'),('Полировка','Убираем микроцарапины и голограммы — обязательно перед керамикой.'),('Нанесение','Слой за слоем: Krytex 9H, Krytex 8, жидкое стекло 7H.'),('Контроль и сушка','Проверка под лампами и время на закрепление состава.')],
  extra='''<div class="cols"><div class="card"><h3>Krytex 9H</h3><p>Керамическое покрытие высокой твёрдости, наносится в 1–2 слоя. Служит 3–5 лет.</p></div><div class="card"><h3>Krytex 8</h3><p>Защитный верхний слой: усиливает гидрофоб и упрощает уход.</p></div><div class="card"><h3>Krytex 7H</h3><p>Жидкое стекло — доступная базовая защита примерно на год.</p></div></div>''',
  faq=[('Чем керамика отличается от жидкого стекла?','Керамика служит 3–5 лет и имеет твёрдость до 9H. Жидкое стекло дешевле, но держится около года.'),('Что значит 9H?','Уровень твёрдости по карандашной шкале. Покрытие защищает от микроцарапин и химии, но не от сильных сколов.'),('Защищает ли керамика от сколов?','Нет. От сколов защищает плёнка PPF. Керамику можно нанести поверх плёнки.'),('Нужна ли полировка?','Перед керамикой — обязательно, иначе покрытие «законсервирует» дефекты.'),('Как ухаживать?','Первые дни не мыть, дальше — бесконтактная мойка и средства с нейтральным pH.')],
  blog='керам,стекл,9h', time='Обычно 1–2 дня вместе с подготовкой'),
 dict(id='tint', slug='tonirovka', nav='Тонировка стёкол', from_='от 2 000 ₽', cats='tint',
  title='Тонировка стёкол автомобиля в СПб по ГОСТу — SRV Detailing',
  desc='Евротонировка задней полусферы, атермальные плёнки на лобовое и передние стёкла по ГОСТу. Примерьте тонировку онлайн. Гарантия на плёнку 10 лет.',
  h1='Тонировка стёкол автомобиля',
  intro='Тонируем заднюю полусферу, лобовое и передние стёкла — атермальной или затемняющей плёнкой, в рамках ГОСТа. Примерьте плотность прямо на странице: так салон будет выглядеть изнутри.',
  benefits=[('Салон не выгорает','Плёнка блокирует ультрафиолет — обивка, кожа и пластик сохраняют цвет.'),('Меньше нагрева','Летом и в пробках в салоне заметно прохладнее.'),('Меньше бликов','Глаза меньше устают от солнца и фар.'),('Уединение','Салон не видно снаружи.'),('Гарантия 10 лет','Плёнка не выгорает, не пузырится и не отслаивается.'),('По ГОСТу','Передние стёкла — только атермальной плёнкой с допустимым светопропусканием.')],
  steps=[('Очистка стёкол','Тщательно моем и обезжириваем.'),('Подгонка плёнки','Точный раскрой по форме стекла.'),('Монтаж','Выгоняем воду и пузырьки.'),('Контроль','Без перекосов, складок и отклеивающихся краёв.')],
  extra='''<div class="cols-2"><div class="card"><h3>Виды плёнки</h3><p><b>Атермальная</b> — отражает ультрафиолет и инфракрасное излучение, почти не затемняя стекло, подходит для лобового. <b>Затемняющая</b> — классика для уединения. <b>Металлизированная</b> — отражает тепло и разгружает кондиционер. <b>Крашеная</b> — недорогой вариант с выбором оттенков.</p></div>
<div class="card"><h3>Что по закону</h3><p>Лобовое и передние боковые стёкла должны пропускать не меньше 70% света. Для них подбираем атермальные плёнки, которые остаются в норме. Задние стёкла можно тонировать любой плотности.</p></div></div>''',
  tint=True,
  faq=[('Что такое евротонировка?','Тонировка задней полусферы: задние боковые и заднее стекло. Сейчас — 5 000 ₽ по акции до 31 октября.'),('Будут ли штрафы?','Нет: на передние стёкла ставим только плёнки, которые сохраняют светопропускание по ГОСТу.'),('Сколько служит плёнка?','На плёнку — гарантия 10 лет: не выгорает, не пузырится и не отслаивается.')],
  blog='тонир', time='Задняя полусфера — 2–3 часа'),
 dict(id='polish', slug='polirovka', nav='Полировка кузова', from_='от 2 000 ₽', cats='polish',
  title='Полировка кузова автомобиля в СПб — SRV Detailing',
  desc='Восстановительная, абразивная и защитная полировка кузова, оптики и глянцевых вставок. Убираем царапины, паутинку и окисление. Цены и запись онлайн.',
  h1='Полировка кузова автомобиля',
  intro='Полировка возвращает кузову глубину цвета и зеркальный блеск: убирает паутинку, голограммы, мелкие царапины и окисление. Работаем профессиональными составами в несколько проходов — с контролем температуры и толщины лака.',
  benefits=[('Без царапин и паутинки','Убираем микроповреждения и потёртости.'),('Зеркальный блеск','Кузов выглядит как с новым лаком.'),('Насыщенный цвет','Особенно заметно на тёмных оттенках.'),('Без окисления и матовости','Уходят мутные пятна и налёт.'),('Безопасно для ЛКП','Щадящий режим и контроль глубины обработки.'),('Подготовка к защите','Керамика, воск и плёнка держатся дольше.')],
  steps=[('Мойка и деконтаминация','Убираем битум, металл и «невидимую» грязь.'),('Грубая паста','Выравниваем глубокие риски и голограммы.'),('Средняя паста','Убираем следы предыдущего этапа.'),('Финиш','Финишная паста и, по желанию, защитное покрытие.')],
  extra='''<div class="cols"><div class="card"><h3>Восстановительная</h3><p>Освежает уставший лак, убирает мелкие царапины.</p></div><div class="card"><h3>Абразивная</h3><p>Глубокая коррекция сильных царапин и следов от моек.</p></div><div class="card"><h3>Защитная и финишная</h3><p>Барьер от пыли, соли и УФ; зеркальный блеск перед продажей.</p></div></div>''',
  faq=[('Как часто полировать?','Раз в год, если машина стоит под открытым небом и ездит зимой. При гаражном хранении — реже, по состоянию ЛКП.'),('Не снимет ли полировка лишний лак?','Нет: работаем щадящими режимами и контролируем глубину обработки на каждой детали.'),('Можно отполировать одну деталь?','Да, локальная полировка детали с царапиной — от 5 000 ₽.')],
  blog='полир,царап', time='Полный кузов — 1–2 дня'),
 dict(id='clean', slug='himchistka-salona', nav='Химчистка салона', from_='от 2 000 ₽', cats='clean',
  title='Химчистка салона автомобиля в СПб — SRV Detailing',
  desc='Химчистка салона: сиденья, потолок, пол, двери и багажник. Экстракторная чистка, уход за кожей, озонирование от запахов. Цены и запись онлайн.',
  h1='Химчистка салона автомобиля',
  intro='Убираем пятна, пыль, бактерии и запахи, которые копятся годами. Экстракторная чистка текстиля, уход за кожей и алькантарой, озонирование — безопасными составами и щадящими методами.',
  benefits=[('Глубинная очистка','Пятна и пыль, накопившиеся годами.'),('Антибактериальная обработка','Против грибка, плесени и микробов — важно, если в машине дети или животные.'),('Без запахов','Еда, сигареты, сырость, питомцы.'),('Защита кожи и текстиля','Против растрескивания, выгорания и быстрого загрязнения.'),('Свежий цвет обивки','Ткань ярче, поверхности ровнее.'),('Дольше служит салон','Реже нужен ремонт и замена отделки.')],
  steps=[('Осмотр','Определяем материалы и тип загрязнений.'),('Сухая уборка','Пылесос, щели, вентиляция.'),('Химчистка','Экстракторная чистка текстиля, уход за кожей и пластиком.'),('Озонирование','Убираем бактерии и запахи.')],
  extra='''<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Параметр</th><th>Влажная уборка</th><th>Экстракторная чистка</th></tr></thead><tbody>
<tr><td>Принцип</td><td>Снять грязь с поверхности</td><td>Вытянуть грязь изнутри</td></tr><tr><td>Глубина</td><td>Поверхностная</td><td>Глубокая</td></tr><tr><td>Для чего</td><td>Пластик, кожа, стёкла</td><td>Текстиль, ковры, обивка</td></tr><tr><td>Пятна и запахи</td><td>Убирает слабо</td><td>Убирает хорошо</td></tr><tr><td>Высыхание</td><td>Дольше</td><td>Быстро, почти сухо</td></tr></tbody></table></div>
<p class="mini" style="margin-top:12px">Работаем с тканью, кожей, экокожей, велюром, алькантарой, жаккардом и замшей.</p>''',
  faq=[('Сколько сохнет салон?','После экстракторной чистки — несколько часов: текстиль остаётся почти сухим.'),('Уберёте запах сигарет или животных?','Да: химчистка плюс озонирование убирают стойкие запахи.'),('Можно почистить только сиденья или потолок?','Да, от 2 000 ₽ за сиденье и от 8 000 ₽ за потолок.')],
  blog='химчист,салон,запах', time='Полная химчистка — 1 день'),
 dict(id='noise', slug='shumoizolyatsiya', nav='Шумоизоляция', from_='от 35 000 ₽', cats='noise',
  title='Шумоизоляция автомобиля в СПб — SRV Detailing',
  desc='Шумоизоляция дверей, арок, пола, крыши, багажника и капота. Снижение шума до 90% и гарантия 10 лет. Цены и запись онлайн.',
  h1='Шумоизоляция автомобиля',
  intro='Шум шин, двигателя, гравия и ветра утомляет в дороге. Обрабатываем двери, арки, пол, крышу, багажник и капот современными материалами — в салоне становится тише, теплее и лучше звучит музыка.',
  benefits=[('Шум — до 90% тише','Меньше звуков дороги, шин и двигателя.'),('Теплопотери — до 70% меньше','Зимой теплее, летом прохладнее.'),('Без скрипов и вибраций','Убираем раздражающие звуки при движении.'),('Лучше звучит музыка','Особенно после обработки дверей.'),('Гарантия 10 лет','На материалы и работу.'),('Дороже при продаже','Тихий салон ценят покупатели.')],
  steps=[('Разбор','Снимаем обшивку нужных зон.'),('Вибропоглотитель','Гасит колебания металла и защищает от коррозии.'),('Звукоизоляция и поглощение','Барьер для шума и поглощение звуковых волн.'),('Сборка и проверка','Собираем без скрипов, проверяем на ходу.')],
  zones=True,
  extra='''<div class="cols-4"><div class="card"><h3>Вибропоглотители</h3><p>Гасят колебания металла и защищают от коррозии.</p></div><div class="card"><h3>Звукоизоляторы</h3><p>Барьер для внешнего шума, экологичны и безопасны.</p></div><div class="card"><h3>Звукопоглотители</h3><p>Поглощают звуковые волны внутри салона.</p></div><div class="card"><h3>Теплоизоляторы</h3><p>Комфортная температура круглый год.</p></div></div>''',
  faq=[('С чего начать?','Больше всего шума дают арки и двери — с них обычно и начинают.'),('Сколько длится полная шумоизоляция?','Обычно 2–3 дня в боксе.'),('Не будет ли машина тяжелее?','Современные материалы лёгкие: прибавка веса незаметна на ходу.')],
  blog='шумо,виброи', time='Двери — 1 день · полная — 2–3 дня'),
 dict(id='dents', slug='udalenie-vmyatin', nav='Удаление вмятин без покраски', from_='по осмотру', cats='dents',
  title='Удаление вмятин без покраски (PDR) в СПб — SRV Detailing',
  desc='Удаление вмятин без покраски по технологии PDR: сохраняем заводское ЛКП, ремонт за несколько часов. Оценка по фото, запись онлайн.',
  h1='Удаление вмятин без покраски',
  intro='Технология PDR выправляет вмятины с сохранением заводского покрытия — без шпаклёвки, покраски и сушки. Ремонт занимает несколько часов, следов вмешательства не остаётся. Пришлите фото — оценим заранее.',
  benefits=[('Заводская краска','Нет риска несовпадения цвета, покрытие остаётся родным.'),('Быстро','Несколько часов вместо дней на покраску.'),('Без следов','Специальный инструмент не оставляет видимых отметин.'),('Дешевле покраски','Не нужны материалы и сушка.')],
  steps=[('Диагностика','Мастер оценивает вмятину и выбирает технику.'),('Выправление','Рычаги и вакуумные присоски возвращают форму.'),('Контроль','Проверяем поверхность под разными углами и светом.')],
  extra='''<div class="cols-2"><div class="card"><h3>Когда подходит PDR</h3><p>Мелкие и средние вмятины: град, парковка, упавшие предметы. Повреждения без сколов и трещин краски, без сильных заломов.</p></div><div class="card"><h3>Когда не подходит</h3><p>Сложные повреждения с сильными заломами и повреждённой краской — там нужен классический кузовной ремонт.</p></div></div>''',
  faq=[('Сколько стоит?','Цена зависит от размера, места и глубины вмятины — назовём после осмотра или по фото.'),('Сколько времени занимает?','Обычно несколько часов.'),('Можно ли убрать вмятины от града?','Да, град — типичный случай для PDR.')],
  blog='вмятин,pdr', time='Обычно несколько часов'),
]
SVC_BY_ID = {s['id']: s for s in SERVICES}

def rel(depth): return '../' * depth

def head(title, desc, depth, canon, og_img='img/cover.png', extra=''):
    R = rel(depth + 1)
    return f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{BASE}{canon}">
<meta name="theme-color" content="#0c0e12">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="https://berghhman.github.io/srv-miniapp/{og_img}">
<link rel="icon" href="{R}media/brand/mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Onest:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="{rel(depth)}assets/site.css">
{extra}
</head>
<body>
'''

def header(depth, active=''):
    r = rel(depth); R = rel(depth + 1)
    svc_links = ''.join(f'<a href="{r}uslugi/{s["slug"]}.html"><b style="font-weight:500">{s["nav"]}</b><span>{s["from_"]}</span></a>' for s in SERVICES)
    msvc = ''.join(f'<a href="{r}uslugi/{s["slug"]}.html">{s["nav"]}<span>{s["from_"]}</span></a>' for s in SERVICES)
    def na(href, label, key): return f'<a href="{r}{href}"{" aria-current=\"page\"" if active==key else ""}>{label}</a>'
    return f'''<a class="hp" href="#main">К содержанию</a>
<div class="promo-bar" id="promo-bar" data-promo><div class="wrap"><span><b>Евротонировка задней полусферы — 5 000 ₽</b><span class="hide-m"> · акция до 31 октября</span></span><span class="cdn hide-m" data-cdn></span><span class="sp"></span><button class="link" data-open="tint" style="font-size:14px">Примерить</button><button class="x" id="promo-x" aria-label="Скрыть">✕</button></div></div>
<header class="hdr"><div class="wrap">
 <a class="logo" href="{r}index.html" aria-label="СРВ Детейлинг — на главную"><img src="{R}media/brand/logo-w.png" alt="СРВ Детейлинг" width="83" height="40"></a>
 <nav class="nav" aria-label="Основное меню">
  <div class="dd"><button aria-haspopup="true">Услуги {"<svg class='ic' viewBox='0 0 24 24' style='width:14px'><path d='M6 9l6 6 6-6'/></svg>"}</button><div class="dd-menu">{svc_links}</div></div>
  {na('raschet.html','Расчёт плёнки','raschet')}{na('czeny.html','Цены','czeny')}{na('raboty.html','Работы','raboty')}{na('blog.html','Блог','blog')}{na('o-kompanii.html','О компании','about')}{na('kontakty.html','Контакты','kontakty')}
 </nav>
 <div class="hdr-r">
  <a class="hdr-phone" href="{PHONE_HREF}"><b>{PHONE}</b><span class="status" data-status></span></a>
  <button class="btn btn-red btn-sm btn-cta cart-btn" data-open="book">Записаться<span class="badge" data-badge hidden>0</span></button>
  <button class="burger" id="burger" aria-label="Меню" aria-expanded="false"><svg class="ic" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
 </div>
</div></header>
<nav class="mnav" id="mnav" hidden aria-label="Меню">
 <div class="grp">Услуги</div>{msvc}
 <div class="grp">Разделы</div>
 <a href="{r}raschet.html">Расчёт плёнки на схеме<span>онлайн</span></a><a href="{r}czeny.html">Цены</a><a href="{r}raboty.html">Работы и видео</a><a href="{r}blog.html">Блог</a><a href="{r}o-kompanii.html">О компании</a><a href="{r}kontakty.html">Контакты</a>
 <div class="grp">Связаться</div><a href="{PHONE_HREF}">{PHONE}<span data-status></span></a><a href="{LINKS['tg']}" target="_blank" rel="noopener">Telegram<span>@srv_roman</span></a><a href="{LINKS['wa']}" target="_blank" rel="noopener">WhatsApp</a>
</nav>
<main id="main">
'''

def footer(depth):
    r = rel(depth); R = rel(depth + 1)
    svc = ''.join(f'<a href="{r}uslugi/{s["slug"]}.html">{s["nav"]}</a>' for s in SERVICES)
    soc = ''.join(f'<a href="{LINKS[k]}" target="_blank" rel="noopener" aria-label="{n}" style="display:inline"><img src="{R}media/site-icons/{f}.png" alt="{n}" width="42" height="42" loading="lazy"></a>' for k, n, f in [('channel','Telegram-канал','2026-05-telegram'),('vk','ВКонтакте','2026-05-vk'),('yt','YouTube','2026-05-youtube'),('ig','Instagram','2026-05-instagram'),('tt','TikTok','2026-05-social-media')])
    return f'''</main>
<footer class="ftr"><div class="wrap">
 <div><img src="{R}media/brand/logo-w.png" alt="СРВ Детейлинг" width="100" height="48" style="margin-bottom:16px" loading="lazy"><p class="muted" style="max-width:34ch">Детейлинг-центр на севере Петербурга. Защитная плёнка, керамика, тонировка, полировка, химчистка и шумоизоляция. В деле с 2001 года.</p><div class="socials" style="margin-top:18px">{soc}</div></div>
 <div><h4>Услуги</h4>{svc}</div>
 <div><h4>Разделы</h4><a href="{r}raschet.html">Расчёт плёнки</a><a href="{r}czeny.html">Цены</a><a href="{r}raboty.html">Работы и видео</a><a href="{r}blog.html">Блог</a><a href="{r}o-kompanii.html">О компании</a><a href="{r}kontakty.html">Контакты</a><a href="{LINKS['price_pdf']}" target="_blank" rel="noopener">Прайс-лист (PDF)</a></div>
 <div><h4>Контакты</h4><a href="{PHONE_HREF}" style="font-family:var(--f-display);font-size:22px;color:#fff">{PHONE}</a><a href="mailto:zakaz@srv-auto.ru">zakaz@srv-auto.ru</a><p class="muted" style="margin-top:6px">Санкт-Петербург, ул. Симонова, 11<br>ПН–СБ 10:00–20:00, ВС — по записи</p>
  <div class="row" style="margin-top:12px"><a class="chip-link" style="display:inline-flex" href="{LINKS['tg']}" target="_blank" rel="noopener">Telegram</a><a class="chip-link" style="display:inline-flex" href="{LINKS['wa']}" target="_blank" rel="noopener">WhatsApp</a><a class="chip-link" style="display:inline-flex" href="{LINKS['max']}" target="_blank" rel="noopener">Max</a></div></div>
 <div class="legal"><span>ООО «СРВ-АВТО» · ИНН 7802868813 · ОГРН 1147847292218</span><span>Сайт носит информационный характер и не является публичной офертой · <a href="{LINKS['policy']}" target="_blank" rel="noopener">Политика конфиденциальности</a></span></div>
</div></footer>
<div class="mbar"><a class="btn btn-ghost" href="{PHONE_HREF}">Позвонить</a><a class="btn btn-ghost" href="{LINKS['tg']}" target="_blank" rel="noopener">Telegram</a><button class="btn btn-red cart-btn" data-open="book">Записаться<span class="badge" data-badge hidden>0</span></button></div>
<div class="overlay" id="overlay"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Запись"><div class="drawer-h"><h3>Запись в SRV</h3><button class="xbtn" data-close aria-label="Закрыть"><svg class="ic" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div><div class="drawer-b" id="drawer-b"></div></aside>
<div class="modal" id="modal" role="dialog" aria-modal="true"><button class="xbtn" data-close aria-label="Закрыть"><svg class="ic" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button><div id="modal-b"></div></div>
<div class="viewer" id="viewer" role="dialog" aria-modal="true" hidden></div>
<div class="toast" id="toast" role="status"></div>
<script>window.SRV_ROOT='{R}';</script>
<script src="{R}data/media.js"></script>
<script src="{r}assets/core.js"></script>
<script src="{r}assets/site.js"></script>
</body>
</html>
'''

def sec_h(eyebrow, title, sub='', right=''):
    return f'<div class="sec-h"><div><span class="eyebrow">{eyebrow}</span><h2>{title}</h2>{f"<p class=\"lead\">{sub}</p>" if sub else ""}</div>{right}</div>'

def faq_html(items):
    return '<div class="card faq">' + ''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in items) + '</div>'

def jsonld(obj): return f'<script type="application/ld+json">{json.dumps(obj, ensure_ascii=False)}</script>'

def lead_block(title='Записаться или задать вопрос', sub='Оставьте телефон — мастер перезвонит, ответит на вопросы и подтвердит время. Без записи тоже можно: ПН–СБ 10:00–20:00.', slot='pg'):
    return f'''<section class="sec" id="zapis"><div class="wrap"><div class="contact">
 <div class="card"><span class="eyebrow">Запись</span><h2>{title}</h2><p class="muted">{sub}</p>
  <div class="walkin"><div class="big">БЕЗ<br>ЗАПИСИ</div><p class="muted">Приезжайте ПН–СБ с 10:00 до 20:00. В воскресенье — по предварительной записи.</p></div>
  <a class="phone-big" href="{PHONE_HREF}">{PHONE}</a>
  <div class="row"><a class="chip-link" href="{LINKS['tg']}" target="_blank" rel="noopener">Telegram</a><a class="chip-link" href="{LINKS['wa']}" target="_blank" rel="noopener">WhatsApp</a><a class="chip-link" href="{LINKS['max']}" target="_blank" rel="noopener">Max</a><a class="chip-link" href="{LINKS['yandex']}" target="_blank" rel="noopener">Маршрут · Симонова, 11</a></div>
 </div>
 <div class="card"><div data-lead-slot="{slot}"></div></div>
</div></div></section>'''

ORG = {"@context": "https://schema.org", "@type": "AutoRepair", "name": "SRV Detailing (СРВ Детейлинг)", "url": BASE, "telephone": "+7 812 372-98-11", "email": "zakaz@srv-auto.ru",
       "image": "https://berghhman.github.io/srv-miniapp/img/cover.png",
       "address": {"@type": "PostalAddress", "streetAddress": "ул. Симонова, 11", "addressLocality": "Санкт-Петербург", "postalCode": "194358", "addressCountry": "RU"},
       "geo": {"@type": "GeoCoordinates", "latitude": 60.060339, "longitude": 30.327106},
       "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "10:00", "closes": "20:00"}],
       "priceRange": "₽₽", "sameAs": [LINKS['vk'], LINKS['channel'], LINKS['yt']]}

def write(path, content):
    full = os.path.join(HERE, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(content)

# ---------------- главная ----------------
def home():
    d = 0; R = rel(1)
    svc_cards = ''.join(f'''<a class="svc-card" href="uslugi/{s['slug']}.html"><span class="ph" data-svc-poster="{s['id']}"><img src="{R}media/svc/{s['id']}/poster.webp" alt="{e(s['nav'])}" loading="lazy"></span><span class="bd"><h3>{s['nav']}</h3><p>{e(s['intro'].split('. ')[0])}.</p><span class="from num">{s['from_']}</span></span></a>''' for s in SERVICES)
    body = header(d, 'home') + f'''
<section class="hero"><div class="hero-media" data-hero-video="{R}media/video/hero-wide.mp4" data-mob="{R}media/video/hero.mp4" data-poster="{R}media/video/hero-wide.webp"><img src="{R}media/video/hero-wide.webp" alt="" fetchpriority="high"></div>
 <div class="wrap"><span class="eyebrow" style="color:#ffb3b6">Детейлинг-центр на севере Петербурга · ул. Симонова, 11</span>
  <h1 style="margin-top:14px;max-width:14ch">Детейлинг автомобиля, после которого <em>снова влюбляются</em></h1>
  <ul><li>Полный спектр детейлинг-услуг</li><li>Гарантия на все виды работ — на плёнку до 10 лет</li><li>В деле с 2001 года</li></ul>
  <div class="hero-cta"><a class="btn btn-red" href="raschet.html">Рассчитать защиту плёнкой</a><button class="btn btn-ghost" data-open="book">Записаться</button></div>
  <div class="hero-meta"><div class="hstat"><b class="num">25+</b><span>лет в деле</span></div><div class="hstat"><b class="num">10</b><span>лет гарантии на материалы</span></div><div class="hstat"><b class="num">1000+</b><span>цветов плёнки</span></div>
   <a class="rate" href="{LINKS['reviews']}" target="_blank" rel="noopener"><img src="{R}media/brand/yandex-rating.png" alt="Хорошее место, 5,0"><span><b>Хорошее место</b><span>5,0 на Яндекс Картах</span></span></a></div>
 </div></section>

<section class="sec"><div class="wrap">
 {sec_h('Услуги','Что делаем в SRV','Комплексная, максимально тщательная обработка автомобиля: восстановление, защита и улучшение внешнего вида — на уровне микрон по поверхности, коже, пластику и стеклу.','<a class="btn btn-ghost btn-sm" href="czeny.html">Все цены</a>')}
 <div class="svc-grid">{svc_cards}<a class="svc-card tool" href="raschet.html"><span class="bd" style="justify-content:center"><span class="eyebrow" style="color:#ffb3b6">Онлайн</span><h3 style="font-size:26px">Схема защиты плёнкой</h3><p style="color:#c9ced8">Отметьте детали на фото автомобиля — цена, срок и подарки посчитаются сразу.</p><span class="link">Открыть расчёт →</span></span></a></div>
</div></section>

<section class="sec sec-alt" id="raschet"><div class="wrap">
 {sec_h('Расчёт онлайн','Схема покрытия плёнкой','Выберите пакет или нажмите на детали прямо на фото. Капот и крыша — по кругу: полоса → целиком. Режим «Где летят сколы» покажет зоны риска.')}
 <div data-ppf></div>
</div></section>

<section class="sec" data-promo><div class="wrap"><div class="promo">
 <div><span class="tag">Спецпредложение октября</span><h2 style="margin:14px 0 10px">Евротонировка задней полусферы</h2><div class="price num">5 000 ₽</div><p class="muted" style="margin-top:10px">Задние боковые и заднее стекло, плёнка с гарантией 10 лет. Акция до 31 октября.</p>
  <div class="row" style="margin-top:20px"><button class="btn btn-red" data-addid="tint-0" data-open="book">Записаться по акции</button><button class="btn btn-ghost" data-open="tint">Примерить тонировку</button></div></div>
 <div><div class="cd" data-cd></div></div>
</div></div></section>

<section class="sec"><div class="wrap">
 {sec_h('Подбор','Не знаете, с чего начать?')}
 <div class="tools">
  <button class="tool" data-open="quiz"><span class="ti">{"<svg class='ic' viewBox='0 0 24 24'><path d='M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4'/><circle cx='12' cy='12' r='9.5'/></svg>"}</span><h3>Подбор за 30 секунд</h3><p>Три вопроса — и готовый план ухода с ценами под ваш автомобиль и бюджет.</p><span class="go">Пройти подбор →</span></button>
  <button class="tool" data-open="tint"><span class="ti">{"<svg class='ic' viewBox='0 0 24 24'><path d='M3 16l3-8h12l3 8z'/><path d='M6 8l6 8M10 8l6 8'/></svg>"}</span><h3>Примерка тонировки</h3><p>Посмотрите, как будет выглядеть 5, 15, 35 или 50% — и что можно по ГОСТу на передние стёкла.</p><span class="go">Примерить →</span></button>
  <button class="tool" data-open="book"><span class="ti">{"<svg class='ic' viewBox='0 0 24 24'><rect x='3.5' y='5' width='17' height='15' rx='2'/><path d='M3.5 10h17M8 3v4M16 3v4'/></svg>"}</span><h3>Консультация мастера</h3><p>Оставьте телефон — подскажем, что подойдёт именно вашей машине, без навязывания лишнего.</p><span class="go">Оставить телефон →</span></button>
 </div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
 {sec_h('Наши работы','Машины из нашего бокса','Каждый проект — серия фото до выдачи клиенту. Нажмите, чтобы листать.','<a class="btn btn-ghost btn-sm" href="raboty.html">Все работы и видео</a>')}
 <div class="wgrid" data-works="8"></div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_h('Направления','Основные направления детейлинга')}
 <div class="dir">
  <div class="card"><h3>Экстерьер</h3><ul><li>Мойка и деконтаминация</li><li>Полировка ЛКП</li><li>Защитные покрытия и плёнка</li><li>Стёкла и оптика</li><li>Диски и шины</li></ul></div>
  <div class="card"><h3>Интерьер</h3><ul><li>Химчистка салона</li><li>Уход за кожей</li><li>Пластик и резина</li><li>Озонирование</li><li>Стёкла изнутри</li></ul></div>
  <div class="card"><h3>Специальные работы</h3><ul><li>Подкапотное пространство, арки и днище</li><li>Удаление вмятин и царапин</li><li>Подготовка к зиме</li><li>Предпродажная подготовка</li></ul></div>
 </div>
 <div class="tbl-wrap" style="margin-top:22px"><table class="tbl"><thead><tr><th>Параметр</th><th>Обычная мойка</th><th>Детейлинг</th></tr></thead><tbody>
  <tr><td>Цель</td><td>Убрать грязь</td><td>Восстановить и защитить</td></tr><tr><td>Глубина</td><td>Поверхностная</td><td>Работа с микродефектами ЛКП</td></tr><tr><td>Время</td><td>20–60 минут</td><td>От нескольких часов до нескольких дней</td></tr><tr><td>Материалы</td><td>Щётки, шампунь</td><td>Полировальные пасты, полироли, керамика</td></tr><tr><td>Результат</td><td>Чисто</td><td>«Как новый» или лучше</td></tr></tbody></table></div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
 {sec_h('Почему SRV','Больше, чем уход за авто')}
 <div class="cols">
  <div class="card feat"><span class="n">ГАРАНТИЯ</span><h3>До 10 лет на материалы</h3><p>На некоторые работы — пожизненная гарантия. Прозрачные цены без скрытых доплат.</p></div>
  <div class="card feat"><span class="n">КОМФОРТ</span><h3>Чистые тёплые боксы</h3><p>Профессиональное оборудование, яркий свет, контроль температуры и влажности. Зона ожидания с Wi-Fi и кофе.</p></div>
  <div class="card feat"><span class="n">ОПЫТ</span><h3>25+ лет практики</h3><p>Сертифицированные мастера, регулярное обучение, плёнки всех известных брендов.</p></div>
 </div>
 <div class="card boss" style="margin-top:16px"><div class="ava">РС</div><div><q>Мы заботимся о вашем автомобиле, как о своём. Объясним, покажем, подскажем — без скрытых доплат.</q><p class="muted" style="margin-top:10px">Роман Савочкин, руководитель SRV · <a class="link" href="{LINKS['tg']}" target="_blank" rel="noopener">Задать вопрос руководителю</a></p></div></div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_h('Видео','Как мы работаем','Ролики из бокса на Симонова, 11.')}
 <div class="vgrid" data-videos="all"></div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
 {sec_h('Ещё','Что ещё можно сделать в детейлинге')}
 <div class="cols-4">
  <div class="card"><h3>Сколы и царапины</h3><p>Точечная подкраска с последующей полировкой.</p></div>
  <div class="card"><h3>Подкапотное, арки, днище</h3><p>Аккуратная мойка двигателя с защитой разъёмов, мойка арок и днища.</p></div>
  <div class="card"><h3>Подготовка к зиме</h3><p>Комплексная защита перед сезоном реагентов.</p><button class="inline-btn" data-add-winter>Добавить в запись +</button></div>
  <div class="card"><h3>Предпродажная подготовка</h3><p>В короткий срок поднимем вид авто в идеальном сочетании «результат / вложения».</p></div>
 </div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_h('Отзывы','Что говорят клиенты','Рейтинг 5,0 и знак «Хорошее место» на Яндекс Картах.','<a class="btn btn-ghost btn-sm" href="'+LINKS['reviews']+'" target="_blank" rel="noopener">Все отзывы на Яндексе</a>')}
 <div class="map" style="min-height:520px;background:#fff"><iframe src="https://yandex.ru/maps-reviews-widget/51187556779?comments" title="Отзывы о SRV на Яндекс Картах" loading="lazy" style="min-height:520px"></iframe></div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
 {sec_h('Команда','Команда, которой можно доверить машину','Сертифицированные мастера с многолетним опытом. Каждая машина проходит обработку по выверенной технологии, под контролем мастера на каждом этапе.')}
 <div class="team" data-team></div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_h('Блог','Полезные статьи','Уход, защита, тонировка и шумоизоляция — простыми словами.','<a class="btn btn-ghost btn-sm" href="blog.html">Все статьи</a>')}
 <div class="bgrid" data-blog="4"></div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
 {sec_h('Вопросы','Частые вопросы')}
 {faq_html([('Чем детейлинг отличается от мойки?','Мойка убирает грязь за 20–60 минут. Детейлинг восстанавливает и защищает: работа с микродефектами ЛКП, полировка, керамика и плёнка — от нескольких часов до нескольких дней.'),('Сколько займёт оклейка плёнкой?','Фары — около часа, лобовое стекло — 5–6 часов, зоны риска — сутки, полная оклейка — от 3 дней.'),('Какая гарантия?','На материалы — до 10 лет, на некоторые работы — пожизненная. Гарантия распространяется на все виды работ.'),('Можно приехать без записи?','Да, с понедельника по субботу с 10:00 до 20:00. В воскресенье — только по предварительной записи.'),('Цены окончательные?','Цены «от» — для типового легкового автомобиля. Итог зависит от сложности кузова и может быть ниже прайса: мастер назовёт точную сумму до начала работ и зафиксирует её.')])}
</div></section>
''' + lead_block() + footer(d)
    hd = head('SRV Detailing — детейлинг автомобилей в Санкт-Петербурге', 'Детейлинг-центр SRV в СПб: оклейка защитной плёнкой, керамика Krytex, тонировка, полировка, химчистка, шумоизоляция, удаление вмятин. Расчёт плёнки онлайн. ул. Симонова, 11.', d, '', extra=jsonld(ORG))
    write('index.html', hd + body)

# ---------------- услуги ----------------
def service(s):
    d = 1; R = rel(2); r = rel(1)
    ben = ''.join(f'<div class="card feat"><h3>{e(t)}</h3><p>{e(x)}</p></div>' for t, x in s['benefits'])
    steps = ''.join(f'<div class="step"><b>{e(t)}</b><p>{e(x)}</p></div>' for t, x in s['steps'])
    zones_desc = json.dumps({'Двери (4 шт.)':'Без скрипов и гула, лучше звучит аудиосистема.','Колёсные арки':'Гасит шум шин и дорожного полотна.','Пол':'Меньше шума подвески, сохраняет тепло.','Крыша':'Тише дождь и ветер.','Багажник':'Меньше шума и вибраций сзади.','Капот':'Меньше шума двигателя и наледи.','Моторный щит':'Меньше вибраций и звуков двигателя.','Полная шумоизоляция':'Комплексная обработка всего кузова.'}, ensure_ascii=False)
    others = ''.join(f'<a class="chip" href="{x["slug"]}.html">{x["nav"]}</a>' for x in SERVICES if x['id'] != s['id'])
    body = header(d, 'svc') + f'''
<section class="svc-hero"><video src="{R}media/video/{s['id']}-wide.mp4" poster="{R}media/video/{s['id']}-wide.webp" muted autoplay loop playsinline preload="metadata" aria-hidden="true"></video>
 <div class="wrap"><nav class="crumbs"><a href="{r}index.html">Главная</a>›<a href="{r}czeny.html">Услуги</a>›<span>{s['nav']}</span></nav>
  <h1 style="max-width:16ch">{s['h1']}</h1><p class="lead" style="margin-top:16px">{e(s['intro'])}</p>
  <div class="from num">{s['from_']}</div><p class="mini" style="margin-top:4px">{e(s['time'])}</p>
  <div class="hero-cta">{'<a class="btn btn-red" href="#raschet">Рассчитать на схеме</a>' if s['id']=='ppf' else '<a class="btn btn-red" href="#ceny">Смотреть цены</a>'}<button class="btn btn-ghost" data-open="book">Записаться</button></div>
 </div></section>
{f"""<section class="sec sec-alt" id="raschet"><div class="wrap">{sec_h('Расчёт онлайн','Схема покрытия плёнкой','Нажмите на детали прямо на фото или выберите пакет. Цена, срок и подарки считаются сразу.')}<div data-ppf></div></div></section>""" if s['id']=='ppf' else ''}
{f"""<section class="sec sec-alt" id="primerka"><div class="wrap"><div class="cols-2" style="align-items:start"><div>{sec_h('Онлайн','Примерьте тонировку','Выберите стёкла и плотность — так салон будет выглядеть изнутри. Для передних стёкол подскажем, что разрешено по ГОСТу.')}</div><div class="card" data-tint-inline></div></div></div></section>""" if s.get('tint') else ''}
<section class="sec"><div class="wrap">{sec_h('Преимущества','Что вы получаете')}<div class="cols">{ben}</div></div></section>
{f"""<section class="sec sec-alt"><div class="wrap">{sec_h('Зоны','Зоны шумоизоляции','Начать можно с дверей и арок — они дают больше всего шума.')}<div class="zones-g" data-zones data-zones-desc='{e(zones_desc)}'></div></div></section>""" if s.get('zones') else ''}
<section class="sec"><div class="wrap">{sec_h('Как работаем','Этапы работ')}<div class="steps">{steps}</div>{f'<div style="margin-top:22px">{s["extra"]}</div>' if s.get('extra') else ''}</div></section>
<section class="sec sec-alt"><div class="wrap">{sec_h('Фото','Работы по услуге','Нажмите на фото, чтобы листать.','<a class="btn btn-ghost btn-sm" href="'+r+'raboty.html">Все работы</a>')}<div class="pgrid" data-svc-photos="{s['id']}"></div>
 <div class="vgrid" data-videos="{s['id']}" style="margin-top:22px"></div></div></section>
<section class="sec" id="ceny"><div class="wrap">{sec_h('Цены','Стоимость','Нажмите «+», чтобы добавить услугу в запись. Цена может быть ниже прайса — уточняйте у мастера.','<a class="btn btn-ghost btn-sm" href="'+LINKS['price_pdf']+'" target="_blank" rel="noopener">Прайс-лист PDF</a>')}<div class="pcols" data-prices="{s['cats']}"></div></div></section>
<section class="sec sec-alt"><div class="wrap">{sec_h('Вопросы','Частые вопросы')}{faq_html(s['faq'])}</div></section>
<section class="sec"><div class="wrap">{sec_h('Блог','Почитать по теме','','<a class="btn btn-ghost btn-sm" href="'+r+'blog.html">Все статьи</a>')}<div class="bgrid" data-blog="4" data-blog-filter="{s['blog']}"></div>
 <div style="margin-top:32px"><span class="eyebrow">Другие услуги</span><div class="chips" style="margin-top:12px">{others}</div></div></div></section>
''' + lead_block(f'Записаться: {s["nav"].lower()}', slot='pg') + footer(d)
    ld = {"@context": "https://schema.org", "@type": "Service", "name": s['h1'], "provider": {"@type": "AutoRepair", "name": "SRV Detailing", "telephone": "+7 812 372-98-11", "address": ORG['address']}, "areaServed": "Санкт-Петербург", "description": s['desc']}
    fq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in s['faq']]}
    write(f'uslugi/{s["slug"]}.html', head(s['title'], s['desc'], d, f'uslugi/{s["slug"]}.html', og_img=f'media/svc/{s["id"]}/poster.webp', extra=jsonld(ld) + jsonld(fq)) + body)

def simple(path, title, desc, active, h1, lead, inner, crumbs=True, lead_form=True):
    d = 0
    body = header(d, active) + f'''<section class="sec" style="padding-bottom:20px"><div class="wrap">{'<nav class="crumbs"><a href="index.html">Главная</a>›<span>'+h1+'</span></nav>' if crumbs else ''}<h1>{h1}</h1>{f'<p class="lead" style="margin-top:14px">{lead}</p>' if lead else ''}</div></section>{inner}''' + (lead_block() if lead_form else '') + footer(d)
    write(path, head(title, desc, d, path) + body)

def pages():
    simple('raschet.html', 'Расчёт оклейки плёнкой онлайн — SRV Detailing', 'Онлайн-схема покрытия плёнкой PPF на фото автомобиля: пакеты Лайт, Оптима, Премиум, полная оклейка, цветная и матовая плёнка. Цена сразу.', 'raschet',
           'Расчёт оклейки плёнкой', 'Нажмите на детали прямо на фото или выберите пакет. Капот и крыша — по кругу: полоса → целиком. Цена, срок и подарки считаются сразу, расчёт можно отправить мастеру.',
           '<section class="sec" style="padding-top:10px"><div class="wrap"><div data-ppf></div></div></section>')
    simple('czeny.html', 'Цены на детейлинг и оклейку авто — SRV Detailing СПб', 'Актуальный прайс: оклейка плёнкой, керамика, полировка, тонировка, шумоизоляция, химчистка, удаление вмятин. Добавляйте услуги в запись онлайн.', 'czeny',
           'Цены на услуги детейлинга', 'Прайс на октябрь 2026. Цены «от» — для типового легкового автомобиля; итог зависит от сложности и может быть ниже. Нажмите «+», чтобы добавить услугу в запись.',
           f'''<section class="sec" style="padding-top:10px"><div class="wrap"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:22px"><label class="search"><svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="price-q" type="search" placeholder="Найти: фары, керамика, потолок…" autocomplete="off"></label>
            <div class="row"><a class="btn btn-ghost btn-sm" href="raschet.html">Схема плёнки</a><a class="btn btn-ghost btn-sm" href="{LINKS['price_pdf']}" target="_blank" rel="noopener">Прайс-лист PDF</a></div></div>
            <div class="chips" style="margin-bottom:22px">{''.join(f'<a class="chip" href="#p-{c}">{n}</a>' for c,n in [('ppf','Плёнка: детали'),('zones','Зоны риска'),('full','Полная оклейка'),('ceramic','Керамика'),('polish','Полировка'),('tint','Тонировка'),('dents','Вмятины'),('noise','Шумоизоляция'),('clean','Химчистка')])}</div>
            <div class="pcols" data-prices></div></div></section>''')
    simple('raboty.html', 'Наши работы и видео — SRV Detailing', 'Фото работ SRV Detailing: оклейка плёнкой RAM 1500, Porsche Taycan, G63 AMG, Maserati, BMW X3, Geely Coolray и другие. Видео из бокса.', 'raboty',
           'Работы и видео', 'Машины из нашего бокса на Симонова, 11: оклейка плёнкой, смена цвета, керамика, полировка, химчистка и шумоизоляция.',
           f'''<section class="sec" style="padding-top:10px"><div class="wrap"><div class="wgrid" data-works></div></div></section>
            <section class="sec sec-alt"><div class="wrap">{sec_h('Видео','Ролики из бокса')}<div class="vgrid" data-videos="all"></div></div></section>
            <section class="sec"><div class="wrap">{sec_h('Все фото','Фото по услугам')}<div data-gallery></div></div></section>''')
    simple('blog.html', 'Блог SRV Detailing — уход за автомобилем', 'Статьи про защиту кузова, плёнку, керамику, тонировку, химчистку и шумоизоляцию от мастеров SRV Detailing.', 'blog',
           'Полезное от SRV', 'Уход, защита, тонировка и шумоизоляция — простыми словами. Статьи открываются на srv-auto.ru.',
           '''<section class="sec" style="padding-top:10px"><div class="wrap"><div class="row" style="align-items:center;justify-content:space-between;margin-bottom:24px"><label class="search" data-blog-list><svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="blog-q" type="search" placeholder="Плёнка, керамика, зима…" autocomplete="off"></label><span class="mini" data-blog-count></span></div><div class="bgrid" data-blog-out></div></div></section>''', lead_form=False)
    simple('o-kompanii.html', 'О компании SRV Detailing — детейлинг-центр в СПб', 'SRV Detailing — детейлинг-центр в Выборгском районе Санкт-Петербурга. С 2001 года. Команда, подход, гарантии, реквизиты.', 'about',
           'О компании', 'Детейлинг-центр SRV на севере Петербурга — сертифицированная студия в Выборгском районе с честными ценами, вниманием к деталям и ответственным подходом.',
           f'''<section class="sec" style="padding-top:10px"><div class="wrap"><div class="card boss"><div class="ava">РС</div><div><q>Спокойствие и уверенность клиента — наш приоритет. Мы делаем всё, чтобы вы снова влюбились в свой автомобиль.</q><p class="muted" style="margin-top:10px">Роман Савочкин, руководитель SRV · <a class="link" href="{LINKS['tg']}" target="_blank" rel="noopener">Задать вопрос руководителю</a></p></div></div>
            <div class="cols" style="margin-top:16px"><div class="card"><h3>Полный спектр</h3><p>От химчистки салона до смены образа автомобиля — в одном месте.</p></div><div class="card"><h3>Индивидуальный подход</h3><p>Объясним, покажем, подскажем. Не навязываем лишнего — мы за доверие, а не за разовый чек.</p></div><div class="card"><h3>Прозрачные цены</h3><p>Без скрытых доплат. Стоимость фиксируем до начала работ.</p></div></div></div></section>
            <section class="sec sec-alt"><div class="wrap">{sec_h('Команда','Мастера SRV','Сертифицированные мастера, регулярное обучение, плёнки всех известных брендов. За машину берётся слаженная команда, а не один человек.')}<div class="team" data-team></div></div></section>
            <section class="sec"><div class="wrap">{sec_h('Студия','Боксы на Симонова, 11')}<div data-gallery data-cur="studio"></div></div></section>
            <section class="sec sec-alt"><div class="wrap">{sec_h('Реквизиты','ООО «СРВ-АВТО»')}<div class="tbl-wrap"><table class="tbl"><tbody>
             <tr><td>ИНН / КПП</td><td>7802868813 / 780201001</td></tr><tr><td>ОГРН</td><td>1147847292218</td></tr><tr><td>Адрес</td><td>194358, Санкт-Петербург, ул. Симонова, д. 11, лит. А, пом. 4-Н</td></tr><tr><td>Генеральный директор</td><td>Грега Василий Михайлович</td></tr><tr><td>Дата регистрации</td><td>21.08.2014</td></tr></tbody></table></div></div></section>''')
    simple('kontakty.html', 'Контакты SRV Detailing — ул. Симонова, 11, СПб', 'Адрес: Санкт-Петербург, ул. Симонова, 11. ПН–СБ 10:00–20:00, ВС по записи. Телефон +7 (812) 372-98-11, Telegram, WhatsApp, Max.', 'kontakty',
           'Контакты', 'Санкт-Петербург, ул. Симонова, 11 · Выборгский район. ПН–СБ 10:00–20:00 без записи, в воскресенье — по предварительной записи.',
           f'''<section class="sec" style="padding-top:10px"><div class="wrap"><div class="contact"><div class="card"><div class="addr">Санкт-Петербург, ул. Симонова, 11</div><p class="muted">Выборгский район · <span data-status></span></p><a class="phone-big" href="{PHONE_HREF}">{PHONE}</a><a class="link" href="mailto:zakaz@srv-auto.ru">zakaz@srv-auto.ru</a>
             <div class="row"><a class="chip-link" href="{LINKS['yandex']}" target="_blank" rel="noopener">Маршрут в Яндексе</a><a class="chip-link" href="{LINKS['gis']}" target="_blank" rel="noopener">2ГИС</a></div>
             <div class="row"><a class="chip-link" href="{LINKS['tg']}" target="_blank" rel="noopener">Telegram @srv_roman</a><a class="chip-link" href="{LINKS['wa']}" target="_blank" rel="noopener">WhatsApp</a><a class="chip-link" href="{LINKS['max']}" target="_blank" rel="noopener">Max</a></div>
             <a class="rate" href="{LINKS['reviews']}" target="_blank" rel="noopener"><img src="../media/brand/yandex-rating.png" alt="Хорошее место, 5,0"><span><b>Хорошее место на Яндекс Картах</b><span>Рейтинг 5,0 — читать отзывы</span></span></a></div>
             <div class="map"><iframe src="https://yandex.ru/map-widget/v1/?ll=30.327106%2C60.060339&z=16&pt=30.327106%2C60.060339%2Cpm2rdl" title="SRV на карте" loading="lazy" allowfullscreen></iframe></div></div></div></section>''', crumbs=True)

if __name__ == '__main__':
    home(); [service(s) for s in SERVICES]; pages()
    urls = ['', 'raschet.html', 'czeny.html', 'raboty.html', 'blog.html', 'o-kompanii.html', 'kontakty.html'] + [f'uslugi/{s["slug"]}.html' for s in SERVICES]
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{BASE}{u}</loc></url>' for u in urls) + '</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n')
    print('pages:', len(urls))
