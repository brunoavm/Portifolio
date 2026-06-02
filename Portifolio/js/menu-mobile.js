/* ============================================================
   MENU-MOBILE.JS — Controle do Menu Mobile
   Portfolio Bruno Magalhães
   ============================================================

   ÍNDICE:
   1. Abrir / Fechar Menu Mobile
   2. Fechar ao clicar em link
   3. Fechar ao pressionar ESC
   4. Bloquear scroll do body quando menu está aberto
   ============================================================ */

'use strict';

/* ============================================================
   1. ABRIR / FECHAR MENU MOBILE
   ============================================================ */

/**
 * iniciarMenuMobile
 * Controla a abertura e fechamento do drawer de navegação mobile.
 * Gerencia foco, acessibilidade e animações do hambúrguer.
 */
function iniciarMenuMobile() {
  const botaoMenuMobile   = document.getElementById('botaoMenuMobile');
  const menuMobile        = document.getElementById('menuMobile');
  const menuMobileOverlay = document.getElementById('menuMobileOverlay');

  if (!botaoMenuMobile || !menuMobile) return;

  /* Estado do menu */
  let menuAberto = false;

  /* --- Abre o menu mobile --- */
  function abrirMenuMobile() {
    menuAberto = true;

    /* Anima o botão hambúrguer → X */
    botaoMenuMobile.classList.add('aberto');
    botaoMenuMobile.setAttribute('aria-expanded', 'true');
    botaoMenuMobile.setAttribute('aria-label', 'Fechar menu');

    /* Desliza o drawer */
    menuMobile.classList.add('aberto');
    menuMobile.setAttribute('aria-hidden', 'false');

    /* Exibe e anima o overlay */
    if (menuMobileOverlay) {
      menuMobileOverlay.style.display = 'block';
      /* Pequeno delay para ativar a transição de opacidade */
      requestAnimationFrame(() => {
        menuMobileOverlay.classList.add('visivel');
      });
    }

    /* Bloqueia o scroll do body */
    document.body.style.overflow = 'hidden';

    /* Move o foco para o primeiro link do menu (acessibilidade) */
    const primeiroLink = menuMobile.querySelector('.menu-mobile-link');
    if (primeiroLink) {
      setTimeout(() => primeiroLink.focus(), 300);
    }
  }

  /* --- Fecha o menu mobile --- */
  function fecharMenuMobile() {
    menuAberto = false;

    /* Reverte animação do hambúrguer */
    botaoMenuMobile.classList.remove('aberto');
    botaoMenuMobile.setAttribute('aria-expanded', 'false');
    botaoMenuMobile.setAttribute('aria-label', 'Abrir menu');

    /* Fecha o drawer */
    menuMobile.classList.remove('aberto');
    menuMobile.setAttribute('aria-hidden', 'true');

    /* Oculta o overlay */
    if (menuMobileOverlay) {
      menuMobileOverlay.classList.remove('visivel');
      /* Remove o display após a transição */
      menuMobileOverlay.addEventListener('transitionend', () => {
        menuMobileOverlay.style.display = 'none';
      }, { once: true });
    }

    /* Restaura o scroll do body */
    document.body.style.overflow = '';

    /* Devolve o foco para o botão hambúrguer */
    botaoMenuMobile.focus();
  }

  /* --- Alterna entre aberto/fechado --- */
  function alternarMenuMobile() {
    if (menuAberto) {
      fecharMenuMobile();
    } else {
      abrirMenuMobile();
    }
  }

  /* Listener do botão hambúrguer */
  botaoMenuMobile.addEventListener('click', alternarMenuMobile);

  /* ============================================================
     2. FECHAR AO CLICAR EM LINK
     ============================================================ */

  /**
   * Fecha o menu mobile quando qualquer link de navegação é clicado.
   * Necessário pois os links são âncoras (navegação na mesma página).
   */
  const linksMobile = menuMobile.querySelectorAll('.menu-mobile-link');
  linksMobile.forEach(link => {
    link.addEventListener('click', () => {
      /* Pequeno delay para o scroll ter tempo de iniciar */
      setTimeout(fecharMenuMobile, 150);
    });
  });

  /* ============================================================
     3. FECHAR AO CLICAR NO OVERLAY / PRESSIONAR ESC
     ============================================================ */

  /* Fecha ao clicar no overlay escuro */
  if (menuMobileOverlay) {
    menuMobileOverlay.addEventListener('click', fecharMenuMobile);
  }

  /* Fecha ao pressionar a tecla ESC */
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menuAberto) {
      fecharMenuMobile();
    }
  });

  /* ============================================================
     4. FECHAR AO REDIMENSIONAR PARA DESKTOP
     ============================================================ */

  /**
   * Se o usuário redimensionar a janela para desktop enquanto
   * o menu mobile estiver aberto, fecha e limpa o estado.
   */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && menuAberto) {
      fecharMenuMobile();
    }
  }, { passive: true });
}

/* Inicializa quando o DOM estiver pronto */
document.addEventListener('DOMContentLoaded', iniciarMenuMobile);
