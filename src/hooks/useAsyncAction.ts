import { useState } from 'react';

export function useAsyncAction(onError: (error: unknown) => void, initialLoading = true) {
  const [loading, setLoading] = useState(initialLoading);
  const [refreshing, setRefreshing] = useState(false);

  async function run(fn: () => Promise<void>, isRefresh = false): Promise<void> {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      await fn();
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  return { loading, refreshing, run };
}
