import useSWR from "swr";

async function fetchAPI(key) {
  const res = await fetch(key);
  const resBody = await res.json();

  return resBody;
}

export default function StatusPage() {
  return (
    <div>
      <h1>Teste</h1>
      <UpdatedAt />
    </div>
  );

  function UpdatedAt() {
    const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
      refreshInterval: 1000,
      dedupingInterval: 1000,
    });

    let UpdatedAtText,
      MaxConnectionsText,
      OpenConnectionsText = "Carregando...";

    if (!isLoading && data) {
      UpdatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
      MaxConnectionsText = data.dependencies.database.max_connections;
      OpenConnectionsText = data.dependencies.database.open_connections;
    }

    return (
      <div>
        <div>Atualizado em {UpdatedAtText}</div>
        <div>Limite de conexões: {MaxConnectionsText}</div>
        <div>Conexões abertas: {OpenConnectionsText}</div>
      </div>
    );
  }
}
