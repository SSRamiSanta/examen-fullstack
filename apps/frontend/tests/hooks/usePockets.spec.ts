/** @jest-environment jsdom */
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePockets } from '../../src/hooks/usePockets';
import { apiService } from '../../src/services/api.service';
import { websocketService } from '../../src/services/websocket.service';
import { Pocket, PocketUpdatedEvent } from '@examen-fullstack/shared';

jest.mock('../../src/services/api.service');
jest.mock('../../src/services/websocket.service');

describe('usePockets (Custom Hook / Application Coordinator)', () => {
  const mockPockets: Pocket[] = [
    {
      id: 'pocket-1',
      name: 'Viaje a Europa',
      targetAmount: 5000.0,
      currentAmount: 2500.0,
      progress: 50.0,
      isCompleted: false,
      createdAt: '2026-09-10T15:00:00.000Z',
    },
  ];

  let wsListener: ((event: PocketUpdatedEvent) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();

    (apiService.getPockets as jest.Mock).mockResolvedValue([...mockPockets]);

    (websocketService.subscribe as jest.Mock).mockImplementation((callback) => {
      wsListener = callback;
      return () => {
        wsListener = null;
      };
    });
  });

  it('debe cargar los bolsillos al montarse', async () => {
    const { result } = renderHook(() => usePockets());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pockets).toHaveLength(1);
    expect(result.current.pockets[0].name).toBe('Viaje a Europa');
  });

  it('debe actualizar reactivamente el bolsillo al recibir un evento POCKET_UPDATED vía WebSocket', async () => {
    const { result } = renderHook(() => usePockets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateEvent: PocketUpdatedEvent = {
      event: 'POCKET_UPDATED',
      pocketId: 'pocket-1',
      targetAmount: 5000.0,
      currentAmount: 3000.0,
      progress: 60.0,
      isCompleted: false,
      goalAchieved: false,
      timestamp: '2026-09-10T15:30:00.000Z',
    };

    act(() => {
      if (wsListener) {
        wsListener(updateEvent);
      }
    });

    expect(result.current.pockets[0].currentAmount).toBe(3000.0);
    expect(result.current.pockets[0].progress).toBe(60.0);
    expect(result.current.celebratedPocket).toBeNull();
  });

  it('debe activar celebratedPocket cuando goalAchieved es true en el evento WebSocket', async () => {
    const { result } = renderHook(() => usePockets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const goalEvent: PocketUpdatedEvent = {
      event: 'POCKET_UPDATED',
      pocketId: 'pocket-1',
      targetAmount: 5000.0,
      currentAmount: 5000.0,
      progress: 100.0,
      isCompleted: true,
      goalAchieved: true,
      timestamp: '2026-09-10T15:35:00.000Z',
    };

    act(() => {
      if (wsListener) {
        wsListener(goalEvent);
      }
    });

    expect(result.current.celebratedPocket).not.toBeNull();
    expect(result.current.celebratedPocket?.id).toBe('pocket-1');
    expect(result.current.celebratedPocket?.isCompleted).toBe(true);

    act(() => {
      result.current.dismissCelebration();
    });

    expect(result.current.celebratedPocket).toBeNull();
  });
});
