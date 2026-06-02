/* ============================================================
   SCRIPT.JS — Script Principal
   Portfolio Bruno Magalhães
   ============================================================

   ÍNDICE:
   1. Tela de Carregamento
   2. Ano Atual no Rodapé
   3. Validação e Envio do Formulário de Contato
   4. Filtros de Projetos
   5. Botão Voltar ao Topo
   6. Efeito Ripple nos Botões
   7. Inicialização Geral
   ============================================================ */

'use strict';

/* ============================================================
   1. TELA DE CARREGAMENTO
   ============================================================ */

// /**
//  * ocultarTelaDeCarregamento
//  * Remove a tela de carregamento após o site estar pronto.
//  * Aguarda a animação da barra de progresso terminar antes de ocultar.
//  */
// function ocultarTelaDeCarregamento() {
//   const telaDeCarregamento = document.getElementById('teladecarregamento');
//   if (!telaDeCarregamento) return;

//   /* Tempo mínimo para mostrar a tela (1.9s = duração da barra no CSS) */
//   const tempoMinimo = 1000;

//   setTimeout(() => {
//     telaDeCarregamento.classList.add('ocultar');

//     /* Remove o elemento do DOM após a transição de saída */
//     telaDeCarregamento.addEventListener('transitionend', () => {
//       telaDeCarregamento.remove();
//     }, { once: true });
//   }, tempoMinimo);
// }

/* ============================================================
   2. ANO ATUAL NO RODAPÉ
   ============================================================ */

/**
 * preencherAnoAtual
 * Insere o ano corrente no span do rodapé automaticamente.
 */
function preencherAnoAtual() {
  const spanAno = document.getElementById('anoAtual');
  if (spanAno) {
    spanAno.textContent = new Date().getFullYear();
  }
}

/* ============================================================
   3. VALIDAÇÃO E ENVIO DO FORMULÁRIO DE CONTATO
   ============================================================ */

/**
 * iniciarFormularioContato
 * Valida os campos e simula o envio do formulário.
 * Para uso real, conecte a um serviço como Formspree ou EmailJS.
 */
function iniciarFormularioContato() {
  const formulario = document.getElementById('formularioContato');
  const botaoEnviar = document.getElementById('botaoEnviar');
  const feedback = document.getElementById('formularioFeedback');

  if (!formulario) return;

  /* --- Validação individual de campos --- */
  function validarCampo(campo, mensagemErro) {
    const erroSpan = document.getElementById('erro' + capitalize(campo.id.replace('campo', '')));
    if (!campo.value.trim()) {
      campo.classList.add('invalido');
      if (erroSpan) erroSpan.textContent = mensagemErro;
      return false;
    }
    campo.classList.remove('invalido');
    if (erroSpan) erroSpan.textContent = '';
    return true;
  }

  /* --- Valida formato de e-mail --- */
  function validarEmail(campo) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const erroSpan = document.getElementById('erroEmail');
    if (!regexEmail.test(campo.value.trim())) {
      campo.classList.add('invalido');
      if (erroSpan) erroSpan.textContent = 'Digite um e-mail válido.';
      return false;
    }
    campo.classList.remove('invalido');
    if (erroSpan) erroSpan.textContent = '';
    return true;
  }

  /* --- Limpa erros ao digitar --- */
  formulario.querySelectorAll('.campo-input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('invalido');
      const idErro = input.id.replace('campo', 'erro');
      const erroSpan = document.getElementById(idErro);
      if (erroSpan) erroSpan.textContent = '';
    });
  });

  /* --- Submit do formulário --- */
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const campoNome = document.getElementById('campoNome');
    const campoEmail = document.getElementById('campoEmail');
    const campoAssunto = document.getElementById('campoAssunto');
    const campoMensagem = document.getElementById('campoMensagem');

    /* Valida todos os campos */
    const nomeValido = validarCampo(campoNome, 'Por favor, informe seu nome.');
    const emailValido = validarCampo(campoEmail, 'Por favor, informe seu e-mail.') && validarEmail(campoEmail);
    const assuntoValido = validarCampo(campoAssunto, 'Por favor, informe o assunto.');
    const mensagemValida = validarCampo(campoMensagem, 'Por favor, escreva sua mensagem.');

    if (!nomeValido || !emailValido || !assuntoValido || !mensagemValida) return;

    /* Estado de carregamento */
    ativarEstadoEnviando(botaoEnviar, true);

    try {
      /*
       * ── INTEGRAÇÃO REAL ──────────────────────────────────────────────
       * Substitua a simulação abaixo por uma chamada real:
       *
       * Opção A — Formspree:
       *   const resposta = await fetch('https://formspree.io/f/SEU_ID', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json' },
       *     body: JSON.stringify({
       *       nome: campoNome.value,
       *       email: campoEmail.value,
       *       assunto: campoAssunto.value,
       *       mensagem: campoMensagem.value,
       *     }),
       *   });
       *   if (!resposta.ok) throw new Error('Erro ao enviar');
       *
       * Opção B — EmailJS:
       *   await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', { ... });
       * ─────────────────────────────────────────────────────────────────
       */

      /* Simulação de envio (remova ao integrar serviço real) */
      // await simularEnvio(1800);
      const resposta = await fetch('https://formspree.io/f/mbdbnglw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: campoNome.value,
          email: campoEmail.value,
          assunto: campoAssunto.value,
          mensagem: campoMensagem.value,
        }),
      });
      if (!resposta.ok) throw new Error('Erro ao enviar');

      /* Feedback de sucesso */
      exibirFeedback(feedback, 'sucesso', '✅ Mensagem enviada com sucesso! Responderei em breve.');
      formulario.reset();

    } catch (erro) {
      /* Feedback de erro */
      exibirFeedback(feedback, 'erro', '❌ Ocorreu um erro. Tente novamente ou envie um e-mail diretamente.');
      console.error('Erro ao enviar formulário:', erro);

    } finally {
      ativarEstadoEnviando(botaoEnviar, false);
    }
  });
}

