/* ============================================================
   TEMA.JS — Alternância de Tema (Dark / Light Mode)
   Compartilhado entre os subprojetos
   Portfolio Bruno Magalhães
   ============================================================ */

'use strict';

/**
 * iniciarTemaSubprojeto
 * Versão simplificada do alternar tema para as páginas de projetos.
 * Lê e salva no mesmo localStorage do portfolio principal,
 * garantindo consistência de tema entre todas as páginas.
 */
(function iniciarTemaSubprojeto() {
  const html         = document.documentElement;
  const botaoTema    = document.getElementById('botaoTema');
  const iconeTema    = document.getElementById('iconeTema');

  /* Lê a preferência: localStorage → sistema → padrão escuro */
  const temaSalvo         = localStorage.getItem('bm-tema');
  const prefereSistema    = window.matchMedia('(prefers-color-scheme: light)').matches;
  const temaInicial       = temaSalvo || (prefereSistema ? 'claro' : 'escuro');

  aplicarTema(temaInicial);

  function aplicarTema(tema) {
    /* Transição suave */
    html.classList.add('transicao-tema');
    setTimeout(() => html.classList.remove('transicao-tema'), 400);

    html.dataset.tema = tema;
    localStorage.setItem('bm-tema', tema);

    if (iconeTema) {
      iconeTema.className = tema === 'claro' ? 'ri-sun-line' : 'ri-moon-line';
    }
    if (botaoTema) {
      botaoTema.setAttribute('aria-label', tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro');
    }
  }

  if (botaoTema) {
    botaoTema.addEventListener('click', () => {
      aplicarTema(html.dataset.tema === 'claro' ? 'escuro' : 'claro');
    });
  }
})();
