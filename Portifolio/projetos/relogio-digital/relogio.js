    'use strict';

    /* ════════════════════════════════════
       RELÓGIO PRINCIPAL
    ════════════════════════════════════ */
    let formato24h = true;

    const DIAS_SEMANA = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const MESES       = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    const elData       = document.getElementById('relogioData');
    const elAmpm       = document.getElementById('relogioAmpm');
    const elFuso       = document.getElementById('relogioFuso');
    const btnFormato   = document.getElementById('btnFormato');
    const elProgresso  = document.getElementById('progressoPreenchimento');
    const elPorcentagem= document.getElementById('progressoPorcentagem');

    const digitos = {
      hora1: document.getElementById('dHora1'),
      hora2: document.getElementById('dHora2'),
      min1:  document.getElementById('dMin1'),
      min2:  document.getElementById('dMin2'),
      seg1:  document.getElementById('dSeg1'),
      seg2:  document.getElementById('dSeg2'),
    };

    /* Atualiza um dígito e pisca ao mudar */
    function atualizarDigito(el, valor) {
      const novo = String(valor).padStart(2, '0');
      if (el.textContent !== novo[el === digitos.hora1 || el === digitos.min1 || el === digitos.seg1 ? 0 : 1]) {
        el.classList.add('piscando');
        setTimeout(() => el.classList.remove('piscando'), 400);
      }
      el.textContent = novo[el === digitos.hora1 || el === digitos.min1 || el === digitos.seg1 ? 0 : 1];
    }

    function atualizarPar(el1, el2, valor) {
      const str = String(valor).padStart(2, '0');
      if (el1.textContent !== str[0]) {
        el1.classList.add('piscando');
        el2.classList.add('piscando');
        setTimeout(() => { el1.classList.remove('piscando'); el2.classList.remove('piscando'); }, 400);
      }
      el1.textContent = str[0];
      el2.textContent = str[1];
    }

    function atualizarRelogio() {
      const agora   = new Date();
      let horas     = agora.getHours();
      const minutos = agora.getMinutes();
      const segundos= agora.getSeconds();
      let ampm      = '';

      if (!formato24h) {
        ampm  = horas >= 12 ? 'PM' : 'AM';
        horas = horas % 12 || 12;
        elAmpm.style.display = '';
        elAmpm.textContent   = ampm;
      } else {
        elAmpm.style.display = 'none';
      }

      atualizarPar(digitos.hora1, digitos.hora2, horas);
      atualizarPar(digitos.min1,  digitos.min2,  minutos);
      atualizarPar(digitos.seg1,  digitos.seg2,  segundos);

      /* Data */
      elData.textContent = `${DIAS_SEMANA[agora.getDay()]}, ${agora.getDate()} de ${MESES[agora.getMonth()]} de ${agora.getFullYear()}`;

      /* Fuso horário */
      const offset = -agora.getTimezoneOffset() / 60;
      elFuso.textContent = `UTC${offset >= 0 ? '+' : ''}${offset}`;

      /* Progresso do dia */
      const totalSegDia = 86400;
      const segPassados = horas * 3600 + minutos * 60 + segundos;
      const pct         = ((segPassados / totalSegDia) * 100).toFixed(1);
      elProgresso.style.width    = pct + '%';
      elPorcentagem.textContent  = pct + '%';
    }

    btnFormato.addEventListener('click', () => {
      formato24h = !formato24h;
      btnFormato.textContent = formato24h ? '24h' : '12h';
      btnFormato.classList.toggle('ativo', !formato24h);
      atualizarRelogio();
    });

    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();

    /* ════════════════════════════════════
       CRONÔMETRO
    ════════════════════════════════════ */
    let cronoInterval = null;
    let cronoAtivo    = false;
    let cronoMs       = 0;
    let voltaMs       = 0;
    let numeroVolta   = 1;

    const elCronoHH = document.getElementById('cronoHH');
    const elCronoMM = document.getElementById('cronoMM');
    const elCronoSS = document.getElementById('cronoSS');
    const elCronoMS = document.getElementById('cronoMS');
    const voltasLista = document.getElementById('voltasLista');

    function msParaStr(ms) {
      const h  = Math.floor(ms / 3600000);
      const m  = Math.floor((ms % 3600000) / 60000);
      const s  = Math.floor((ms % 60000) / 1000);
      const cs = Math.floor((ms % 1000) / 10);
      return {
        hh: String(h).padStart(2,'0'),
        mm: String(m).padStart(2,'0'),
        ss: String(s).padStart(2,'0'),
        ms: String(cs).padStart(2,'0'),
      };
    }

    function atualizarDisplayCrono() {
      const t = msParaStr(cronoMs);
      elCronoHH.textContent = t.hh;
      elCronoMM.textContent = t.mm;
      elCronoSS.textContent = t.ss;
      elCronoMS.textContent = t.ms;
    }

    function iniciarCrono() {
      if (cronoAtivo) return;
      cronoAtivo = true;
      let ultimo = Date.now();

      cronoInterval = setInterval(() => {
        const agora = Date.now();
        cronoMs  += agora - ultimo;
        voltaMs  += agora - ultimo;
        ultimo    = agora;
        atualizarDisplayCrono();
      }, 10);

      document.getElementById('btnCronoIniciar').style.display = 'none';
      document.getElementById('btnCronoPausar').style.display  = '';
      document.getElementById('btnCronoVolta').style.display   = '';
    }

    function pausarCrono() {
      clearInterval(cronoInterval);
      cronoAtivo = false;
      document.getElementById('btnCronoIniciar').style.display = '';
      document.getElementById('btnCronoIniciar').innerHTML = '<i class="ri-play-line"></i> Continuar';
      document.getElementById('btnCronoPausar').style.display  = 'none';
    }

    function zerarCrono() {
      clearInterval(cronoInterval);
      cronoAtivo = false; cronoMs = 0; voltaMs = 0; numeroVolta = 1;
      atualizarDisplayCrono();
      voltasLista.innerHTML = '';
      document.getElementById('btnCronoIniciar').style.display = '';
      document.getElementById('btnCronoIniciar').innerHTML = '<i class="ri-play-line"></i> Iniciar';
      document.getElementById('btnCronoPausar').style.display  = 'none';
      document.getElementById('btnCronoVolta').style.display   = 'none';
    }

    function registrarVolta() {
      const tVolta  = msParaStr(voltaMs);
      const tTotal  = msParaStr(cronoMs);
      const item    = document.createElement('div');
      item.className = 'volta-item';
      item.innerHTML = `
        <span class="volta-num">Volta ${numeroVolta}</span>
        <span class="volta-tempo">${tVolta.mm}:${tVolta.ss}.${tVolta.ms}</span>
        <span class="volta-delta">Total ${tTotal.hh}:${tTotal.mm}:${tTotal.ss}</span>`;
      voltasLista.prepend(item);
      voltaMs = 0;
      numeroVolta++;
    }

    document.getElementById('btnCronoIniciar').addEventListener('click', iniciarCrono);
    document.getElementById('btnCronoPausar').addEventListener('click', pausarCrono);
    document.getElementById('btnCronoZerar').addEventListener('click', zerarCrono);
    document.getElementById('btnCronoVolta').addEventListener('click', registrarVolta);

    /* ════════════════════════════════════
       TIMER
    ════════════════════════════════════ */
    let timerInterval    = null;
    let timerAtivo       = false;
    let timerTotalMs     = 0;
    let timerRestanteMs  = 0;
    const CIRCUM         = 314; /* 2π × r(50) */

    const timerCirculo      = document.getElementById('timerCirculo');
    const timerLabelSVG     = document.getElementById('timerLabelSVG');
    const timerProgressoW   = document.getElementById('timerProgressoWrapper');
    const timerInputsW      = document.getElementById('timerInputsWrapper');
    const btnTimerIniciar   = document.getElementById('btnTimerIniciar');
    const btnTimerPausar    = document.getElementById('btnTimerPausar');

    function msParaMMSS(ms) {
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    function atualizarCirculo() {
      const pct    = timerTotalMs > 0 ? timerRestanteMs / timerTotalMs : 0;
      const offset = CIRCUM - pct * CIRCUM;
      timerCirculo.style.strokeDashoffset = offset;
      timerLabelSVG.textContent = msParaMMSS(timerRestanteMs);

      /* Urgente: últimos 10 segundos */
      timerLabelSVG.style.color = timerRestanteMs <= 10000 ? 'var(--vermelho)' : 'var(--texto)';
      timerCirculo.style.stroke = timerRestanteMs <= 10000 ? '#ff5252' : 'url(#grad-timer)';
    }

    function iniciarTimer() {
      if (timerAtivo) return;
      if (!timerRestanteMs) {
        const h = parseInt(document.getElementById('timerHoras').value)   || 0;
        const m = parseInt(document.getElementById('timerMinutos').value) || 0;
        const s = parseInt(document.getElementById('timerSegundos').value)|| 0;
        timerTotalMs    = (h * 3600 + m * 60 + s) * 1000;
        timerRestanteMs = timerTotalMs;
        if (!timerTotalMs) return;
      }

      timerAtivo = true;
      timerInputsW.style.display     = 'none';
      timerProgressoW.style.display  = 'flex';
      btnTimerIniciar.style.display  = 'none';
      btnTimerPausar.style.display   = '';

      let ultimo = Date.now();
      timerInterval = setInterval(() => {
        const agora  = Date.now();
        timerRestanteMs -= (agora - ultimo);
        ultimo = agora;

        if (timerRestanteMs <= 0) {
          timerRestanteMs = 0;
          atualizarCirculo();
          clearInterval(timerInterval);
          timerAtivo = false;
          alertarTimer();
          btnTimerPausar.style.display = 'none';
          btnTimerIniciar.style.display = '';
          btnTimerIniciar.innerHTML = '<i class="ri-play-line"></i> Reiniciar';
        } else {
          atualizarCirculo();
        }
      }, 200);
    }

    function pausarTimer() {
      clearInterval(timerInterval);
      timerAtivo = false;
      btnTimerPausar.style.display  = 'none';
      btnTimerIniciar.style.display = '';
      btnTimerIniciar.innerHTML     = '<i class="ri-play-line"></i> Continuar';
    }

    function zerarTimer() {
      clearInterval(timerInterval);
      timerAtivo = false; timerTotalMs = 0; timerRestanteMs = 0;
      timerInputsW.style.display    = '';
      timerProgressoW.style.display = 'none';
      btnTimerIniciar.style.display = '';
      btnTimerIniciar.innerHTML     = '<i class="ri-play-line"></i> Iniciar Timer';
      btnTimerPausar.style.display  = 'none';
      timerCirculo.style.strokeDashoffset = 0;
    }

    /* Alerta sonoro com Web Audio API */
    function alertarTimer() {
      try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const bips = [0, 0.3, 0.6, 0.9];
        bips.forEach(delay => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.25);
        });
      } catch(e) { console.log('Web Audio API não disponível'); }
    }

    btnTimerIniciar.addEventListener('click', iniciarTimer);
    btnTimerPausar.addEventListener('click', pausarTimer);
    document.getElementById('btnTimerZerar').addEventListener('click', zerarTimer);
