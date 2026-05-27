import { useEffect, useState } from 'react';

const VIEWS = {
  DASHBOARD: 'dashboard',
  AGENDA: 'agenda',
  FATURAMENTO: 'faturamento',
  ANIMAIS: 'animais',
  INADIMPLENTES: 'inadimplentes',
  NOVA_CONSULTA: 'nova_consulta',
  NOVO_PAGAMENTO: 'novo_pagamento'
};

const endpoints = {
  agenda: '/api/agenda-hoje',
  faturamento: '/api/faturamento-mensal',
  animais: '/api/animais-detalhados',
  inadimplentes: '/api/inadimplentes',
  financeiro: '/api/financeiro',
  fluxo: '/api/fluxo-caixa',
  especies: '/api/especies',
  veterinarios: '/api/veterinarios',
  animaisOp: '/api/animais',
  consultas: '/api/consultas',
  initDb: '/api/init-db',
  seedConsulta: '/api/seed/consulta',
  seedPagamento: '/api/seed/pagamento'
};

function Table({ rows }) {
  if (!rows || rows.length === 0) {
    return <p>Nenhum resultado encontrado.</p>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header.replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{row[header] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('Dashboard Financeiro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [financeData, setFinanceData] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [options, setOptions] = useState({ animais: [], veterinarios: [], consultas: [] });
  const [newConsulta, setNewConsulta] = useState({
    animal_id: '',
    veterinario_id: '',
    data_hora: '',
    diagnostico: '',
    valor: '',
    status: 'agendada'
  });
  const [newPagamento, setNewPagamento] = useState({
    consulta_id: '',
    valor_pago: '',
    forma_pagamento: 'pix',
    data_pagamento: '',
    status: 'pago'
  });

  useEffect(() => {
    loadOptions();
    loadFinance();
    loadCashFlow();
  }, []);

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição.');
    }
    return data;
  };

  const loadOptions = async () => {
    try {
      const [animais, veterinarios, consultas] = await Promise.all([
        fetchJson(endpoints.animaisOp),
        fetchJson(endpoints.veterinarios),
        fetchJson(endpoints.consultas)
      ]);
      setOptions({ animais, veterinarios, consultas });
    } catch (err) {
      console.error(err);
    }
  };

  const loadFinance = async () => {
    try {
      const data = await fetchJson(endpoints.financeiro);
      setFinanceData(data);
      setTitle('Dashboard Financeiro');
      setView(VIEWS.DASHBOARD);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadCashFlow = async () => {
    try {
      const data = await fetchJson(endpoints.fluxo);
      setCashFlow(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectView = async (nextView) => {
    setView(nextView);
    setError('');
    setMessage('');
    setRows([]);
    if (nextView === VIEWS.DASHBOARD) {
      await loadFinance();
      await loadCashFlow();
      return;
    }

    if (nextView === VIEWS.AGENDA) {
      fetchReport('agenda', 'Agenda de Hoje');
    } else if (nextView === VIEWS.ANIMAIS) {
      fetchReport('animais', 'Animais Detalhados');
    } else if (nextView === VIEWS.INADIMPLENTES) {
      fetchReport('inadimplentes', 'Inadimplentes');
    } else if (nextView === VIEWS.FATURAMENTO) {
      fetchReport('faturamento', 'Faturamento Mensal');
    } else if (nextView === VIEWS.NOVA_CONSULTA) {
      setTitle('Nova Consulta');
    } else if (nextView === VIEWS.NOVO_PAGAMENTO) {
      setTitle('Novo Pagamento');
    }
  };

  const fetchReport = async (type, titleLabel) => {
    setLoading(true);
    setError('');
    setRows([]);
    setTitle(titleLabel);

    try {
      let url = endpoints[type];
      if (type === 'faturamento') {
        const params = new URLSearchParams();
        if (ano) params.append('ano', ano);
        if (mes) params.append('mes', mes);
        if ([...params].length) {
          url += `?${params.toString()}`;
        }
      }
      const data = await fetchJson(url);
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await fetchJson(endpoints.initDb, { method: 'POST' });
      setMessage('Banco inicializado com sucesso.');
      await loadOptions();
      await loadFinance();
      await loadCashFlow();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitConsulta = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await fetchJson(endpoints.seedConsulta, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal_id: Number(newConsulta.animal_id),
          veterinario_id: Number(newConsulta.veterinario_id),
          data_hora: newConsulta.data_hora,
          diagnostico: newConsulta.diagnostico,
          valor: Number(newConsulta.valor),
          status: newConsulta.status
        })
      });
      setMessage('Consulta adicionada com sucesso.');
      setNewConsulta({ animal_id: '', veterinario_id: '', data_hora: '', diagnostico: '', valor: '', status: 'agendada' });
      await loadOptions();
      await loadFinance();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitPagamento = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await fetchJson(endpoints.seedPagamento, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consulta_id: Number(newPagamento.consulta_id),
          valor_pago: Number(newPagamento.valor_pago),
          forma_pagamento: newPagamento.forma_pagamento,
          data_pagamento: newPagamento.data_pagamento,
          status: newPagamento.status
        })
      });
      setMessage('Pagamento registrado com sucesso.');
      setNewPagamento({ consulta_id: '', valor_pago: '', forma_pagamento: 'pix', data_pagamento: '', status: 'pago' });
      await loadFinance();
      await loadCashFlow();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Sistema Financeiro PET_VIDA</h1>
        <p>Controle financeiro de consultas, pagamentos e fluxo de caixa.</p>
      </header>

      <nav className="nav-grid">
        <button onClick={() => selectView(VIEWS.DASHBOARD)}>Dashboard</button>
        <button onClick={() => selectView(VIEWS.AGENDA)}>Agenda</button>
        <button onClick={() => selectView(VIEWS.FATURAMENTO)}>Faturamento</button>
        <button onClick={() => selectView(VIEWS.ANIMAIS)}>Animais</button>
        <button onClick={() => selectView(VIEWS.INADIMPLENTES)}>Inadimplentes</button>
        <button onClick={() => selectView(VIEWS.NOVA_CONSULTA)}>Nova Consulta</button>
        <button onClick={() => selectView(VIEWS.NOVO_PAGAMENTO)}>Novo Pagamento</button>
        <button className="accent" onClick={initializeDatabase}>Inicializar DB</button>
      </nav>

      {view === VIEWS.FATURAMENTO && (
        <section className="filters">
          <div>
            <label>Ano</label>
            <input type="number" placeholder="2026" value={ano} onChange={(event) => setAno(event.target.value)} />
          </div>
          <div>
            <label>Mês</label>
            <input type="number" placeholder="1-12" min="1" max="12" value={mes} onChange={(event) => setMes(event.target.value)} />
          </div>
          <button onClick={() => fetchReport('faturamento', 'Faturamento Mensal')}>Filtrar</button>
        </section>
      )}

      {message && <div className="info-banner success">{message}</div>}
      {error && <div className="info-banner error">{error}</div>}

      <main>
        <h2>{title}</h2>
        {loading && <p>Carregando...</p>}

        {view === VIEWS.DASHBOARD && (
          <>
            <div className="metric-grid">
              <MetricCard label="Recebido" value={`R$ ${financeData?.total_recebido?.toFixed(2) ?? '0.00'}`} />
              <MetricCard label="Pendente" value={`R$ ${financeData?.total_pendente?.toFixed(2) ?? '0.00'}`} />
              <MetricCard label="Cancelado" value={`R$ ${financeData?.total_cancelado?.toFixed(2) ?? '0.00'}`} />
              <MetricCard label="Pagamentos" value={financeData?.total_pagamentos ?? 0} />
              <MetricCard label="Consultas" value={financeData?.total_consultas ?? 0} />
              <MetricCard label="Consultas concluídas" value={financeData?.consultas_concluidas ?? 0} />
            </div>
            <section className="cashflow-section">
              <h3>Últimas transações</h3>
              <Table rows={cashFlow} />
            </section>
          </>
        )}

        {(view === VIEWS.AGENDA || view === VIEWS.FATURAMENTO || view === VIEWS.ANIMAIS || view === VIEWS.INADIMPLENTES) && (
          <Table rows={rows} />
        )}

        {view === VIEWS.NOVA_CONSULTA && (
          <form className="form-grid" onSubmit={submitConsulta}>
            <div>
              <label>Animal</label>
              <select value={newConsulta.animal_id} onChange={(event) => setNewConsulta({ ...newConsulta, animal_id: event.target.value })}>
                <option value="">Selecione</option>
                {options.animais.map((animal) => (
                  <option key={animal.id} value={animal.id}>{animal.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Veterinário</label>
              <select value={newConsulta.veterinario_id} onChange={(event) => setNewConsulta({ ...newConsulta, veterinario_id: event.target.value })}>
                <option value="">Selecione</option>
                {options.veterinarios.map((vet) => (
                  <option key={vet.id} value={vet.id}>{vet.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Data e hora</label>
              <input type="datetime-local" value={newConsulta.data_hora} onChange={(event) => setNewConsulta({ ...newConsulta, data_hora: event.target.value })} />
            </div>
            <div>
              <label>Valor</label>
              <input type="number" step="0.01" value={newConsulta.valor} onChange={(event) => setNewConsulta({ ...newConsulta, valor: event.target.value })} />
            </div>
            <div>
              <label>Status</label>
              <select value={newConsulta.status} onChange={(event) => setNewConsulta({ ...newConsulta, status: event.target.value })}>
                <option value="agendada">Agendada</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="full-width">
              <label>Diagnóstico / observações</label>
              <textarea value={newConsulta.diagnostico} onChange={(event) => setNewConsulta({ ...newConsulta, diagnostico: event.target.value })} rows="4" />
            </div>
            <div className="full-width actions-row">
              <button type="submit">Salvar Consulta</button>
            </div>
          </form>
        )}

        {view === VIEWS.NOVO_PAGAMENTO && (
          <form className="form-grid" onSubmit={submitPagamento}>
            <div>
              <label>Consulta</label>
              <select value={newPagamento.consulta_id} onChange={(event) => setNewPagamento({ ...newPagamento, consulta_id: event.target.value })}>
                <option value="">Selecione</option>
                {options.consultas.map((consulta) => (
                  <option key={consulta.id} value={consulta.id}>#{consulta.id} - {consulta.data_hora}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Valor pago</label>
              <input type="number" step="0.01" value={newPagamento.valor_pago} onChange={(event) => setNewPagamento({ ...newPagamento, valor_pago: event.target.value })} />
            </div>
            <div>
              <label>Forma de pagamento</label>
              <select value={newPagamento.forma_pagamento} onChange={(event) => setNewPagamento({ ...newPagamento, forma_pagamento: event.target.value })}>
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>
            <div>
              <label>Data de pagamento</label>
              <input type="date" value={newPagamento.data_pagamento} onChange={(event) => setNewPagamento({ ...newPagamento, data_pagamento: event.target.value })} />
            </div>
            <div>
              <label>Status</label>
              <select value={newPagamento.status} onChange={(event) => setNewPagamento({ ...newPagamento, status: event.target.value })}>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="full-width actions-row">
              <button type="submit">Registrar Pagamento</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default App;
