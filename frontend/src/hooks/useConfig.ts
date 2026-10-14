import { useState, useEffect } from 'react';
import type { AppConfig } from '../types';
import { fetchAppConfig, DEFAULT_GITHUB_URL } from '../services/api';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>({
    project_name: 'ProteinGuard',
    version: '0.1.0',
    github_url: DEFAULT_GITHUB_URL,
    features: {
      mutation_analysis: false,
      structure_visualization: false,
      gemma_explanation: false,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchAppConfig().then((data) => {
      if (isMounted) {
        setConfig(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return { config, loading };
}
