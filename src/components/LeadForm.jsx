export function LeadForm({
  formData,
  isSubmitting,
  kind,
  message,
  onChange,
  onSubmit,
}) {
  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <label>
        Nome
        <input
          required
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder="Nome do lead"
        />
      </label>

      <label>
        E-mail
        <input
          required
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="contato@email.com"
        />
      </label>

      <label>
        Telefone
        <input
          name="phone"
          type="text"
          value={formData.phone}
          onChange={onChange}
          placeholder="(61) 99999-9999"
        />
      </label>

      <label>
        Mensagem
        <textarea
          name="message"
          rows="4"
          value={formData.message}
          onChange={onChange}
          placeholder="Descreva rapidamente o interesse do lead"
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar lead"}
      </button>

      {message && <p className={`form-feedback is-${kind}`}>{message}</p>}
    </form>
  );
}
