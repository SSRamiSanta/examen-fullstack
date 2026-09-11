import { useState } from 'react';
import { Pocket } from '@examen-fullstack/shared';
import { apiService } from '../services/api.service';

export function useDeposit() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deposit = async (pocketId: string, amount: number): Promise<Pocket> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apiService.depositFunds(pocketId, amount);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el abono';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    deposit,
    loading,
    error,
    clearError,
  };
}
