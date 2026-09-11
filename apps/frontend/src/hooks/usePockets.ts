import { useState, useEffect, useCallback } from 'react';
import { Pocket, CreatePocketDTO, PocketUpdatedEvent } from '@examen-fullstack/shared';
import { apiService } from '../services/api.service';
import { websocketService } from '../services/websocket.service';

export function usePockets() {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [celebratedPocket, setCelebratedPocket] = useState<Pocket | null>(null);

  const fetchPockets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPockets();
      setPockets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los bolsillos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPockets();

    // Suscripción reactiva en tiempo real al WebSocket
    const unsubscribe = websocketService.subscribe((event: PocketUpdatedEvent) => {
      setPockets((currentPockets) => {
        const index = currentPockets.findIndex((p) => p.id === event.pocketId);
        if (index === -1) return currentPockets;

        const updatedPocket: Pocket = {
          ...currentPockets[index],
          targetAmount: event.targetAmount,
          currentAmount: event.currentAmount,
          progress: event.progress,
          isCompleted: event.isCompleted,
        };

        if (event.goalAchieved) {
          setCelebratedPocket(updatedPocket);
        }

        const newPockets = [...currentPockets];
        newPockets[index] = updatedPocket;
        return newPockets;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [fetchPockets]);

  const createPocket = async (dto: CreatePocketDTO): Promise<Pocket> => {
    const created = await apiService.createPocket(dto);
    setPockets((prev) => [...prev, created]);
    return created;
  };

  const dismissCelebration = () => {
    setCelebratedPocket(null);
  };

  return {
    pockets,
    loading,
    error,
    refresh: fetchPockets,
    createPocket,
    celebratedPocket,
    dismissCelebration,
  };
}
