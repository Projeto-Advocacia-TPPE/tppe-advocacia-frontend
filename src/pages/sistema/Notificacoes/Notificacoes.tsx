import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
  type NotificationEventType,
} from '../../../services/notifications';
import styles from './Notificacoes.module.css';

// ── Toggle switch ──────────────────────────────────────────
function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`${styles.toggle} ${value ? styles.toggleOn : ''} ${disabled ? styles.toggleDisabled : ''}`}
      onClick={() => { if (!disabled) onChange(!value); }}
      aria-pressed={value}
      disabled={disabled}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ── Preference groups ──────────────────────────────────────
type GroupKey = 'movimentacao' | 'prazo' | 'lead' | 'tarefa' | 'api';

const PREF_GROUPS: Record<GroupKey, NotificationEventType[]> = {
  movimentacao: ['PROCESS_MOVEMENT_CREATED', 'PROCESS_STATUS_CHANGED'],
  prazo:        ['DEADLINE_APPROACHING', 'DEADLINE_EXPIRED'],
  lead:         ['LEAD_ASSIGNED'],
  tarefa:       ['TASK_ASSIGNED'],
  api:          ['EXTERNAL_API_FAILURE'],
};

const GROUP_LABELS: Record<GroupKey, string> = {
  movimentacao: 'Nova movimentação processual',
  prazo:        'Prazo próximo ao vencimento',
  lead:         'Novo lead recebido',
  tarefa:       'Nova tarefa atribuída',
  api:          'Falha na integração com API',
};

function groupIsOn(prefs: NotificationPreferences, group: GroupKey): boolean {
  return PREF_GROUPS[group].every(k => prefs[k]);
}

const DEFAULT_PREFS: NotificationPreferences = {
  PROCESS_MOVEMENT_CREATED: true,
  PROCESS_STATUS_CHANGED:   true,
  LEAD_ASSIGNED:            true,
  TASK_ASSIGNED:            true,
  DEADLINE_APPROACHING:     true,
  DEADLINE_EXPIRED:         true,
  EXTERNAL_API_FAILURE:     true,
};

// ── Main ───────────────────────────────────────────────────
export default function Notificacoes() {
  // Tipos de evento — backed by API
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState<GroupKey | null>(null);

  useEffect(() => {
    getNotificationPreferences()
      .then(setPrefs)
      .catch(() => { /* mantém defaults em caso de erro */ })
      .finally(() => setPrefsLoading(false));
  }, []);

  async function handleToggle(group: GroupKey, value: boolean) {
    const keys = PREF_GROUPS[group];
    setPrefs(prev => {
      const next = { ...prev };
      for (const k of keys) next[k] = value;
      return next;
    });
    setSavingGroup(group);
    try {
      const patch: Partial<NotificationPreferences> = {};
      for (const k of keys) patch[k] = value;
      const updated = await updateNotificationPreferences(patch);
      setPrefs(updated);
    } catch {
      setPrefs(prev => {
        const next = { ...prev };
        for (const k of keys) next[k] = !value;
        return next;
      });
    } finally {
      setSavingGroup(null);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Central de Notificações</h1>

      <div className={styles.configRow}>

        {/* Tipos de Evento */}
        <div className={styles.configCard}>
          <div className={styles.configCardHeader}>
            <span className={styles.configIcon}><CalendarDays size={18} /></span>
            <span className={styles.configTitle}>Tipos de Evento</span>
            {prefsLoading && <span className={styles.prefsHint}>Carregando...</span>}
          </div>
          {(Object.keys(PREF_GROUPS) as GroupKey[]).map(group => (
            <div key={group} className={styles.configItem}>
              <span>{GROUP_LABELS[group]}</span>
              <Toggle
                value={groupIsOn(prefs, group)}
                onChange={v => void handleToggle(group, v)}
                disabled={prefsLoading || savingGroup === group}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
