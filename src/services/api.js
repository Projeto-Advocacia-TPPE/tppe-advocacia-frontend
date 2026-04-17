const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }

  let errorMessage = "Nao foi possivel concluir a requisicao.";

  try {
    const payload = await response.json();
    errorMessage = payload.detail || errorMessage;
  } catch {
    errorMessage = `Erro HTTP ${response.status}`;
  }

  throw new Error(errorMessage);
}

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse(response);
}

export async function createLead(payload) {
  const response = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