/**
 * ativarEstadoEnviando
 * Alterna o botão entre estado normal e "enviando..."
 */
function ativarEstadoEnviando(botao, enviando) {
  if (!botao) return;
  const textoNormal = botao.querySelector('.enviar-texto');
  const textoCarregando = botao.querySelector('.enviar-carregando');
  botao.disabled = enviando;

  if (textoNormal) textoNormal.style.display = enviando ? 'none' : '';
  if (textoCarregando) textoCarregando.style.display = enviando ? 'inline-flex' : 'none';
}

/**
 * exibirFeedback
 * Mostra mensagem de sucesso ou erro abaixo do formulário.
 */
function exibirFeedback(elemento, tipo, mensagem) {
  if (!elemento) return;
  elemento.textContent = mensagem;
  elemento.className = `formulario-feedback ${tipo}`;
  elemento.style.display = 'block';

  /* Oculta automaticamente após 5 segundos */
  setTimeout(() => {
    elemento.style.display = 'none';
  }, 5000);
}

/**
 * simularEnvio
 * Simula um delay de envio (apenas para demonstração).
 */
function simularEnvio(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================================================
   4. FILTROS DE PROJETOS
   ============================================================ */

/**
 * iniciarFiltrosProjetos
 * Filtra os cards de projeto pela categoria selecionada.
 * Cada card tem data-categoria com os nomes separados por espaço.
 */
function iniciarFiltrosProjetos() {
  const botoeFiltros = document.querySelectorAll('.filtro-btn');
  const todosOsCards = document.querySelectorAll('[data-categoria]');

  if (!botoeFiltros.length) return;

  botoeFiltros.forEach(botao => {
    botao.addEventListener('click', () => {
      const filtroSelecionado = botao.dataset.filtro;

      /* Atualiza estado ativo dos botões */
      botoeFiltros.forEach(b => b.classList.remove('filtro-ativo'));
      botao.classList.add('filtro-ativo');

      /* Filtra os cards com animação suave */
      todosOsCards.forEach(card => {
        const categorias = card.dataset.categoria || '';

        if (filtroSelecionado === 'todos' || categorias.includes(filtroSelecionado)) {
          mostrarCard(card);
        } else {
          ocultarCard(card);
        }
      });
    });
  });
}

/** Exibe um card com transição suave */
function mostrarCard(card) {
  card.style.display = '';
  requestAnimationFrame(() => {
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
  });
}

/** Oculta um card com transição suave */
function ocultarCard(card) {
  card.style.opacity = '0';
  card.style.transform = 'scale(0.95)';
  setTimeout(() => {
    card.style.display = 'none';
  }, 300);
}

/* ============================================================
   5. BOTÃO VOLTAR AO TOPO
   ============================================================ */

/**
 * iniciarBotaoTopo
 * Exibe o botão "voltar ao topo" quando o usuário rola
 * mais de 500px e leva ao topo ao ser clicado.
 */
function iniciarBotaoTopo() {
  const botaoTopo = document.getElementById('botaoTopo');
  if (!botaoTopo) return;

  /* Verifica a posição de scroll */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      botaoTopo.classList.add('visivel');
    } else {
      botaoTopo.classList.remove('visivel');
    }
  }, { passive: true });

  /* Rola suavemente ao topo ao clicar */
  botaoTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   6. EFEITO RIPPLE NOS BOTÕES
   ============================================================ */

/**
 * iniciarEfeitoRipple
 * Adiciona um efeito de onda (ripple) ao clicar nos botões.
 */
