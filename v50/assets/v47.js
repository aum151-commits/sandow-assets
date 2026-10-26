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

  const телефон = () => window.matchMedia('(max-width: 760px)').matches;

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
  const подогнать = () => {
    if (!мир || !кнопки || !телефон()) return;
    const отступ = 4;
    const верх = кнопки.getBoundingClientRect().bottom + 16;
    // нижний предел: фигура — символ сайта, меньше определённой доли экрана
    // она не должна становиться даже на самом низком экране
    const минимальная = Math.min(260, Math.round(window.innerHeight * 0.38));
    const высота = Math.round(Math.min(470, Math.max(минимальная, window.innerHeight - верх - отступ)));
    мир.style.setProperty('--v47-statue-h', высота + 'px');
  };
  if (мир && кнопки) {
    подогнать();
    window.addEventListener('load', подогнать);
    window.addEventListener('resize', подогнать, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(подогнать, 250));
    // шрифты догружаются позже — высота кнопок может измениться
    setTimeout(подогнать, 400);
    setTimeout(подогнать, 1200);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(подогнать);
  }

  /* ---------------- липкая кнопка после первого экрана ---------------- */
  const липкая = document.querySelector('.mobile-action');
  if (липкая) {
    let ждёт = false;
    const решить = () => {
      ждёт = false;
      const порог = Math.max(240, window.innerHeight * 0.55);
      const показать = window.scrollY > порог;
      липкая.classList.toggle('v47-shown', показать);
      // статуэтка отодвигается вверх, чтобы кнопка её не закрывала
      if (мир) мир.classList.toggle('v47-cta-shown', показать);
    };
    window.addEventListener('scroll', () => {
      if (!ждёт) { ждёт = true; requestAnimationFrame(решить); }
    }, { passive: true });
    решить();
  }
})();
