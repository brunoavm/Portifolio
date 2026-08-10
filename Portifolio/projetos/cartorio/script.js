  // FAQ accordion
  document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = body.classList.contains('open');
      document.querySelectorAll('.faq-body').forEach(b => b.classList.remove('open'));
      document.querySelectorAll('.faq-btn').forEach(b => b.classList.remove('active'));
      if (!isOpen) { body.classList.add('open'); btn.classList.add('active'); }
    });
  });

  // Reveal on scroll
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 55);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Nav highlight
  const secs = document.querySelectorAll('section[id]');
  const nls = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let cur = '';
    secs.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
    nls.forEach(a => { a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--beige-light)' : ''; });
  });
