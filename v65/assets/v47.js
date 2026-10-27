/* ====================================================================
   V47 — поведение, добавленное 26.10.2026 по правкам Ольги.
   1. Тарифы на телефоне листаются вправо-влево, по центру — «Профи».
      Точки под слайдером показывают, какая карточка открыта.
   2. Липкая кнопка внизу появляется только после прокрутки первого экрана,
      чтобы не закрывать статуэтку и не мешать читать.
   Исходные скрипты V44 и V45 не тронуты.
   ==================================================================== */
(() => {
  'use strict';

  // «телефон» = узкий экран ИЛИ сенсорный экран (у iPhone и в браузере
  // Телеграма ширина окна иногда приходит не той, что ждёшь, и без этого
  // скрипт и стили начинали работать по-разному)
  const телефон = () => window.matchMedia(
    '(max-width: 760px), ((pointer: coarse) and (max-width: 1100px))').matches;

  /* ---------------- режим диагностики (?debug=1) ----------------
     Включается только по ссылке вида https://sandowfitness.ru/baza?debug=1
     Показывает чёрную плашку с размерами экрана — по ней видно, что именно
     происходит на конкретном телефоне. На обычной странице не появляется. */
  if (/[?&]debug=1/.test(location.search)) {
    const плашка = document.createElement('div');
    плашка.id = 'v47-debug';
    плашка.style.cssText = 'position:fixed;left:6px;right:6px;top:6px;z-index:99999;' +
      'background:rgba(0,0,0,.86);color:#7df9ff;font:11px/1.4 ui-monospace,monospace;' +
      'padding:10px 12px;border-radius:10px;white-space:pre-wrap;pointer-events:none';
    document.body.appendChild(плашка);
    const обновить = () => {
      const vv = window.visualViewport;
      const ш = document.getElementById('heroSculpture');
      const б = (э) => {
        if (!э) return '—';
        const r = э.getBoundingClientRect();
        return `${Math.round(r.x)},${Math.round(r.y)} — ${Math.round(r.width)}x${Math.round(r.height)}`;
      };
      const мир = document.querySelector('.v44-world');
      const пер = мир ? getComputedStyle(мир) : null;
      плашка.textContent = [
        'ДИАГНОСТИКА «БАЗА САНДОВ»',
        `окно: ${innerWidth}x${innerHeight} · dpr ${(devicePixelRatio || 1).toFixed(1)}`,
        vv ? `видимая часть: ${Math.round(vv.width)}x${Math.round(vv.height)} · сдвиг ${Math.round(vv.offsetTop)} · масштаб ${(vv.scale || 1).toFixed(2)}`
           : 'видимая часть: браузер не сообщает',
        `экран устройства: ${screen.width}x${screen.height}`,
        `прокрутка: ${Math.round(scrollY)}`,
        `шапка (лого/надпись): ${б(document.querySelector('.header'))}`,
        `статуэтка: ${б(ш)}`,
        `3D: ${ш ? (ш.dataset.webgl || 'нет') : 'нет'} · режим движения: ${window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'уменьшен' : 'обычный'}`,
        пер ? `переменные: верх ${пер.getPropertyValue('--v47-statue-top').trim()} · высота ${пер.getPropertyValue('--v47-statue-h').trim()}` : '',
        `кодировка: ${document.characterSet}`,
        `заголовок на странице: «${(document.querySelector('.hero h1') || {}).innerText || '—'}»`,
        `ширина окна ${innerWidth} · телефон? ${телефон() ? 'да' : 'нет'}`,
        `браузер: ${(navigator.userAgent || '').slice(0, 70)}`,
      ].filter(Boolean).join('\n');
    };
    обновить();
    window.addEventListener('scroll', обновить, { passive: true });
    window.addEventListener('resize', обновить);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', обновить);
      window.visualViewport.addEventListener('scroll', обновить);
    }
    setTimeout(обновить, 1200);
    setTimeout(обновить, 2500);
  }

  /* ---------------- тарифы: слайдер + точки ---------------- */
  const лента = document.querySelector('.tiers');
  const карточки = лента ? [...лента.querySelectorAll('.tier-card[data-tier]')] : [];

  if (лента && карточки.length) {
    // точки и подсказка — как на странице Богородицка
    const точки = document.createElement('div');
    точки.className = 'v47-tiers-dots';
    точки.setAttribute('aria-hidden', 'true');
    карточки.forEach(() => точки.appendChild(document.createElement('i')));
    const подсказка = document.createElement('span');
    подсказка.className = 'v47-tiers-hint';
    подсказка.textContent = 'Листайте тарифы →';
    const якорь = лента.parentElement;
    if (якорь) {
      якорь.appendChild(точки);
      якорь.appendChild(подсказка);
    }

    const метки = [...точки.children];
    const поЦентру = () => {
      const середина = лента.scrollLeft + лента.clientWidth / 2;
      let лучшая = 0;
      let лучшаяДельта = Infinity;
      карточки.forEach((к, i) => {
        const ц = к.offsetLeft + к.offsetWidth / 2;
        const д = Math.abs(ц - середина);
        if (д < лучшаяДельта) { лучшаяДельта = д; лучшая = i; }
      });
      return лучшая;
    };
    const обновить = () => {
      const индекс = поЦентру();
      метки.forEach((м, i) => м.classList.toggle('on', i === индекс));
    };

    // сначала показываем «Профи» по центру
    const профи = карточки.findIndex(к => к.dataset.tier === 'pro');
    const поставитьПрофи = () => {
      if (!телефон() || профи < 0) return;
      const к = карточки[профи];
      const сдвиг = к.offsetLeft - (лента.clientWidth - к.offsetWidth) / 2;
      лента.scrollTo({left: Math.max(0, сдвиг), behavior: 'auto'});
      обновить();
    };
    setTimeout(поставитьПрофи, 60);
    setTimeout(поставитьПрофи, 600);
    window.addEventListener('load', () => setTimeout(поставитьПрофи, 120));
    window.addEventListener('resize', () => { setTimeout(обновить, 120); }, { passive: true });

    let таймер = 0;
    лента.addEventListener('scroll', () => {
      clearTimeout(таймер);
      таймер = setTimeout(обновить, 70);
    }, { passive: true });
    обновить();

    // свайп не должен раскрывать тариф: отличаем листание от нажатия
    let стартX = 0;
    let стартY = 0;
    let листали = false;
    лента.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      стартX = t.clientX;
      стартY = t.clientY;
      листали = false;
    }, { passive: true });
    лента.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (Math.abs(t.clientX - стартX) > 12 && Math.abs(t.clientX - стартX) > Math.abs(t.clientY - стартY)) {
        листали = true;
      }
    }, { passive: true });
    лента.addEventListener('click', (e) => {
      if (листали) { e.stopPropagation(); e.preventDefault(); листали = false; }
    }, { capture: true });
  }

  /* ---------------- размер статуэтки: во всю свободную высоту ----------------
     Ольга 26.10.2026: «фигурка — символ сайта, верни размер как было».
     Поэтому размер не фиксированный: берём всё место от нижней границы кнопок
     до края экрана, минус отступ. Так на каждом телефоне фигура максимально
     крупная и при этом не заходит под кнопку. */
  const мир = document.querySelector('.v44-world');
  const кнопки = document.querySelector('.hero-actions');
  const фигура = document.getElementById('heroSculpture');

  // «Видимая» высота: у iPhone и у браузера внутри Телеграма она меньше
  // высоты окна, именно из-за этого фигуру срезала нижняя панель.
  const видимаяВысота = () => {
    const vv = window.visualViewport;
    const изОкна = window.innerHeight || document.documentElement.clientHeight;
    return Math.round(vv && vv.height ? Math.min(vv.height, изОкна) : изОкна);
  };

  const подогнать = () => {
    if (!мир || !кнопки || !телефон()) return;
    const высотаЭкрана = видимаяВысота();
    const отступ = 12;
    const верх = Math.round(кнопки.getBoundingClientRect().bottom + 14);
    const свободно = высотаЭкрана - верх - отступ;
    // размер = всё свободное место; навязывать «пол» нельзя — тогда фигура
    // уезжает за нижний край экрана, и получается та самая «срезанная» фигура
    const высота = Math.round(Math.max(140, Math.min(470, свободно)));
    мир.style.setProperty('--v47-statue-h', высота + 'px');
    мир.dataset.верх = String(верх);
    мир.dataset.высота = String(высота);
    прокрутка();
  };

  /* ---------------- вторая площадка для фигуры: самый низ страницы ----------------
     Ольга 26.10.2026: «можно в самом низу фигурку поставить? там же пустое
     место!» Фигура одна (одно полотно 3D), но у неё теперь две площадки:
     под кнопкой на первом экране и в свободном месте внизу страницы.
     Когда нижняя площадка на экране — фигура стоит в ней, иначе возвращается
     на первый экран. */
  let площадка = null;
  if (телефон()) {
    const финал = document.querySelector('.finale');
    if (финал) {
      // площадка — то самое пустое место в финальном блоке: между кнопкой
      // «Стать резидентом» и концом блока
      if (getComputedStyle(финал).position === 'static') финал.style.position = 'relative';
      площадка = document.createElement('div');
      площадка.className = 'v47-statue-slot';
      площадка.setAttribute('aria-hidden', 'true');
      финал.appendChild(площадка);
    }
  }

  // Фигура едет вместе со страницей. Двигаем её через top, а не через
  // transform: на iPhone Safari составной слой с полотном 3D иногда
  // пропадает целиком — из-за этого фигурка «исчезала».
  let кадр = 0;
  let местоФигуры = '';
  const прокрутка = () => {
    кадр = 0;
    if (!мир) return;
    const база = Number(мир.dataset.верх || 0);
    const сдвиг = Math.max(0, window.scrollY | 0);
    const шЭкрана = Math.round(window.innerWidth || document.documentElement.clientWidth);
    const высотаГероя = Number(мир.dataset.высота || 0);
    let верх = база - сдвиг;
    let место = 'герой';
    if (площадка) {
      const финал = площадка.parentElement;
      const кнопкаФинала = финал ? (финал.querySelector('.finale-bottom') || финал.querySelector('.button')) : null;
      // сколько реально свободно между кнопкой финала и концом блока —
      // ровно в это место и встаёт фигура
      // высота нижней площадки: фигура стоит в самом низу блока, место под неё
      // задаётся от высоты экрана (блок теперь по содержимому, без пустоты)
      const нужная = Math.round(Math.max(200, Math.min(380, видимаяВысота() * 0.42)));
      if (Math.abs(нужная - Number(мир.dataset.высотаНиз || 0)) > 2) {
        мир.dataset.высотаНиз = String(нужная);
        площадка.style.setProperty('--v47-slot-h', нужная + 'px');
        if (местоФигуры === 'низ') местоФигуры = '';   // пересчитать размеры
      }
      const r = площадка.getBoundingClientRect();
      const экран = видимаяВысота();
      // нижняя площадка видна — фигура переезжает в неё
      if (r.bottom > 80 && r.top < экран) {
        const высотаНиз = Number(мир.dataset.высотаНиз || 240);
        const ширинаНиз = Math.round(Math.min(шЭкрана - 24, высотаНиз * 1.05));
        верх = Math.round(r.top + Math.max(0, (r.height - высотаНиз) / 2));
        место = 'низ';
        // Ольга 26.10.2026: «нижняя фигурка наполовину перекрыта блоком
        // „БАЗА САНДОВ 2026 МОСКВА"». Подвал сайта рисуется поверх слоя с
        // фигурой, поэтому фигуру держим строго выше подвала, а если места
        // между кнопкой и подвалом не осталось — прячем её совсем.
        const подвал = document.querySelector('footer');
        const кт = кнопкаФинала ? кнопкаФинала.getBoundingClientRect().bottom : 0;
        const нч = подвал ? подвал.getBoundingClientRect().top : Infinity;
        const самый_низ = Math.min(нч - 10, экран - 10);
        if (верх + высотаНиз > самый_низ) верх = Math.round(самый_низ - высотаНиз);
        const мало_места = верх < кт + 8;
        мир.classList.toggle('v47-statue-hidden', мало_места);
        if (местоФигуры !== место) {
          мир.style.setProperty('--v47-statue-h', высотаНиз + 'px');
          мир.style.setProperty('--v47-statue-w', ширинаНиз + 'px');
          мир.style.setProperty('--v47-statue-left', Math.round((шЭкрана - ширинаНиз) / 2) + 'px');
          мир.style.setProperty('--v47-statue-right', 'auto');
          // Ольга 27.10.2026: «Евгений Сандов как был закрыт наполовину так и
          // остался». Проверка точками показала: над фигурой в этом месте
          // оказывается блок финала — она рисуется ПОД содержимым страницы.
          // Поэтому на время нижней площадки переносим саму фигуру внутрь
          // блока: там она обычный элемент страницы, и перекрыть её нечем.
          if (фигура && площадка && фигура.parentElement !== площадка) {
            площадка.appendChild(фигура);
            фигура.classList.add('v47-in-slot');
          }
        }
      }
    }
    if (место === 'герой' && местоФигуры !== 'герой') {
      мир.style.setProperty('--v47-statue-h', высотаГероя + 'px');
      мир.style.setProperty('--v47-statue-w', Math.round(Math.min(шЭкрана, высотаГероя * 1.12)) + 'px');
      мир.style.setProperty('--v47-statue-left', 'auto');
      мир.style.setProperty('--v47-statue-right', '0');
      // возвращаем фигуру на её обычное место в слое
      if (фигура && фигура.parentElement !== мир) {
        фигура.classList.remove('v47-in-slot');
        мир.insertBefore(фигура, мир.firstChild);
      }
    }
    местоФигуры = место;
    мир.style.setProperty('--v47-statue-top', верх + 'px');
    // Ольга 27.10.2026: «в самом конце страницы видна кодировка вверху» —
    // это декоративные слои мира (мелкие подписи «ЗАЛ / 01», фотографии, линии)
    // оказывались поверх финального блока и подвала. Когда фигура стоит в
    // нижней площадке, весь слой мира скрываем: в нём больше ничего нужного нет.
    document.documentElement.classList.toggle('v47-at-finale', место === 'низ');
    сообщить();
  };

  /* ---------------- связь с рамкой в Тильде ----------------
     Сообщаем наружу высоту содержимого и прокрутку: по ним страница в Тильде
     делает вид, что прокручивается сама, и адресная строка телефона
     убирается при скролле, как на обычных сайтах. */
  const вРамке = (() => { try { return window.parent && window.parent !== window; } catch (e) { return false; } })();
  let последняя = { высота: -1, прокрутка: -1 };
  const сообщить = () => {
    if (!вРамке) return;
    const высота = Math.round(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    const теперь = Math.round(window.scrollY | 0);
    if (высота === последняя.высота && теперь === последняя.прокрутка) return;
    последняя = { высота, прокрутка: теперь };
    try {
      window.parent.postMessage({ базаСандов: 1, высотаСодержимого: высота, прокрутка: теперь }, '*');
    } catch (e) { /* ничего */ }
  };

  if (мир && кнопки) {
    подогнать();
    window.addEventListener('load', подогнать);
    window.addEventListener('resize', подогнать, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(подогнать, 300));
    window.addEventListener('scroll', () => {
      if (!кадр) кадр = requestAnimationFrame(прокрутка);
    }, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', подогнать);
      window.visualViewport.addEventListener('scroll', подогнать);
    }
    // шрифты догружаются позже — высота кнопок может измениться
    setTimeout(подогнать, 400);
    setTimeout(подогнать, 1200);
    setTimeout(сообщить, 2000);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(подогнать);
  }

  /* ---------------- липкая кнопка после первого экрана ----------------
     Ольга 26.10.2026: «внизу кнопка одна закрыта другой». В финальном блоке
     есть своя большая кнопка, поэтому липкую панель там убираем — иначе они
     наезжают друг на друга. */
  const липкая = document.querySelector('.mobile-action');
  const финал = document.querySelector('.finale');
  if (липкая) {
    let ждёт = false;
    const решить = () => {
      ждёт = false;
      const экран = видимаяВысота();
      const порог = Math.max(240, экран * 0.75);
      let показать = window.scrollY > порог;
      if (показать && финал) {
        const r = финал.getBoundingClientRect();
        // финальный блок уже на экране — не мешаем его кнопке
        if (r.top < экран * 0.72) показать = false;
      }
      липкая.classList.toggle('v47-shown', показать);
    };
    window.addEventListener('scroll', () => {
      if (!ждёт) { ждёт = true; requestAnimationFrame(решить); }
    }, { passive: true });
    решить();
  }

  /* ---------------- страховка от неработающих «липких» сцен ----------------
     Ольга 27.10.2026: на её телефоне после блока «Клиенты — твои» было пусто
     до самых тарифов. Причина — на iPhone липкие сцены середины ломаются,
     если тело страницы прокручиваемое (в стилях сайта стоит overflow-x:hidden;
     правится в блоке через clip). Эта проверка ловит случай, когда починить не
     удалось: сцена ушла вверх, а секция ещё не кончилась — значит держать её
     нечем, и главы показываем обычным потоком, чтобы пустоты не было. */
  const сценаСекция = document.querySelector('.v44-journey');
  const сценаЛипкая = document.querySelector('.v44-journey-sticky');
  if (сценаСекция && сценаЛипкая) {
    let проверено = false;
    const проверитьЛипкость = () => {
      if (проверено) return;
      const липкаяРамка = сценаЛипкая.getBoundingClientRect();
      const секцияРамка = сценаСекция.getBoundingClientRect();
      if (липкаяРамка.bottom < 2 && секцияРамка.bottom > видимаяВысота() * 0.5) {
        проверено = true;
        document.documentElement.classList.add('v47-no-sticky');
      }
    };
    window.addEventListener('scroll', проверитьЛипкость, { passive: true });
    setTimeout(проверитьЛипкость, 1500);
  }
})();
