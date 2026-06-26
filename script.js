/* =========================================================
   MINKA BARBER STUDIO — script.js
   1. Navbar scroll
   2. Menú hamburguesa
   3. Animaciones de entrada (IntersectionObserver)
   4. Formulario de reserva → WhatsApp + Modal recordatorio
   5. Validación de formulario
   6. Carrusel de testimonios (responsive + touch)
   7. Modal recordatorio → Google Calendar
   8. Smooth scroll
   ========================================================= */

// ── 1. NAVBAR ────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// ── 2. HAMBURGUESA ───────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});


// ── 3. ANIMACIONES DE ENTRADA ────────────────────────────
const animateEls = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const parent = entry.target.parentElement;
    const staggerParents = '.services-grid,.contact-grid,.gallery-grid,.barbers-grid,.promos-grid';
    const delay = entry.target.closest(staggerParents)
      ? Array.from(parent.children).indexOf(entry.target) * 90
      : 0;
    setTimeout(() => entry.target.classList.add('visible'), delay);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
animateEls.forEach(el => observer.observe(el));


// ── 4 & 5. FORMULARIO → WHATSAPP ─────────────────────────
const form          = document.getElementById('booking-form');
const PHONE         = '51901259859';
const fieldNombre   = document.getElementById('nombre');
const fieldServicio = document.getElementById('servicio');
const fieldFecha    = document.getElementById('fecha');
const fieldHora     = document.getElementById('hora');
const errNombre     = document.getElementById('error-nombre');
const errServicio   = document.getElementById('error-servicio');
const errFecha      = document.getElementById('error-fecha');
const errHora       = document.getElementById('error-hora');

function validateField(field, errorEl, msg) {
  if (!field.value.trim()) {
    errorEl.textContent = msg;
    field.classList.add('invalid');
    return false;
  }
  errorEl.textContent = '';
  field.classList.remove('invalid');
  return true;
}
function validateFecha(field, errorEl) {
  if (!field.value) {
    errorEl.textContent = 'Por favor selecciona una fecha.';
    field.classList.add('invalid');
    return false;
  }
  const sel = new Date(field.value + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (sel < hoy) {
    errorEl.textContent = 'La fecha no puede ser en el pasado.';
    field.classList.add('invalid');
    return false;
  }
  errorEl.textContent = '';
  field.classList.remove('invalid');
  return true;
}
function validateHora(field, errorEl) {
  if (!field.value) {
    errorEl.textContent = 'Por favor selecciona una hora.';
    field.classList.add('invalid');
    return false;
  }
  const [h] = field.value.split(':').map(Number);
  if (h < 9 || h >= 20) {
    errorEl.textContent = 'Horario disponible: 9am – 8pm.';
    field.classList.add('invalid');
    return false;
  }
  errorEl.textContent = '';
  field.classList.remove('invalid');
  return true;
}
function formatDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}
function formatTime(str) {
  const [h, m] = str.split(':').map(Number);
  const sfx = h >= 12 ? 'pm' : 'am';
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${sfx}`;
}

[fieldNombre, fieldServicio, fieldFecha, fieldHora].forEach(f => {
  f.addEventListener('input', () => {
    f.classList.remove('invalid');
    const el = document.getElementById('error-' + f.id);
    if (el) el.textContent = '';
  });
});

// Variables para el modal (fecha y hora de la reserva)
let reservaFecha = '';
let reservaHora  = '';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const v1 = validateField(fieldNombre,   errNombre,   'Por favor ingresa tu nombre.');
  const v2 = validateField(fieldServicio, errServicio, 'Por favor selecciona un servicio.');
  const v3 = validateFecha(fieldFecha, errFecha);
  const v4 = validateHora(fieldHora, errHora);
  if (!v1 || !v2 || !v3 || !v4) return;

  reservaFecha = fieldFecha.value;
  reservaHora  = fieldHora.value;

  const nombre   = fieldNombre.value.trim();
  const servicio = fieldServicio.value;
  const fecha    = formatDate(reservaFecha);
  const hora     = formatTime(reservaHora);

  const mensaje =
    `¡Hola! Quiero reservar una cita en *Minka Barber Studio*:\n\n` +
    `*Nombre:* ${nombre}\n` +
    `*Servicio:* ${servicio}\n` +
    `*Fecha:* ${fecha}\n` +
    `*Hora:* ${hora}\n\n` +
    `Por favor confirmar disponibilidad. ¡Gracias!`;

  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(mensaje)}`, '_blank');

  // Mostrar modal de recordatorio 800ms después
  setTimeout(() => openReminderModal(), 800);
});

// Fecha mínima = hoy
(function setMinDate() {
  const hoy  = new Date();
  const yyyy = hoy.getFullYear();
  const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd   = String(hoy.getDate()).padStart(2, '0');
  fieldFecha.min = `${yyyy}-${mm}-${dd}`;
})();


