import React from 'react';
import { Pocket } from '@examen-fullstack/shared';
import { formatCurrency } from '../domain';

export interface GoalCelebrationProps {
  pocket: Pocket | null;
  onClose: () => void;
}

export const GoalCelebration: React.FC<GoalCelebrationProps> = ({ pocket, onClose }) => {
  if (!pocket) return null;

  return (
    <div className="celebration-overlay" role="dialog" aria-modal="true">
      <div className="celebration-card">
        <div className="celebration-card__confetti">🎉</div>
        <span className="celebration-card__badge">🏆 ¡Meta Cumplida!</span>
        <h2 className="celebration-card__title">{pocket.name}</h2>
        <p className="celebration-card__subtitle">
          ¡Felicitaciones! Has alcanzado con éxito el 100% de tu objetivo de ahorro con{' '}
          <strong className="celebration-card__amount">{formatCurrency(pocket.targetAmount)}</strong>.
        </p>
        <button
          type="button"
          className="celebration-card__btn"
          onClick={onClose}
          autoFocus
        >
          ¡Celebrar y Continuar!
        </button>
      </div>
    </div>
  );
};
