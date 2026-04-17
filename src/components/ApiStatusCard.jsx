const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export function ApiStatusCard({ loading, error, health }) {
  const statusText = loading
    ? "Consultando"
    : error
      ? "Indisponivel"
      : health?.status ?? "Desconhecido";

  return (
    <aside className="status-card">
      <div className="status-pill">{statusText}</div>
      <h2>Conexao com a API</h2>
      <p className="status-url">{apiUrl}</p>

      {loading && <p>Aguardando resposta do endpoint de health check.</p>}

      {error && (
        <p>
          Nao foi possivel consultar a API ainda. Verifique se o backend esta
          rodando em `localhost:8000`.
        </p>
      )}

      {health && !error && (
        <dl className="status-list">
          <div>
            <dt>Aplicacao</dt>
            <dd>{health.app_name}</dd>
          </div>
          <div>
            <dt>Versao</dt>
            <dd>{health.version}</dd>
          </div>
          <div>
            <dt>Banco</dt>
            <dd>{health.database}</dd>
          </div>
        </dl>
      )}
    </aside>
  );
}

