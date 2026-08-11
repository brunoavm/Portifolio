/* ============================================================
   SCRIPT.JS — Scripts do Site do Cartório
   ============================================================

   ÍNDICE:
   1. Acordeão de Dúvidas (FAQ)
   2. Revelar Elementos ao Scroll
   3. Destaque Ativo na Navegação
   4. Menu Mobile
   5. Ano Atual no Rodapé
   6. Inicialização
   ============================================================ */

'use strict';

/* ============================================================
   1. ACORDEÃO DE DÚVIDAS (FAQ)
   Abre e fecha as respostas ao clicar nas perguntas.
   Só uma resposta fica aberta por vez.
   ============================================================ */

function iniciarAcordeaoDuvidas() {
  const botoesDuvidas = document.querySelectorAll('.duvida-botao');
  if (!botoesDuvidas.length) return;

  botoesDuvidas.forEach(botao => {
    botao.addEventListener('click', () => {
      const resposta   = botao.nextElementSibling;   /* .duvida-resposta */
      const estaAberto = resposta.classList.contains('aberto');

      /* Fecha todas as respostas abertas */
      document.querySelectorAll('.duvida-resposta').forEach(r => r.classList.remove('aberto'));
      document.querySelectorAll('.duvida-botao').forEach(b => {
        b.classList.remove('aberto');
        b.setAttribute('aria-expanded', 'false');
      });

      /* Se não estava aberto, abre o clicado */
      if (!estaAberto) {
        resposta.classList.add('aberto');
        botao.classList.add('aberto');
        botao.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ============================================================
   2. REVELAR ELEMENTOS AO SCROLL
   Usa IntersectionObserver para adicionar a classe 'visivel'
   nos elementos com a classe 'revelar' quando entram na tela.
   ============================================================ */

function iniciarRevelacaoAoScroll() {
  const elementosParaRevelar = document.querySelectorAll('.revelar');
  if (!elementosParaRevelar.length) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada, indice) => {
      if (!entrada.isIntersecting) return;

      /* Atraso escalonado para efeito em cascata (55ms por elemento) */
      setTimeout(() => {
        entrada.target.classList.add('visivel');
      }, indice * 55);

      /* Para de observar após revelar */
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.08 });

  elementosParaRevelar.forEach(el => observador.observe(el));
}

/* ============================================================
   3. DESTAQUE ATIVO NA NAVEGAÇÃO
   Marca o link da navbar correspondente à seção
   que está visível na tela enquanto o usuário rola.
   ============================================================ */

function iniciarDestaqueNavegacao() {
  const secoes      = document.querySelectorAll('section[id]');
  const linksNav    = document.querySelectorAll('.nav-lista-links a');

  if (!secoes.length || !linksNav.length) return;

  function atualizarLinkAtivo() {
    let secaoAtual = '';
    const alturaNav = 80; /* compensa a navbar fixa */

    secoes.forEach(secao => {
      if (window.scrollY >= secao.offsetTop - alturaNav) {
        secaoAtual = secao.getAttribute('id');
      }
    });

    linksNav.forEach(link => {
      const ehAtivo = link.getAttribute('href') === '#' + secaoAtual;
      link.style.color = ehAtivo ? 'var(--dourado-claro)' : '';
    });
  }

  window.addEventListener('scroll', atualizarLinkAtivo, { passive: true });
  atualizarLinkAtivo(); /* verifica na inicialização */
}

/* ============================================================
   4. MENU MOBILE
   Controla a abertura e fechamento do menu mobile
   ao clicar no botão hambúrguer.
   ============================================================ */

function iniciarMenuMobile() {
  const botaoHamburguer = document.getElementById('botaoHamburguer');
  const menuMobile      = document.getElementById('menuMobile');
  const overlay         = document.getElementById('menuMobileOverlay');

  if (!botaoHamburguer || !menuMobile) return;

  let menuAberto = false;

  function abrirMenu() {
    menuAberto = true;
    botaoHamburguer.classList.add('aberto');
    botaoHamburguer.setAttribute('aria-expanded', 'true');
    menuMobile.classList.add('aberto');
    menuMobile.setAttribute('aria-hidden', 'false');
    if (overlay) {
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }

  function fecharMenu() {
    menuAberto = false;
    botaoHamburguer.classList.remove('aberto');
    botaoHamburguer.setAttribute('aria-expanded', 'false');
    menuMobile.classList.remove('aberto');
    menuMobile.setAttribute('aria-hidden', 'true');
    if (overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /* Alterna ao clicar no hambúrguer */
  botaoHamburguer.addEventListener('click', () => {
    menuAberto ? fecharMenu() : abrirMenu();
  });

  /* Fecha ao clicar no overlay */
  if (overlay) {
    overlay.addEventListener('click', fecharMenu);
  }

  /* Fecha ao clicar em qualquer link do menu */
  menuMobile.querySelectorAll('.menu-mobile-link').forEach(link => {
    link.addEventListener('click', () => setTimeout(fecharMenu, 150));
  });

  /* Fecha ao pressionar ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuAberto) fecharMenu();
  });

  /* Fecha ao redimensionar para desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600 && menuAberto) fecharMenu();
  }, { passive: true });
}

/* ============================================================
   5. ANO ATUAL NO RODAPÉ
   Preenche o span com o ano corrente automaticamente.
   ============================================================ */

function preencherAnoAtual() {
  const spanAno = document.getElementById('anoAtual');
  if (spanAno) {
    spanAno.textContent = new Date().getFullYear();
  }
}

/* ============================================================
   6. INICIALIZAÇÃO
   Chama todas as funções quando o DOM estiver pronto.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  iniciarAcordeaoDuvidas();
  iniciarRevelacaoAoScroll();
  iniciarDestaqueNavegacao();
  iniciarMenuMobile();
  preencherAnoAtual();
});
