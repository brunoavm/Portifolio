    'use strict';
    /* ── Estado ── */
    let valorAtual    = '0';
    let valorAnterior = '';
    let operador      = null;
    let esperandoProx = false;
    let historico     = [];

    const elResultado  = document.getElementById('displayResultado');
    const elExpressao  = document.getElementById('displayExpressao');
    const elHistorico  = document.getElementById('displayHistorico');
    const elLista      = document.getElementById('historicoLista');

    /* ── Atualiza display ── */
    function atualizarDisplay() {
      /* Formata número grande */
      const num = parseFloat(valorAtual);
      if (!isNaN(num) && Math.abs(num) >= 1e12) {
        elResultado.textContent = num.toExponential(4);
      } else {
        elResultado.textContent = valorAtual;
      }

      if (operador && valorAnterior) {
        elExpressao.textContent = `${valorAnterior} ${operador}`;
      } else {
        elExpressao.textContent = '';
      }
    }

    /* ── Animação no resultado ── */
    function animarResultado() {
      elResultado.classList.add('animar');
      setTimeout(() => elResultado.classList.remove('animar'), 180);
    }

    /* ── Adicionar ao histórico ── */
    function adicionarHistorico(expressao, resultado) {
      historico.unshift({ expressao, resultado });
      if (historico.length > 20) historico.pop();
      renderizarHistorico();
    }

    function renderizarHistorico() {
      if (!historico.length) {
        elLista.innerHTML = '<div class="historico-vazio">Nenhum cálculo ainda.</div>';
        return;
      }
      elLista.innerHTML = historico.map(h => `
        <div class="historico-item" data-res="${h.resultado}" title="Clicar para usar o resultado">
          <span class="historico-expr">${h.expressao}</span>
          <span class="historico-res">${h.resultado}</span>
        </div>
      `).join('');

      /* Clicar no histórico preenche o resultado */
      elLista.querySelectorAll('.historico-item').forEach(item => {
        item.addEventListener('click', () => {
          valorAtual    = item.dataset.res;
          operador      = null;
          valorAnterior = '';
          esperandoProx = false;
          atualizarDisplay();
        });
      });
    }

    /* ── Calcular ── */
    function calcular(a, op, b) {
      const n1 = parseFloat(a);
      const n2 = parseFloat(b);
      switch (op) {
        case '+': return arredondar(n1 + n2);
        case '−': return arredondar(n1 - n2);
        case '×': return arredondar(n1 * n2);
        case '÷': return n2 === 0 ? 'Erro' : arredondar(n1 / n2);
        default:  return b;
      }
    }

    function arredondar(n) {
      return parseFloat(n.toPrecision(12)).toString();
    }

    /* ── Ações ── */
    function aoDigitarNumero(val) {
      if (esperandoProx) {
        valorAtual    = val;
        esperandoProx = false;
      } else {
        valorAtual = valorAtual === '0' ? val : valorAtual + val;
      }
      atualizarDisplay();
    }

    function aoDigitarOperador(op) {
      if (operador && !esperandoProx) {
        const res = calcular(valorAnterior, operador, valorAtual);
        valorAnterior = res;
        valorAtual    = res;
      } else {
        valorAnterior = valorAtual;
      }
      operador      = op;
      esperandoProx = true;
      atualizarDisplay();
    }

    function aoIgual() {
      if (!operador || esperandoProx) return;
      const expressaoTexto = `${valorAnterior} ${operador} ${valorAtual}`;
      const res = calcular(valorAnterior, operador, valorAtual);
      adicionarHistorico(expressaoTexto, res);
      elHistorico.textContent = expressaoTexto + ' =';
      animarResultado();
      valorAtual    = res;
      operador      = null;
      valorAnterior = '';
      esperandoProx = false;
      atualizarDisplay();
    }

    function aoLimpar() {
      valorAtual = '0'; valorAnterior = ''; operador = null; esperandoProx = false;
      elHistorico.textContent = '';
      atualizarDisplay();
    }

    function aoApagar() {
      if (valorAtual.length > 1) {
        valorAtual = valorAtual.slice(0, -1);
      } else {
        valorAtual = '0';
      }
      atualizarDisplay();
    }

    function aoVirgula() {
      if (esperandoProx) { valorAtual = '0,'; esperandoProx = false; return; }
      if (!valorAtual.includes(',')) valorAtual += ',';
      atualizarDisplay();
    }

    function aoPorcento() {
      valorAtual = arredondar(parseFloat(valorAtual) / 100);
      atualizarDisplay();
    }

    /* ── Delegação de eventos ── */
    document.querySelector('.botoes').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-acao]');
      if (!btn) return;
      const { acao, val } = btn.dataset;
      switch (acao) {
        case 'numero':   aoDigitarNumero(val); break;
        case 'operador': aoDigitarOperador(val); break;
        case 'igual':    aoIgual(); break;
        case 'limpar':   aoLimpar(); break;
        case 'apagar':   aoApagar(); break;
        case 'virgula':  aoVirgula(); break;
        case 'porcento': aoPorcento(); break;
      }
    });

    /* ── Teclado ── */
    document.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') aoDigitarNumero(e.key);
      else if (e.key === '+')  aoDigitarOperador('+');
      else if (e.key === '-')  aoDigitarOperador('−');
      else if (e.key === '*')  aoDigitarOperador('×');
      else if (e.key === '/')  { e.preventDefault(); aoDigitarOperador('÷'); }
      else if (e.key === 'Enter' || e.key === '=') aoIgual();
      else if (e.key === 'Backspace') aoApagar();
      else if (e.key === 'Escape') aoLimpar();
      else if (e.key === '.' || e.key === ',') aoVirgula();
      else if (e.key === '%') aoPorcento();
    });

    /* ── Limpar histórico ── */
    document.getElementById('btnLimparHistorico').addEventListener('click', () => {
      historico = [];
      renderizarHistorico();
    });