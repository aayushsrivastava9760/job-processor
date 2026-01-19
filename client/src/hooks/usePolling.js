import { useEffect, useState } from "react";

export default function usePolling(fetchFn, intervalMs = 3000) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function poll() {
      try {
        const result = await fetchFn();
        if (isMounted) setData(result);
      } catch (e) {
        console.error("Polling error", e);
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [fetchFn, intervalMs]);

  return data;
}
