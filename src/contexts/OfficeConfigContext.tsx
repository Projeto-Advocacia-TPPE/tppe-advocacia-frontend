import { createContext, useContext, useEffect, useState } from 'react';
import { getOfficeConfig } from '../services/officeConfigService';
import type { OfficeConfigAPI } from '../services/officeConfigService';

interface OfficeConfigCtx {
  config: OfficeConfigAPI | null;
  loading: boolean;
}

const Ctx = createContext<OfficeConfigCtx>({ config: null, loading: true });

export function OfficeConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<OfficeConfigAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOfficeConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return <Ctx.Provider value={{ config, loading }}>{children}</Ctx.Provider>;
}

export function useOfficeConfig() {
  return useContext(Ctx);
}