function iniciarEfeitoRipple() {
  const seletoresBotoes = [
    '.botao-primario',
    '.botao-secundario',
    '.botao-enviar',
    '.botao-curriculo-contato',
    '.filtro-btn',
  ];

  document.querySelectorAll(seletoresBotoes.join(',')).forEach(botao => {
    botao.addEventListener('click', (evento) => {
      const rect = botao.getBoundingClientRect();
      const tamanho = Math.max(rect.width, rect.height);
      const x = evento.clientX - rect.left - tamanho / 2;
      const y = evento.clientY - rect.top - tamanho / 2;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.cssText = `
        width: ${tamanho}px;
        height: ${tamanho}px;
        left: ${x}px;
        top: ${y}px;
      `;

      botao.appendChild(ripple);

      /* Remove o elemento após a animação */
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });
}

/* ============================================================
   7. ALTERNAR TEMA (DARK / LIGHT MODE)
   ============================================================ */

/**
 * iniciarAlternarTema
 * Controla a alternância entre tema escuro (padrão) e tema claro.
 *
 * Lógica:
 * - Lê a preferência salva no localStorage
 * - Se não houver preferência, respeita o sistema do usuário (prefers-color-scheme)
 * - Salva a escolha para persistir entre visitas
 * - Atualiza os ícones e textos dos botões (desktop e mobile)
 */
function iniciarAlternarTema() {
  const html = document.documentElement;
  const botaoDesktop = document.getElementById('botaoTema');
  const botaoMobile = document.getElementById('botaoTemaMobile');
  const iconeDesktop = document.getElementById('iconeTema');
  const iconeMobile = document.getElementById('iconeTemaMobile');
  const textoMobile = document.getElementById('textoTemaMobile');

  /* --- Detecta a preferência inicial --- */
  const prefereSistemaClaro = window.matchMedia('(prefers-color-scheme: light)').matches;
  const temaSalvo = localStorage.getItem('bm-tema');

  /* Decide qual tema aplicar:
     1. Preferência salva pelo usuário tem prioridade
     2. Se não há salvo, usa a preferência do sistema operacional
     3. Padrão final: escuro */
  const temaInicial = temaSalvo || (prefereSistemaClaro ? 'claro' : 'escuro');

  aplicarTema(temaInicial);

  /* --- Função que aplica o tema e atualiza a UI --- */
  function aplicarTema(tema) {
    /* Adiciona classe de transição para animar a mudança suavemente */
    html.classList.add('transicao-tema');
    setTimeout(() => html.classList.remove('transicao-tema'), 400);

    if (tema === 'claro') {
      html.dataset.tema = 'claro';

      /* Ícone vira lua (para indicar "clique para ir ao escuro") */
      if (iconeDesktop) { iconeDesktop.className = 'ri-sun-line'; }
      if (iconeMobile) { iconeMobile.className = 'ri-moon-line'; }
      if (textoMobile) { textoMobile.textContent = 'Modo Escuro'; }

    } else {
      html.dataset.tema = 'escuro';

      /* Ícone vira sol (para indicar "clique para ir ao claro") */
      if (iconeDesktop) { iconeDesktop.className = 'ri-moon-line'; }
      if (iconeMobile) { iconeMobile.className = 'ri-sun-line'; }
      if (textoMobile) { textoMobile.textContent = 'Modo Claro'; }
    }

    /* Salva a preferência no localStorage */
    localStorage.setItem('bm-tema', tema);
  }

  /* --- Alterna entre os dois temas ao clicar --- */
  function alternarTema() {
    const temaAtual = html.dataset.tema;
    aplicarTema(temaAtual === 'claro' ? 'escuro' : 'claro');
  }

  /* Listeners nos dois botões (desktop e mobile) */
  if (botaoDesktop) botaoDesktop.addEventListener('click', alternarTema);
  if (botaoMobile) botaoMobile.addEventListener('click', alternarTema);

  /* Reage a mudanças na preferência do sistema em tempo real
     (ex: usuário muda do modo claro para escuro no celular) */
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    /* Só reage ao sistema se o usuário NÃO tiver uma preferência salva */
    if (!localStorage.getItem('bm-tema')) {
      aplicarTema(e.matches ? 'claro' : 'escuro');
    }
  });
}

/* ============================================================
   7. INICIALIZAÇÃO GERAL
   ============================================================ */

/**
 * inicializar
 * Ponto de entrada principal — chama todas as funções
 * após o DOM estar carregado.
 */
function inicializar() {
  // ocultarTelaDeCarregamento();
  preencherAnoAtual();
  iniciarFormularioContato();
  iniciarFiltrosProjetos();
  iniciarBotaoTopo();
  iniciarEfeitoRipple();
  iniciarAlternarTema();
}

/* --- Utilitário: capitaliza a primeira letra de uma string --- */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* Aguarda o DOM estar completamente carregado */
document.addEventListener('DOMContentLoaded', inicializar);
