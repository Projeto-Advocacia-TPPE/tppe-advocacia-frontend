import { useState } from 'react';

export type Feedback = { message: string; kind: 'success' | 'error' };

export function useFeedback(duration = 4000) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function showFeedback(message: string, kind: 'success' | 'error' = 'success') {
    setFeedback({ message, kind });
    window.setTimeout(() => setFeedback(null), duration);
  }

  return { feedback, showFeedback };
}
