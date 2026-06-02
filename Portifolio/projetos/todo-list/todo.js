    'use strict';

    const CHAVE_LS = 'bm-todo-tarefas';
    let tarefas    = JSON.parse(localStorage.getItem(CHAVE_LS) || '[]');
    let filtroAtual = 'todas';

    const inputTarefa      = document.getElementById('inputTarefa');
    const inputData        = document.getElementById('inputData');
    const selectPrioridade = document.getElementById('selectPrioridade');
    const listaTarefas     = document.getElementById('listaTarefas');

    /* ── Salvar no localStorage ── */
    function salvar() {
      localStorage.setItem(CHAVE_LS, JSON.stringify(tarefas));
    }

    /* ── Adicionar tarefa ── */
    function adicionarTarefa() {
      const texto = inputTarefa.value.trim();
      if (!texto) { inputTarefa.focus(); return; }

      tarefas.unshift({
        id:         Date.now(),
        texto,
        prioridade: selectPrioridade.value,
        data:       inputData.value,
        concluida:  false,
        criadaEm:   new Date().toISOString(),
      });

      inputTarefa.value = '';
      inputData.value   = '';
      salvar();
      renderizar();
      inputTarefa.focus();
    }

    /* ── Alternar concluída ── */
    function alternarConcluida(id) {
      const t = tarefas.find(t => t.id === id);
      if (t) { t.concluida = !t.concluida; salvar(); renderizar(); }
    }

    /* ── Deletar ── */
    function deletarTarefa(id) {
      tarefas = tarefas.filter(t => t.id !== id);
      salvar();
      renderizar();
    }

    /* ── Formata data ── */
    function formatarData(iso) {
      if (!iso) return '';
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    }

    function estaVencida(iso) {
      if (!iso) return false;
      return new Date(iso + 'T23:59:59') < new Date();
    }

    /* ── Renderizar lista ── */
    function renderizar() {
      /* Filtra */
      let filtradas = tarefas.filter(t => {
        if (filtroAtual === 'pendentes')  return !t.concluida;
        if (filtroAtual === 'concluidas') return  t.concluida;
        if (['alta','media','baixa'].includes(filtroAtual)) return t.prioridade === filtroAtual;
        return true;
      });

      /* Stats */
      document.getElementById('statTotal').textContent     = tarefas.length;
      document.getElementById('statPendentes').textContent = tarefas.filter(t => !t.concluida).length;
      document.getElementById('statConcluidas').textContent = tarefas.filter(t => t.concluida).length;

      if (!filtradas.length) {
        listaTarefas.innerHTML = `
          <div class="lista-vazia">
            <i class="ri-checkbox-circle-line"></i>
            ${filtroAtual === 'todas' ? 'Nenhuma tarefa ainda. Adicione uma acima!' : 'Nenhuma tarefa nesta categoria.'}
          </div>`;
        return;
      }

      listaTarefas.innerHTML = filtradas.map(t => `
        <div class="tarefa-item ${t.concluida ? 'concluida' : ''}" data-id="${t.id}">
          <button class="tarefa-check ${t.concluida ? 'marcado' : ''}"
            onclick="alternarConcluida(${t.id})" aria-label="Marcar como ${t.concluida ? 'pendente' : 'concluída'}">
            ${t.concluida ? '<i class="ri-check-line"></i>' : ''}
          </button>
          <div class="tarefa-corpo">
            <div class="tarefa-texto">${escaparHTML(t.texto)}</div>
            <div class="tarefa-meta">
              <span class="prioridade prioridade-${t.prioridade}">
                ${t.prioridade.charAt(0).toUpperCase() + t.prioridade.slice(1)}
              </span>
              ${t.data ? `
                <span class="tarefa-data ${!t.concluida && estaVencida(t.data) ? 'vencida' : ''}">
                  <i class="ri-calendar-line"></i>
                  ${formatarData(t.data)}
                  ${!t.concluida && estaVencida(t.data) ? '· Vencida' : ''}
                </span>` : ''}
            </div>
          </div>
          <div class="tarefa-acoes">
            <button class="tarefa-btn tarefa-btn-del"
              onclick="deletarTarefa(${t.id})" aria-label="Excluir tarefa">
              <i class="ri-delete-bin-6-line"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    function escaparHTML(str) {
      const d = document.createElement('div');
      d.appendChild(document.createTextNode(str));
      return d.innerHTML;
    }

    /* ── Filtros ── */
    document.querySelectorAll('.filtro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        filtroAtual = btn.dataset.filtro;
        renderizar();
      });
    });

    /* ── Eventos ── */
    document.getElementById('btnAdicionar').addEventListener('click', adicionarTarefa);
    inputTarefa.addEventListener('keydown', e => { if (e.key === 'Enter') adicionarTarefa(); });

    /* ── Init ── */
    renderizar();
