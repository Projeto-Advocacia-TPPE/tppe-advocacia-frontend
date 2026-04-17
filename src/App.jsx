import { useEffect, useState } from "react";

import { ApiStatusCard } from "./components/ApiStatusCard";
import { LeadForm } from "./components/LeadForm";
import { createLead, getHealth } from "./services/api";

const architectureCards = [
  {
    title: "Frontend",
    description: "React + Vite com variáveis de ambiente para integração rápida.",
  },
  {
    title: "Backend",
    description: "FastAPI organizado em MVC com controllers, models e views.",
  },
  {
    title: "Banco",
    description: "Postgres no mesmo repositório do backend via Docker Compose.",
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function App() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [healthLoading, setHealthLoading] = useState(true);
  const [formData, setFormData] = useState(initialForm);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitKind, setSubmitKind] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await getHealth();
        setHealth(data);
      } catch (error) {
        setHealthError(error.message);
      } finally {
        setHealthLoading(false);
      }
    }

    loadHealth();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await createLead(formData);
      setSubmitKind("success");
      setSubmitMessage("Lead enviado com sucesso para o backend.");
      setFormData(initialForm);
    } catch (error) {
      setSubmitKind("error");
      setSubmitMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Projeto de advocacia</p>
          <h1>Base inicial para back, front e banco já conectados.</h1>
          <p className="hero-text">
            Este frontend foi preparado para conversar com a API FastAPI,
            validar o health check e enviar leads de teste desde o primeiro dia.
          </p>
          <div className="hero-meta">
            <span>React + Vite</span>
            <span>Integração por API</span>
            <span>Preparado para escalar</span>
          </div>
        </div>

        <ApiStatusCard
          loading={healthLoading}
          error={healthError}
          health={health}
        />
      </section>

      <section className="section-grid">
        {architectureCards.map((card) => (
          <article className="info-card" key={card.title}>
            <p className="card-label">Camada</p>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="workspace-panel">
        <div className="panel-copy">
          <p className="eyebrow">Teste de integração</p>
          <h2>Envio de lead</h2>
          <p>
            Use este formulário para confirmar que o frontend consegue falar com
            o endpoint `POST /api/v1/leads`.
          </p>
        </div>

        <LeadForm
          formData={formData}
          isSubmitting={isSubmitting}
          kind={submitKind}
          message={submitMessage}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}
