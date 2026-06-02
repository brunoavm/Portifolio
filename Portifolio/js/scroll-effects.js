/* ============================================================
   SCROLL-EFFECTS.JS — Efeitos de Scroll
   Portfolio Bruno Magalhães
   ============================================================

   ÍNDICE:
   1. Navbar: mudar estilo ao rolar
   2. Link ativo na navbar conforme seção visível
   3. Intersection Observer: revelar elementos ao scroll
   4. Scroll suave para links âncora
   ============================================================ */

'use strict';

/* ============================================================
   1. NAVBAR: MUDAR ESTILO AO ROLAR
   ============================================================ */

/**
 * iniciarNavbarScroll
 * Adiciona classe 'rolado' ao cabeçalho quando o usuário
 * rola mais de 80px, ativando o fundo com blur.
 */
function iniciarNavbarScroll() {
  const cabecalho = document.getElementById('cabecalho');
  if (!cabecalho) return;

  const limiarScroll = 80; /* Pixels a rolar antes de ativar */

  function verificarScroll() {
    if (window.scrollY > limiarScroll) {
      cabecalho.classList.add('rolado');
    } else {
      cabecalho.classList.remove('rolado');
    }
  }

  /* Verifica na inicialização (caso já esteja rolado ao recarregar) */
  verificarScroll();

  /* Listener otimizado com passive: true */
  window.addEventListener('scroll', verificarScroll, { passive: true });
}

/* ============================================================
   2. LINK ATIVO NA NAVBAR CONFORME SEÇÃO VISÍVEL
   ============================================================ */

/**
 * iniciarNavLinkAtivo
 * Usa scroll event para determinar qual seção está visível.
 *
 * POR QUE NÃO USAMOS INTERSECTIONOBSERVER AQUI:
 * O threshold: 0.4 significa que 40% da seção precisa estar
 * visível. Seções muito altas (projetos, jornada) têm 1500px+,
 * então 40% = 600px+ precisariam estar na tela ao mesmo tempo
 * — o que nunca acontece. A abordagem por scroll é muito mais
 * confiável para seções de tamanho variável.
 */
function iniciarNavLinkAtivo() {
  const secoes   = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!secoes.length || !navLinks.length) return;

  /* Mapa de id da seção → link correspondente */
  const mapaLinks = {};
  navLinks.forEach(link => {
    if (link.dataset.secao) mapaLinks[link.dataset.secao] = link;
  });

  /**
   * ativarLink
   * Remove 'ativo' de todos os links e ativa apenas o informado.
   */
  function ativarLink(idSecao) {
    navLinks.forEach(l => l.classList.remove('ativo'));
    if (mapaLinks[idSecao]) mapaLinks[idSecao].classList.add('ativo');
  }

  /**
   * encontrarSecaoAtual
   * Percorre todas as seções e retorna o id da que está
   * mais próxima do topo da viewport (descontando a navbar).
   */
  function encontrarSecaoAtual() {
    const alturaNav   = 80; /* altura aproximada da navbar */
    const limiar      = alturaNav + 60; /* zona de ativação: 60px abaixo da navbar */
    let secaoAtual    = null;
    let menorDistancia = Infinity;

    secoes.forEach(secao => {
      const rect = secao.getBoundingClientRect();

      /* Distância do topo da seção até a zona de ativação */
      const distancia = Math.abs(rect.top - limiar);

      /* A seção precisa estar acima do fundo da tela E
         o topo dela precisa estar acima da metade da tela */
      if (rect.top <= window.innerHeight * 0.6 && rect.bottom > limiar) {
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          secaoAtual     = secao.getAttribute('id');
        }
      }
    });

    return secaoAtual;
  }

  /* Verifica ao rolar — passive: true para performance */
  window.addEventListener('scroll', () => {
    const atual = encontrarSecaoAtual();
    if (atual) ativarLink(atual);
  }, { passive: true });

  /* Verifica na inicialização */
  const inicial = encontrarSecaoAtual();
  if (inicial) ativarLink(inicial);
}

/* ============================================================
   3. INTERSECTION OBSERVER: REVELAR ELEMENTOS AO SCROLL
   ============================================================ */

/**
 * iniciarRevelacaoScroll
 * Usa IntersectionObserver para adicionar a classe 'visivel'
 * a todos os elementos com a classe 'revelar-scroll',
 * revelando-os com animação quando entram na viewport.
 */
function iniciarRevelacaoScroll() {
  const elementosParaRevelar = document.querySelectorAll('.revelar-scroll');
  if (!elementosParaRevelar.length) return;

  /* Configurações do observer */
  const opcoes = {
    threshold: 0.12,                  /* 12% do elemento precisa estar visível */
    rootMargin: '0px 0px -50px 0px',  /* Antecipa um pouco antes de entrar */
  };

  const observadorRevelacao = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      /* Lê o atraso configurado via data-atraso (em ms) */
      const atraso = parseInt(entrada.target.dataset.atraso) || 0;

      setTimeout(() => {
        entrada.target.classList.add('visivel');
      }, atraso);

      /* Para de observar após revelar (evita re-animação no scroll para cima) */
      observadorRevelacao.unobserve(entrada.target);
    });
  }, opcoes);

  /* Aplica delays em cascata para filhos de grids */
  aplicarDelaysCascata();

  /* Observa cada elemento */
  elementosParaRevelar.forEach(el => observadorRevelacao.observe(el));
}

/**
 * aplicarDelaysCascata
 * Aplica atrasos crescentes nos cards de grids para o
 * efeito de "cascata" ao revelar grupos de itens.
 */
function aplicarDelaysCascata() {
  const grids = document.querySelectorAll(
    '.grid-tecnologias, .grid-projetos, .grid-projetos-destaque, .grid-aprendendo'
  );

  grids.forEach(grid => {
    const filhos = grid.querySelectorAll('.revelar-scroll');
    filhos.forEach((filho, indice) => {
      /* Máximo de 700ms de atraso para não deixar demorar demais */
      const atraso = Math.min(indice * 80, 700);
      filho.dataset.atraso = atraso;
    });
  });
}

/* ============================================================
   4. SCROLL SUAVE PARA LINKS ÂNCORA
   ============================================================ */

/**
 * iniciarScrollSuaveAncora
 * Intercepta cliques em links âncora (href="#seção")
 * e aplica scroll suave manual, descontando a altura da navbar.
 */
function iniciarScrollSuaveAncora() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (evento) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const alvoId = href.slice(1);
      const alvo   = document.getElementById(alvoId);
      if (!alvo) return;

      evento.preventDefault();

      /* Altura da navbar para compensar o offset */
      const cabecalho  = document.getElementById('cabecalho');
      const alturaNav  = cabecalho ? cabecalho.offsetHeight : 0;

      /* Posição de destino */
      const posicaoAlvo = alvo.getBoundingClientRect().top + window.scrollY - alturaNav - 10;

      window.scrollTo({
        top: posicaoAlvo,
        behavior: 'smooth',
      });
    });
  });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function iniciarScrollEffects() {
  iniciarNavbarScroll();
  iniciarNavLinkAtivo();
  iniciarRevelacaoScroll();
  iniciarScrollSuaveAncora();
}

document.addEventListener('DOMContentLoaded', iniciarScrollEffects);
