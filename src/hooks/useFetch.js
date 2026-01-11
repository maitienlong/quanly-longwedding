// src/hooks/useFetch.js
import { useEffect, useState } from "react";

export function useFetch(apiCall, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiCall()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
}
