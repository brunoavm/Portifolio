// ====================================
// MOBILE NAV
// ====================================
const mobileMenu = document.getElementById('mobileMenu');
const navList = document.getElementById('navList');

if (mobileMenu && navList) {
  mobileMenu.addEventListener('click', () => {
    navList.classList.toggle('open');
    mobileMenu.classList.toggle('active');
  });

  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      mobileMenu.classList.remove('active');
    });
  });
}

// ====================================
// HEADER SCROLL
// ====================================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// ====================================
// SOBRE - EXPANDIR / RECOLHER
// ====================================
const btnSaibaMais = document.getElementById('btnSaibaMais');
const btnMostrarMenos = document.getElementById('btnMostrarMenos');
const sobreBody = document.getElementById('sobreBody');

if (btnSaibaMais && btnMostrarMenos && sobreBody) {
  btnSaibaMais.addEventListener('click', () => {
    sobreBody.classList.add('expanded');
    btnSaibaMais.style.display = 'none';
    btnMostrarMenos.style.display = 'inline-flex';
  });

  btnMostrarMenos.addEventListener('click', () => {
    sobreBody.classList.remove('expanded');
    btnSaibaMais.style.display = 'inline-flex';
    btnMostrarMenos.style.display = 'none';
  });
}

// ====================================
// SCROLL REVEAL
// ====================================
const revealElements = document.querySelectorAll('.area-card, .dep-card, .credencial, .contato-item');

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80 * (Array.from(revealElements).indexOf(entry.target) % 4));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => observer.observe(el));
