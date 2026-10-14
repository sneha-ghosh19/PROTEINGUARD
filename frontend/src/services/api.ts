import type { AppConfig, HealthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const DEFAULT_GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/sneha-ghosh19/PROTEINGUARD';

export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const response = await fetch(`${API_BASE_URL}/config`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend API config unavailable, falling back to local defaults:', error);
    return {
      project_name: 'ProteinGuard',
      version: '0.1.0',
      github_url: DEFAULT_GITHUB_URL,
      features: {
        mutation_analysis: false,
        structure_visualization: false,
        gemma_explanation: false,
      },
    };
  }
}

export async function fetchHealthStatus(): Promise<HealthStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
