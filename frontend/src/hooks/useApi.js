import { useState, useEffect, useCallback } from "react";

export function useApi(fn, deps = [], options = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      const result = res.data?.data ?? res.data;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      onError?.(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    if (immediate) execute();
  }, [execute]); // eslint-disable-line

  return { data, loading, error, execute, setData };
}
