import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react';
import Modal from '../../components/sistema/Modal/Modal';
import { ApiError } from '../../services/api';
import {
  Client,
  ClientCreate,
  ClientListItem,
  createClient,
  listClients,
} from '../../services/clients';
import styles from './Clientes.module.css';

type ClientKind = 'person' | 'company';

type ClientForm = {
  kind: ClientKind;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
};

const EMPTY_FORM: ClientForm = {
  kind: 'person',
  name: '',
  document: '',
  email: '',
  phone: '',
  address: '',
};

function digits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatDocument(cpf: string | null, cnpj: string | null): string {
  if (cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (cnpj) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return 'Documento não informado';
}

function formatInputDocument(value: string, kind: ClientKind): string {
  const normalized = digits(value).slice(0, kind === 'person' ? 11 : 14);
  if (kind === 'person') {
    return normalized
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return normalized
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Já existe um cliente com este CPF ou CNPJ.';
    if (error.status === 422) return 'Revise os campos informados antes de continuar.';
    return error.message;
  }
  return 'Não foi possível concluir a operação.';
}

export default function Clientes() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  const stats = useMemo(() => ({
    people: clients.filter(client => client.cpf).length,
    companies: clients.filter(client => client.cnpj).length,
    withEmail: clients.filter(client => client.email).length,
  }), [clients]);

  async function loadClients(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await listClients({ page, limit: 12, search });
      setClients(response.data);
      setTotal(response.meta.total);
      setPages(response.meta.pages || 1);
    } catch (error) {
      showFeedback(errorMessage(error), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, [page, search]);

  function showFeedback(message: string, kind: 'success' | 'error' = 'success') {
    setFeedback({ message, kind });
    window.setTimeout(() => setFeedback(null), 4500);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowCreate(true);
  }

  function updateForm<K extends keyof ClientForm>(field: K, value: ClientForm[K]) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function changeKind(kind: ClientKind) {
    setForm(current => ({ ...current, kind, document: '' }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const document = digits(form.document);
    const expectedLength = form.kind === 'person' ? 11 : 14;
    if (document.length !== expectedLength) {
      setFormError(`Informe um ${form.kind === 'person' ? 'CPF' : 'CNPJ'} completo.`);
      return;
    }

    const payload: ClientCreate = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      cpf: form.kind === 'person' ? document : null,
      cnpj: form.kind === 'company' ? document : null,
      address: form.address.trim() || null,
    };

    setSubmitting(true);
    try {
      const created: Client = await createClient(payload);
      const response = await listClients({ page: 1, limit: 12 });
      setClients(response.data);
      setTotal(response.meta.total);
      setPages(response.meta.pages || 1);
      setShowCreate(false);
      setSearch('');
      setSearchInput('');
      setPage(1);
      showFeedback(`${created.name} foi cadastrado com sucesso.`);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {feedback && (
        <div className={`${styles.toast} ${feedback.kind === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {feedback.message}
        </div>
      )}

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Carteira jurídica</p>
          <h1>Clientes</h1>
          <p className={styles.subtitle}>Consulte e mantenha os dados dos clientes do escritório.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} onClick={() => void loadClients(true)} disabled={refreshing}>
            <RefreshCw size={17} className={refreshing ? styles.spinning : ''} />
            Atualizar
          </button>
          <button className={styles.primaryButton} onClick={openCreate}>
            <Plus size={17} />
            Novo cliente
          </button>
        </div>
      </header>

      <section className={styles.metrics}>
        <Metric icon={<UsersRound size={20} />} label="Clientes encontrados" value={total} tone="navy" />
        <Metric icon={<UserRound size={20} />} label="Pessoas nesta página" value={stats.people} tone="blue" />
        <Metric icon={<Building2 size={20} />} label="Empresas nesta página" value={stats.companies} tone="amber" />
        <Metric icon={<Mail size={20} />} label="Com e-mail nesta página" value={stats.withEmail} tone="green" />
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <Search size={17} />
            <input
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="Buscar por nome, CPF ou CNPJ"
              aria-label="Buscar clientes"
            />
            <button type="submit">Buscar</button>
          </form>
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            >
              Limpar busca
            </button>
          )}
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className={styles.empty}>Carregando clientes...</td></tr>}
              {!loading && clients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className={styles.client}>
                      <span className={styles.avatar}>{initials(client.name)}</span>
                      <div>
                        <strong>{client.name}</strong>
                        <span>{client.email ?? 'E-mail não informado'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.kindBadge} ${client.cpf ? styles.personBadge : styles.companyBadge}`}>
                      {client.cpf ? 'Pessoa física' : 'Pessoa jurídica'}
                    </span>
                  </td>
                  <td>{formatDocument(client.cpf, client.cnpj)}</td>
                  <td>{client.phone ?? 'Não informado'}</td>
                </tr>
              ))}
              {!loading && clients.length === 0 && (
                <tr><td colSpan={4} className={styles.empty}>Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.footer}>
          <span>Mostrando <strong>{clients.length}</strong> de <strong>{total}</strong> cliente(s)</span>
          <div className={styles.pagination}>
            <button aria-label="Página anterior" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            <span>Página {page} de {pages}</span>
            <button aria-label="Próxima página" onClick={() => setPage(current => Math.min(pages, current + 1))} disabled={page === pages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>

      {showCreate && (
        <Modal title="Cadastrar cliente" onClose={() => setShowCreate(false)} width={620}>
          <form className={styles.createForm} onSubmit={handleCreate}>
            <div className={styles.kindSelector}>
              <button
                type="button"
                className={form.kind === 'person' ? styles.activeKind : ''}
                onClick={() => changeKind('person')}
              >
                <UserRound size={17} />
                Pessoa física
              </button>
              <button
                type="button"
                className={form.kind === 'company' ? styles.activeKind : ''}
                onClick={() => changeKind('company')}
              >
                <Building2 size={17} />
                Pessoa jurídica
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.fullField}>
                <span>{form.kind === 'person' ? 'Nome completo' : 'Razão social'} *</span>
                <input required minLength={2} maxLength={120} value={form.name} onChange={event => updateForm('name', event.target.value)} />
              </label>
              <label>
                <span>{form.kind === 'person' ? 'CPF' : 'CNPJ'} *</span>
                <input
                  required
                  inputMode="numeric"
                  value={form.document}
                  placeholder={form.kind === 'person' ? '000.000.000-00' : '00.000.000/0000-00'}
                  onChange={event => updateForm('document', formatInputDocument(event.target.value, form.kind))}
                />
              </label>
              <label>
                <span>Telefone</span>
                <input maxLength={20} value={form.phone} onChange={event => updateForm('phone', event.target.value)} />
              </label>
              <label className={styles.fullField}>
                <span>E-mail</span>
                <input type="email" value={form.email} onChange={event => updateForm('email', event.target.value)} />
              </label>
              <label className={styles.fullField}>
                <span>Endereço</span>
                <textarea rows={3} value={form.address} onChange={event => updateForm('address', event.target.value)} />
              </label>
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setShowCreate(false)}>Cancelar</button>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? 'Cadastrando...' : 'Cadastrar cliente'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Metric({ icon, label, value, tone }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'navy' | 'blue' | 'amber' | 'green';
}) {
  return (
    <div className={styles.metric}>
      <span className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
