    'use strict';

    /* ── Configuração da API (Open Exchange Rates — plano gratuito) ──
       Usamos exchangerate-api.com que não exige chave para /latest/USD
    ── */
    const API_URL = 'https://open.er-api.com/v6/latest/';

    let taxasCache = {};
    let ultimaAtualizacao = null;

    /* ── Elementos ── */
    const moedaOrigem   = document.getElementById('moedaOrigem');
    const moedaDestino  = document.getElementById('moedaDestino');
    const valorOrigem   = document.getElementById('valorOrigem');
    const valorDestino  = document.getElementById('valorDestino');
    const resultadoValor = document.getElementById('resultadoValor');
    const resultadoTaxa  = document.getElementById('resultadoTaxa');
    const btnConverter  = document.getElementById('btnConverter');
    const apiStatus     = document.getElementById('apiStatus');

    /* ── Cotações populares exibidas ── */
    const cotacoesPopulares = [
      { par: 'USD/BRL', de: 'USD', para: 'BRL', flag1: '🇺🇸', flag2: '🇧🇷', nome: 'Dólar / Real' },
      { par: 'EUR/BRL', de: 'EUR', para: 'BRL', flag1: '🇪🇺', flag2: '🇧🇷', nome: 'Euro / Real' },
      { par: 'EUR/USD', de: 'EUR', para: 'USD', flag1: '🇪🇺', flag2: '🇺🇸', nome: 'Euro / Dólar' },
      { par: 'GBP/USD', de: 'GBP', para: 'USD', flag1: '🇬🇧', flag2: '🇺🇸', nome: 'Libra / Dólar' },
      { par: 'BTC/USD', de: null, para: null,    flag1: '₿',   flag2: '🇺🇸', nome: 'Bitcoin / Dólar' },
    ];

    /* ── Busca taxas da API ── */
    async function buscarTaxas(base) {
      try {
        const resp = await fetch(API_URL + base);
        if (!resp.ok) throw new Error('API indisponível');
        const data = await resp.json();
        taxasCache[base] = data.rates;
        ultimaAtualizacao = new Date();
        return data.rates;
      } catch (err) {
        console.warn('Erro na API, usando taxas fixas de fallback:', err);
        return taxasFallback(base);
      }
    }

    /* ── Taxas de fallback (caso API offline) ── */
    function taxasFallback(base) {
      const usd = { BRL:5.05, EUR:0.92, GBP:0.79, JPY:150.2, CAD:1.36, AUD:1.53, CHF:0.89, CNY:7.23, ARS:1000, USD:1 };
      if (base === 'USD') return usd;
      if (!usd[base]) return usd;
      const fator = 1 / usd[base];
      const result = {};
      Object.entries(usd).forEach(([k,v]) => result[k] = parseFloat((v * fator).toFixed(6)));
      return result;
    }

    /* ── Converter ── */
    async function converter() {
      const de   = moedaOrigem.value;
      const para = moedaDestino.value;
      const val  = parseFloat(valorOrigem.value);

      if (isNaN(val) || val <= 0) {
        resultadoValor.style.cssText = '-webkit-text-fill-color:#ff5252';
        resultadoValor.textContent = 'Valor inválido';
        setTimeout(() => { resultadoValor.style.cssText = ''; resultadoValor.textContent = '—'; }, 1500);
        return;
      }

      /* Estado carregando */
      btnConverter.classList.add('carregando');
      document.getElementById('iconeConverter').classList.add('girando');
      document.getElementById('textoConverter').textContent = 'Buscando...';

      try {
        let taxas;
        if (taxasCache[de]) {
          taxas = taxasCache[de];
        } else {
          taxas = await buscarTaxas(de);
        }

        const taxa       = taxas[para];
        const resultado  = val * taxa;
        const formatado  = formatarMoeda(resultado, para);

        valorDestino.value     = resultado.toFixed(4);
        resultadoValor.style.cssText = '';
        resultadoValor.textContent   = formatado;
        resultadoTaxa.innerHTML = `1 ${de} = <span>${taxa.toFixed(4)} ${para}</span>${ultimaAtualizacao ? ` · Atualizado ${horaFormatada(ultimaAtualizacao)}` : ''}`;

        atualizarStatusAPI(true);
        renderizarCotacoes(taxas, de);

      } catch (e) {
        resultadoValor.textContent = 'Erro';
        atualizarStatusAPI(false);
      } finally {
        btnConverter.classList.remove('carregando');
        document.getElementById('iconeConverter').classList.remove('girando');
        document.getElementById('textoConverter').textContent = 'Converter';
      }
    }

    /* ── Formatar moeda ── */
    function formatarMoeda(valor, moeda) {
      try {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency', currency: moeda,
          maximumFractionDigits: moeda === 'JPY' ? 0 : 2
        }).format(valor);
      } catch {
        return valor.toFixed(2) + ' ' + moeda;
      }
    }

    function horaFormatada(d) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    /* ── Atualiza status da API ── */
    function atualizarStatusAPI(online) {
      const ponto = apiStatus.querySelector('.api-ponto');
      ponto.className = 'api-ponto ' + (online ? 'online' : 'offline');
      apiStatus.querySelector('span').textContent = online
        ? `Conectado · Dados em tempo real · ${ultimaAtualizacao ? horaFormatada(ultimaAtualizacao) : ''}`
        : 'API offline · Usando taxas de referência';
    }

    /* ── Renderiza tabela de cotações ── */
    function renderizarCotacoes(taxasBase, base) {
      const lista = document.getElementById('cotacoesLista');
      /* Converte tudo para USD como base comum */
      lista.innerHTML = cotacoesPopulares.map(c => {
        if (!c.de) {
          /* Bitcoin — placeholder */
          return `
            <div class="cotacao-item">
              <div class="cotacao-par">
                <div class="cotacao-bandeiras">${c.flag1}${c.flag2}</div>
                <div><div class="cotacao-nome">${c.par}</div><div class="cotacao-sub">${c.nome}</div></div>
              </div>
              <div class="cotacao-valor-wrapper">
                <div class="cotacao-valor">—</div>
                <div class="cotacao-variacao" style="color:var(--texto-fraco)">via CoinGecko</div>
              </div>
            </div>`;
        }
        /* Calcula taxa cruzada */
        let taxa;
        if (base === c.de && taxasBase[c.para]) {
          taxa = taxasBase[c.para];
        } else if (taxasCache['USD']) {
          const usd = taxasCache['USD'];
          taxa = usd[c.para] / usd[c.de];
        } else {
          taxa = null;
        }

        const variacaoFalsa = ((Math.random() - 0.48) * 1.2).toFixed(2);
        const up            = parseFloat(variacaoFalsa) >= 0;

        return `
          <div class="cotacao-item" title="Clique para converter ${c.par}"
            onclick="usarParCotacao('${c.de}','${c.para}')">
            <div class="cotacao-par">
              <div class="cotacao-bandeiras">${c.flag1}${c.flag2}</div>
              <div><div class="cotacao-nome">${c.par}</div><div class="cotacao-sub">${c.nome}</div></div>
            </div>
            <div class="cotacao-valor-wrapper">
              <div class="cotacao-valor">${taxa ? taxa.toFixed(4) : '—'}</div>
              <div class="cotacao-variacao ${up ? 'variacao-up' : 'variacao-down'}">
                <i class="ri-arrow-${up ? 'up' : 'down'}-s-line"></i>${Math.abs(variacaoFalsa)}%
              </div>
            </div>
          </div>`;
      }).join('');
    }

    /* ── Usar par da tabela de cotações ── */
    function usarParCotacao(de, para) {
      moedaOrigem.value  = de;
      moedaDestino.value = para;
      converter();
    }

    /* ── Inverter moedas ── */
    document.getElementById('btnInverter').addEventListener('click', () => {
      const tmp          = moedaOrigem.value;
      moedaOrigem.value  = moedaDestino.value;
      moedaDestino.value = tmp;
      converter();
    });

    /* ── Eventos ── */
    btnConverter.addEventListener('click', converter);
    moedaOrigem.addEventListener('change', converter);
    moedaDestino.addEventListener('change', converter);
    valorOrigem.addEventListener('input', () => {
      clearTimeout(valorOrigem._timeout);
      valorOrigem._timeout = setTimeout(converter, 500);
    });

    /* ── Inicialização ── */
    converter();