// ── 6. CARRUSEL DE TESTIMONIOS ───────────────────────────
(function initCarousel() {
  const track    = document.getElementById('testimonials-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const btnPrev  = document.getElementById('carousel-prev');
  const btnNext  = document.getElementById('carousel-next');
  if (!track) return;

  const cards = Array.from(track.children);
  const total  = cards.length;
  let currentPage = 0;
  let autoTimer   = null;
  const GAP = 24; // px — debe coincidir con el gap del CSS

  /* ── Cuántas cards se ven según viewport ── */
  function visibleCount() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  /* ── Total de páginas ── */
  function totalPages() {
    return Math.ceil(total / visibleCount());
  }

  /* ── Aplica el desplazamiento correcto ──
     En lugar de usar getBoundingClientRect() (que puede fallar si
     el carrusel no está visible), calculamos el ancho directamente
     desde el contenedor y la cantidad de columnas visibles.        */
  function applyTransform(page) {
    const vis      = visibleCount();
    const safeP    = Math.max(0, Math.min(page, totalPages() - 1));
    currentPage    = safeP;

    // Ancho disponible del contenedor (sin padding)
    const containerW = track.parentElement.offsetWidth;
    // Ancho de cada card: espacio total ÷ columnas visibles, menos gaps
    const cardW = (containerW - GAP * (vis - 1)) / vis;

    // Índice de la primera card en esta página
    const firstCard = safeP * vis;
    const offset    = firstCard * (cardW + GAP);

    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  /* ── Ajusta el ancho de cada card dinámicamente ──
     Esto garantiza que las cards llenen exactamente el contenedor
     en cualquier resolución, sin depender de CSS fijo.            */
  function resizeCards() {
    const vis        = visibleCount();
    const containerW = track.parentElement.offsetWidth;
    const cardW      = (containerW - GAP * (vis - 1)) / vis;
    cards.forEach(c => {
      c.style.minWidth = `${cardW}px`;
      c.style.width    = `${cardW}px`;
    });
  }

  /* ── Dots de navegación ── */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = totalPages();
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
      dot.setAttribute('aria-label', `Página ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    }
  }
  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentPage);
    });
  }

  /* ── Navegación ── */
  function goTo(page) {
    applyTransform(page);
  }
  function next() {
    goTo(currentPage >= totalPages() - 1 ? 0 : currentPage + 1);
  }
  function prev() {
    goTo(currentPage <= 0 ? totalPages() - 1 : currentPage - 1);
  }

  /* ── Auto-play ── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 4500);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }
  function resetAuto() {
    startAuto();
  }

  /* ── Eventos ── */
  btnNext.addEventListener('click', () => { next(); resetAuto(); });
  btnPrev.addEventListener('click', () => { prev(); resetAuto(); });

  // Pausa hover (desktop)
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Swipe táctil (móvil / tablet)
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping   = false;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping   = false;
    stopAuto();
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    // Detectar si el movimiento es más horizontal que vertical
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 10) isSwiping = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (isSwiping) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
      }
    }
    startAuto();
  }, { passive: true });

  /* ── Resize: recalcular cards y reposicionar ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCards();
      buildDots();
      // Si la página actual ya no existe (ej: de mobile a desktop)
      const maxP = totalPages() - 1;
      goTo(Math.min(currentPage, maxP));
    }, 150);
  });

  /* ── Init ── */
  resizeCards();
  buildDots();
  goTo(0);
  startAuto();
})();


// ── 7. MODAL RECORDATORIO → GOOGLE CALENDAR ──────────────
const modalOverlay = document.getElementById('reminder-modal');
const modalClose   = document.getElementById('modal-close');
const btnCalendar  = document.getElementById('btn-calendar');

function openReminderModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeReminderModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeReminderModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeReminderModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeReminderModal();
});

btnCalendar.addEventListener('click', () => {
  if (!reservaFecha || !reservaHora) return;

  const [ay, am, ad] = reservaFecha.split('-').map(Number);
  const [hh, hm]     = reservaHora.split(':').map(Number);

  // Fecha del recordatorio = fecha reserva + 21 días
  const startDate = new Date(ay, am - 1, ad + 21, hh, hm, 0);
  const endDate   = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora

  // Formato Google Calendar: YYYYMMDDTHHMMSS (local, sin Z)
  function toGCal(d) {
    return d.getFullYear()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0')
      + 'T'
      + String(d.getHours()).padStart(2, '0')
      + String(d.getMinutes()).padStart(2, '0')
      + '00';
  }

  const gcParams = new URLSearchParams({
    action:   'TEMPLATE',
    text:     'Volver a Minka Barber Studio',
    dates:    `${toGCal(startDate)}/${toGCal(endDate)}`,
    details:  'Recordatorio para realizar un nuevo corte en Minka Barber Studio.',
    location: 'Minka Barber Studio, Trujillo, Perú'
  });

  window.open(`https://calendar.google.com/calendar/render?${gcParams.toString()}`, '_blank');
  closeReminderModal();
});


// ── 8. SMOOTH SCROLL ─────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
