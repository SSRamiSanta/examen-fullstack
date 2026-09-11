/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Pocket } from '@examen-fullstack/shared';
import { PocketCard } from '../../src/components/PocketCard';

describe('PocketCard (Presentational Component)', () => {
  const mockPocket: Pocket = {
    id: 'pocket-1',
    name: 'Viaje a Europa',
    targetAmount: 5000.0,
    currentAmount: 2500.0,
    progress: 50.0,
    isCompleted: false,
    createdAt: '2026-09-10T15:00:00.000Z',
  };

  it('debe renderizar el nombre, montos y progreso correctamente', () => {
    render(<PocketCard pocket={mockPocket} onDepositClick={jest.fn()} />);

    expect(screen.getByText('Viaje a Europa')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    expect(screen.getByText('/ $5,000.00')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('debe mostrar la insignia "Completado" y deshabilitar el botón si isCompleted es true', () => {
    const completedPocket: Pocket = {
      ...mockPocket,
      currentAmount: 5000.0,
      progress: 100.0,
      isCompleted: true,
    };

    render(<PocketCard pocket={completedPocket} onDepositClick={jest.fn()} />);

    expect(screen.getAllByText('Completado').length).toBeGreaterThanOrEqual(1);
    const depositButton = screen.getByRole('button', { name: /completado/i });
    expect(depositButton).toBeDisabled();
  });

  it('debe disparar onDepositClick con el id del bolsillo al presionar el botón Abonar', () => {
    const onDepositClick = jest.fn();
    render(<PocketCard pocket={mockPocket} onDepositClick={onDepositClick} />);

    const depositButton = screen.getByRole('button', { name: /abonar/i });
    fireEvent.click(depositButton);

    expect(onDepositClick).toHaveBeenCalledTimes(1);
    expect(onDepositClick).toHaveBeenCalledWith(mockPocket);
  });
});
