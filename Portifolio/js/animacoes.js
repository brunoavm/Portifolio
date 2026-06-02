/* ============================================================
   ANIMACOES.JS — Animações Visuais
   Portfolio Bruno Magalhães
   ============================================================

   ÍNDICE:
   1. Canvas de Partículas (Hero Background)
   2. Efeito Typing (Digitação de Texto)
   3. Animação das Barras de Nível (Tecnologias)
   4. Contador Animado (Stats do Hero)
   5. Efeito Parallax Suave no Hero
   6. Animação da Linha da Timeline
   7. Inicialização
   ============================================================ */

'use strict';

/* ============================================================
   1. CANVAS DE PARTÍCULAS — Hero Background
   ============================================================ */

/**
 * IniciarParticulas
 * Cria um sistema de partículas no canvas do hero.
 * As partículas se movem aleatoriamente e se conectam
 * quando estão próximas (efeito de rede tecnológica).
 */
function iniciarParticulas() {
  const canvas  = document.getElementById('canvasParticulas');
  if (!canvas) return;

  const ctx     = canvas.getContext('2d');
  let largura   = canvas.width  = window.innerWidth;
  let altura    = canvas.height = window.innerHeight;

  /* --- Configurações das partículas --- */
  const CONFIG = {
    quantidade:       60,          /* Número de partículas */
    velocidadeBase:   0.4,         /* Velocidade de movimento */
    raioParticula:    2,           /* Tamanho das partículas */
    distanciaConexao: 130,         /* Distância máxima para conectar */
    corParticula:     '0, 212, 255', /* RGB da cor (azul neon) */
    corConexao:       '0, 180, 255', /* Cor das linhas de conexão */
    opacidadeMax:     0.6,         /* Opacidade máxima das partículas */
  };

  /* Array de partículas ativas */
  let particulas = [];

  /* Posição do mouse para interatividade */
  let mouse = { x: largura / 2, y: altura / 2 };

  /* --- Cria uma partícula com posição e velocidade aleatórias --- */
  function criarParticula() {
    return {
      x:   Math.random() * largura,
      y:   Math.random() * altura,
      vx:  (Math.random() - 0.5) * CONFIG.velocidadeBase,
      vy:  (Math.random() - 0.5) * CONFIG.velocidadeBase,
      raio: Math.random() * CONFIG.raioParticula + 0.5,
      opacidade: Math.random() * CONFIG.opacidadeMax,
    };
  }

  /* --- Inicializa o array de partículas --- */
  function inicializarParticulas() {
    particulas = [];
    for (let i = 0; i < CONFIG.quantidade; i++) {
      particulas.push(criarParticula());
    }
  }

  /* --- Atualiza posição de cada partícula (movimento) --- */
  function atualizarParticulas() {
    particulas.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      /* Rebater nas bordas do canvas */
      if (p.x < 0 || p.x > largura)  p.vx *= -1;
      if (p.y < 0 || p.y > altura)   p.vy *= -1;

      /* Interação suave com o mouse (repulsão leve) */
      const dx          = mouse.x - p.x;
      const dy          = mouse.y - p.y;
      const distMouse   = Math.sqrt(dx * dx + dy * dy);
      const raioInfluencia = 120;

      if (distMouse < raioInfluencia) {
        const forca = (raioInfluencia - distMouse) / raioInfluencia * 0.015;
        p.vx -= dx * forca;
        p.vy -= dy * forca;

        /* Limita a velocidade máxima */
        const velMax = CONFIG.velocidadeBase * 3;
        const vel    = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (vel > velMax) {
          p.vx = (p.vx / vel) * velMax;
          p.vy = (p.vy / vel) * velMax;
        }
      }
    });
  }

  /* --- Desenha as partículas e conexões no canvas --- */
  function desenharParticulas() {
    ctx.clearRect(0, 0, largura, altura);

    /* Desenha as conexões entre partículas próximas */
    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        const dx   = particulas[i].x - particulas[j].x;
        const dy   = particulas[i].y - particulas[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.distanciaConexao) {
          /* Opacidade inversamente proporcional à distância */
          const opacidade = (1 - dist / CONFIG.distanciaConexao) * 0.4;

          ctx.beginPath();
          ctx.moveTo(particulas[i].x, particulas[i].y);
          ctx.lineTo(particulas[j].x, particulas[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.corConexao}, ${opacidade})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    /* Desenha os círculos das partículas */
    particulas.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.corParticula}, ${p.opacidade})`;
      ctx.fill();
    });
  }

  /* --- Loop de animação principal (requestAnimationFrame) --- */
  function animar() {
    atualizarParticulas();
    desenharParticulas();
    requestAnimationFrame(animar);
  }

  /* --- Redimensiona o canvas quando a janela muda de tamanho --- */
  window.addEventListener('resize', () => {
    largura  = canvas.width  = window.innerWidth;
    altura   = canvas.height = window.innerHeight;
    inicializarParticulas();
  }, { passive: true });

  /* --- Atualiza posição do mouse para interatividade --- */
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  /* --- Inicia --- */
  inicializarParticulas();
  animar();
}

/* ============================================================
   2. EFEITO TYPING — Digitação de Texto
   ============================================================ */

/**
 * iniciarEfeitoTyping
 * Cria um efeito de máquina de escrever no subtítulo do hero.
 * Alterna entre diferentes textos em loop.
 */
function iniciarEfeitoTyping() {
  const elementoTexto = document.getElementById('textoDigitando');
  if (!elementoTexto) return;

  /* Textos que serão alternados */
  const textos = [
    'Desenvolvedor Front-End',
    'Estudante de ADS',
    'Criador de UI Modernas',
    'Apaixonado por Tecnologia',
    'Amante de Código Limpo',
  ];

  let indiceTexto  = 0; /* Índice do texto atual */
  let indiceChar   = 0; /* Índice do caractere atual */
  let estaApagando = false; /* Se está apagando ou digitando */

  /* --- Velocidades --- */
  const velocidadeDigitar  = 80;   /* ms por caractere ao digitar */
  const velocidadeApagar   = 40;   /* ms por caractere ao apagar */
  const pausaEntreTextos   = 2000; /* ms de pausa no texto completo */
  const pausaAposApagar    = 400;  /* ms de pausa antes de digitar o próximo */

  function digitarTexto() {
    const textoAtual = textos[indiceTexto];

    if (!estaApagando) {
      /* Está digitando: adiciona um caractere */
      indiceChar++;
      elementoTexto.textContent = textoAtual.substring(0, indiceChar);

      if (indiceChar === textoAtual.length) {
        /* Texto completo: pausa antes de apagar */
        estaApagando = true;
        setTimeout(digitarTexto, pausaEntreTextos);
        return;
      }
    } else {
      /* Está apagando: remove um caractere */
      indiceChar--;
      elementoTexto.textContent = textoAtual.substring(0, indiceChar);

      if (indiceChar === 0) {
        /* Texto apagado: passa para o próximo */
        estaApagando = false;
        indiceTexto  = (indiceTexto + 1) % textos.length;
        setTimeout(digitarTexto, pausaAposApagar);
        return;
      }
    }

    /* Velocidade diferente para digitar e apagar */
    setTimeout(digitarTexto, estaApagando ? velocidadeApagar : velocidadeDigitar);
  }

  /* Pequeno atraso antes de começar */
  setTimeout(digitarTexto, 1200);
}

/* ============================================================
   3. ANIMAÇÃO DAS BARRAS DE NÍVEL — Tecnologias
   ============================================================ */

/**
 * iniciarAnimacaoBarras
 * Usa Intersection Observer para animar as barras de nível
 * dos cards de tecnologia quando ficam visíveis na tela.
 */
function iniciarAnimacaoBarras() {
  const cardsNivel = document.querySelectorAll('.card-tecnologia, .card-aprendendo');
  if (!cardsNivel.length) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        /* Adiciona classe que dispara a animação CSS */
        entrada.target.classList.add('animado');
        /* Para de observar depois que animou */
        observador.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.3, /* Precisa estar 30% visível para animar */
  });

  cardsNivel.forEach(card => observador.observe(card));
}

/* ============================================================
   4. CONTADOR ANIMADO — Stats do Hero
   ============================================================ */

/**
 * iniciarContadores
 * Anima os números das estatísticas do hero contando
 * de 0 até o valor final.
 */
function iniciarContadores() {
  const statNumeros = document.querySelectorAll('.stat-numero');
  if (!statNumeros.length) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;

      const elemento     = entrada.target;
      const valorTexto   = elemento.textContent.trim();
      const apenasNumero = parseInt(valorTexto.replace(/\D/g, ''));

      /* Se não é um número (ex: "ADS"), não anima */
      if (isNaN(apenasNumero)) {
        observador.unobserve(elemento);
        return;
      }

      /* Sufixo (ex: "+") */
      const sufixo = valorTexto.replace(/[0-9]/g, '');

      animarContador(elemento, 0, apenasNumero, 1500, sufixo);
      observador.unobserve(elemento);
    });
  }, { threshold: 0.5 });

  statNumeros.forEach(num => observador.observe(num));
}

/**
 * animarContador
 * Incrementa um número visualmente usando easeOut.
 */
function animarContador(elemento, inicio, fim, duracao, sufixo) {
  const inicioTempo = performance.now();

  function atualizar(tempoAtual) {
    const progresso  = Math.min((tempoAtual - inicioTempo) / duracao, 1);
    /* Easing easeOut para desacelerar no final */
    const eased      = 1 - Math.pow(1 - progresso, 3);
    const valorAtual = Math.floor(inicio + (fim - inicio) * eased);

    elemento.textContent = valorAtual + sufixo;

    if (progresso < 1) {
      requestAnimationFrame(atualizar);
    }
  }

  requestAnimationFrame(atualizar);
}

/* ============================================================
   5. EFEITO PARALLAX SUAVE NO HERO
   ============================================================ */

/**
 * iniciarParallax
 * Aplica um efeito de parallax sutil ao mover o mouse,
 * movendo o avatar e os elementos do hero em velocidades diferentes.
 */
function iniciarParallax() {
  const heroConteudo  = document.querySelector('.hero-conteudo');
  const heroAvatar    = document.querySelector('.hero-avatar-wrapper');
  const heroGlow1     = document.querySelector('.hero-glow-1');
  const heroGlow2     = document.querySelector('.hero-glow-2');

  if (!heroConteudo || !heroAvatar) return;

  /* Só aplica em telas maiores (não atrapalha mobile) */
  if (window.innerWidth < 900) return;

  let xAlvo = 0, yAlvo = 0;
  let xAtual = 0, yAtual = 0;

  document.addEventListener('mousemove', (e) => {
    /* Normaliza posição do mouse entre -1 e 1 */
    xAlvo = (e.clientX / window.innerWidth  - 0.5) * 2;
    yAlvo = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function suavizarParallax() {
    /* Interpolação suave para movimento fluido */
    const fator = 0.05;
    xAtual += (xAlvo - xAtual) * fator;
    yAtual += (yAlvo - yAtual) * fator;

    /* Move o avatar mais intensamente */
    heroAvatar.style.transform = `translate(${xAtual * 14}px, ${yAtual * 10}px)`;

    /* Move o conteúdo mais levemente (na direção oposta para depth) */
    heroConteudo.style.transform = `translate(${xAtual * -6}px, ${yAtual * -4}px)`;

    /* Move os glows */
    if (heroGlow1) heroGlow1.style.transform = `translate(${xAtual * 20}px, ${yAtual * 15}px)`;
    if (heroGlow2) heroGlow2.style.transform = `translate(${xAtual * -18}px, ${yAtual * -12}px)`;

    requestAnimationFrame(suavizarParallax);
  }

  suavizarParallax();
}

/* ============================================================
   6. ANIMAÇÃO DA LINHA DA TIMELINE
   ============================================================ */

/**
 * iniciarAnimacaoTimeline
 * Adiciona classe 'visivel' aos marcadores da timeline
 * conforme o usuário rola pela seção.
 */
function iniciarAnimacaoTimeline() {
  const itensTimeline = document.querySelectorAll('.timeline-item');
  if (!itensTimeline.length) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada, i) => {
      if (entrada.isIntersecting) {
        /* Atraso escalonado para cada item */
        setTimeout(() => {
          entrada.target.classList.add('visivel');
        }, i * 120);
        observador.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.25,
  });

  itensTimeline.forEach(item => observador.observe(item));
}

/* ============================================================
   7. INICIALIZAÇÃO
   ============================================================ */

/**
 * iniciarAnimacoes
 * Ponto de entrada para todas as animações.
 * Chamado quando o DOM está pronto.
 */
function iniciarAnimacoes() {
  iniciarParticulas();
  iniciarEfeitoTyping();
  iniciarAnimacaoBarras();
  iniciarContadores();
  iniciarAnimacaoTimeline();

  /* Parallax: só em dispositivos com mouse */
  if (!window.matchMedia('(pointer: coarse)').matches) {
    iniciarParallax();
  }
}

document.addEventListener('DOMContentLoaded', iniciarAnimacoes);
