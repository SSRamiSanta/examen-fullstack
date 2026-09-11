import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoalCelebration } from '../../src/components/GoalCelebration';
describe('GoalCelebration (Modal Component)', () => {
    const mockCompletedPocket = {
        id: 'pocket-100',
        name: 'Fondo de Emergencia',
        targetAmount: 3000.0,
        currentAmount: 3000.0,
        progress: 100.0,
        isCompleted: true,
        createdAt: '2026-09-10T15:00:00.000Z',
    };
    it('no debe renderizar nada si pocket es null', () => {
        const { container } = render(_jsx(GoalCelebration, { pocket: null, onClose: jest.fn() }));
        expect(container.firstChild).toBeNull();
    });
    it('debe renderizar el mensaje de felicitación y el nombre del bolsillo cuando está presente', () => {
        render(_jsx(GoalCelebration, { pocket: mockCompletedPocket, onClose: jest.fn() }));
        expect(screen.getByText(/¡Meta Cumplida!/i)).toBeInTheDocument();
        expect(screen.getByText('Fondo de Emergencia')).toBeInTheDocument();
        expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });
    it('debe llamar a onClose cuando se presiona el botón de continuar', () => {
        const onClose = jest.fn();
        render(_jsx(GoalCelebration, { pocket: mockCompletedPocket, onClose: onClose }));
        const closeButton = screen.getByRole('button', { name: /¡celebrar y continuar!/i });
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
