/* ============================================================
   SCRIPT.JS — Scripts do Site do Cartório (molde genérico)
   ============================================================

   ÍNDICE:
   1. Utilidades
   2. Abas de Serviços (por especialidade)
   3. Acordeão de Dúvidas (FAQ)
   4. Revelar Elementos ao Scroll
   5. Destaque Ativo na Navegação
   6. Menu Mobile
   7. Estado de Rolagem (navbar + botão "topo")
   8. Ano Atual no Rodapé
   9. Inicialização
   ============================================================ */

'use strict';

/* ============================================================
   1. UTILIDADES
   ============================================================ */

/* true se o usuário pediu "reduzir movimento" no sistema */
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Largura a partir da qual o menu desktop aparece (igual ao CSS) */
const LARGURA_DESKTOP = 1100;

/* ============================================================
   2. ABAS DE SERVIÇOS
   Troca o painel visível ao clicar numa especialidade.
   Também funciona pelo teclado (setas, Home e End) e pelos
   selos do topo (atributo data-aba-alvo="notas", etc.).
   ============================================================ */

function iniciarAbasServicos() {
  const lista = document.querySelector('.abas-lista');
  if (!lista) return;

  const abas = Array.from(lista.querySelectorAll('[role="tab"]'));
  if (!abas.length) return;

  function ativarAba(aba, focar) {
    abas.forEach(a => {
      const ativa  = a === aba;
      const painel = document.getElementById(a.getAttribute('aria-controls'));
      a.classList.toggle('ativa', ativa);
      a.setAttribute('aria-selected', ativa ? 'true' : 'false');
      a.tabIndex = ativa ? 0 : -1;
      if (painel) painel.hidden = !ativa;
    });

    if (focar) aba.focus({ preventScroll: true });

    /* No celular, centraliza a aba escolhida na faixa rolável */
    if (lista.scrollWidth > lista.clientWidth) {
      const alvo = aba.offsetLeft - (lista.clientWidth - aba.offsetWidth) / 2;
      lista.scrollTo({ left: alvo, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    }
  }

  abas.forEach((aba, indice) => {
    aba.addEventListener('click', () => ativarAba(aba, false));

    aba.addEventListener('keydown', (e) => {
      let destino = null;
      if (e.key === 'ArrowRight') destino = abas[(indice + 1) % abas.length];
      if (e.key === 'ArrowLeft')  destino = abas[(indice - 1 + abas.length) % abas.length];
      if (e.key === 'Home')       destino = abas[0];
      if (e.key === 'End')        destino = abas[abas.length - 1];
      if (destino) {
        e.preventDefault();
        ativarAba(destino, true);
      }
    });
  });

  /* Selos do hero: abrem direto a aba correspondente */
  document.querySelectorAll('[data-aba-alvo]').forEach(link => {
    link.addEventListener('click', () => {
      const aba = document.getElementById('aba-' + link.dataset.abaAlvo);
      if (aba) ativarAba(aba, false);
    });
  });
}

/* ============================================================
   3. ACORDEÃO DE DÚVIDAS (FAQ)
   Abre e fecha as respostas ao clicar nas perguntas.
   A altura é calculada pelo tamanho real do texto, então
   respostas longas nunca ficam cortadas no celular.
   Só uma resposta fica aberta por vez.
   ============================================================ */

function iniciarAcordeaoDuvidas() {
  const botoes = document.querySelectorAll('.duvida-botao');
  if (!botoes.length) return;

  function fechar(botao) {
    const resposta = botao.nextElementSibling;
    botao.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
    resposta.classList.remove('aberto');
    resposta.style.maxHeight = '';
  }

  function abrir(botao) {
    const resposta = botao.nextElementSibling;
    botao.classList.add('aberto');
    botao.setAttribute('aria-expanded', 'true');
    resposta.classList.add('aberto');
    resposta.style.maxHeight = resposta.scrollHeight + 'px';
  }

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      const estavaAberto = botao.getAttribute('aria-expanded') === 'true';
      botoes.forEach(fechar);
      if (!estavaAberto) abrir(botao);
    });
  });

  /* Recalcula a altura se a tela girar ou mudar de tamanho */
  window.addEventListener('resize', () => {
    document.querySelectorAll('.duvida-resposta.aberto').forEach(r => {
      r.style.maxHeight = r.scrollHeight + 'px';
    });
  }, { passive: true });
}

/* ============================================================
   4. REVELAR ELEMENTOS AO SCROLL
   Adiciona a classe 'visivel' nos elementos com 'revelar'
   quando entram na tela.
   ============================================================ */

function iniciarRevelacaoAoScroll() {
  const elementos = document.querySelectorAll('.revelar');
  if (!elementos.length) return;

  /* Sem suporte ou com "reduzir movimento": mostra tudo de uma vez */
  if (!('IntersectionObserver' in window) || reduzirMovimento) {
    elementos.forEach(el => el.classList.add('visivel'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    let ordem = 0;
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;

      /* Atraso escalonado para efeito em cascata (60ms por elemento) */
      const atraso = Math.min(ordem++ * 60, 360);
      setTimeout(() => entrada.target.classList.add('visivel'), atraso);

      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

  elementos.forEach(el => observador.observe(el));
}

/* ============================================================
   5. DESTAQUE ATIVO NA NAVEGAÇÃO
   Marca o link (desktop e menu mobile) da seção visível.
   ============================================================ */

function iniciarDestaqueNavegacao() {
  const links = document.querySelectorAll('.nav-lista-links a, .menu-mobile-link');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const ids = new Set();
  links.forEach(l => {
    const href = l.getAttribute('href');
    if (href && href.length > 1 && href.startsWith('#')) ids.add(href);
  });

  const secoes = Array.from(ids)
    .map(id => document.querySelector(id))
    .filter(Boolean);

  /* Observa também o topo, para limpar o destaque ao voltar ao início */
  const inicio = document.getElementById('inicio');
  if (inicio) secoes.push(inicio);

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      const id = '#' + entrada.target.id;
      links.forEach(l => l.classList.toggle('ativo', l.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  secoes.forEach(s => observador.observe(s));
}

/* ============================================================
   6. MENU MOBILE
   Abre e fecha a gaveta ao tocar no botão hambúrguer.
   ============================================================ */

function iniciarMenuMobile() {
  const botao   = document.getElementById('botaoHamburguer');
  const menu    = document.getElementById('menuMobile');
  const overlay = document.getElementById('menuMobileOverlay');

  if (!botao || !menu) return;

  let menuAberto = false;

  function abrirMenu() {
    menuAberto = true;
    botao.classList.add('aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar menu');
    menu.classList.add('aberto');
    menu.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('visivel');
    document.body.classList.add('menu-aberto');
  }

  function fecharMenu(devolverFoco) {
    if (!menuAberto) return;
    menuAberto = false;
    botao.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('aberto');
    menu.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('visivel');
    document.body.classList.remove('menu-aberto');
    if (devolverFoco) botao.focus();
  }

  /* Alterna ao tocar no hambúrguer */
  botao.addEventListener('click', () => {
    menuAberto ? fecharMenu(false) : abrirMenu();
  });

  /* Fecha ao tocar fora (overlay) */
  if (overlay) overlay.addEventListener('click', () => fecharMenu(false));

  /* Fecha ao escolher qualquer link ou botão do menu
     (destrava a rolagem antes de a página navegar até a seção) */
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => fecharMenu(false));
  });

  /* Fecha ao pressionar ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharMenu(true);
  });

  /* Fecha ao redimensionar para desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth >= LARGURA_DESKTOP) fecharMenu(false);
  }, { passive: true });
}

/* ============================================================
   7. ESTADO DE ROLAGEM
   Sombra na navbar após rolar e botão "voltar ao topo".
   ============================================================ */

function iniciarEstadoRolagem() {
  const navegacao  = document.getElementById('navegacao');
  const botaoTopo  = document.getElementById('botaoTopo');
  let agendado = false;

  function atualizar() {
    agendado = false;
    const y = window.scrollY;
    if (navegacao) navegacao.classList.toggle('rolada', y > 8);
    if (botaoTopo) botaoTopo.classList.toggle('visivel', y > 700);
  }

  window.addEventListener('scroll', () => {
    if (!agendado) {
      agendado = true;
      requestAnimationFrame(atualizar);
    }
  }, { passive: true });

  if (botaoTopo) {
    botaoTopo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    });
  }

  atualizar();
}

/* ============================================================
   8. ANO ATUAL NO RODAPÉ
   ============================================================ */

function preencherAnoAtual() {
  const spanAno = document.getElementById('anoAtual');
  if (spanAno) spanAno.textContent = new Date().getFullYear();
}

/* ============================================================
   9. INICIALIZAÇÃO
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  iniciarAbasServicos();
  iniciarAcordeaoDuvidas();
  iniciarRevelacaoAoScroll();
  iniciarDestaqueNavegacao();
  iniciarMenuMobile();
  iniciarEstadoRolagem();
  preencherAnoAtual();
});
