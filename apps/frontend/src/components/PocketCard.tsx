import React from 'react';
import { Pocket } from '@examen-fullstack/shared';
import { formatCurrency, getProgressColor } from '../domain';

export interface PocketCardProps {
  pocket: Pocket;
  onDepositClick: (pocket: Pocket) => void;
}

export const PocketCard: React.FC<PocketCardProps> = ({ pocket, onDepositClick }) => {
  const isCompleted = pocket.isCompleted;
  const progressColor = getProgressColor(pocket.progress);

  return (
    <article className={`pocket-card ${isCompleted ? 'pocket-card--completed' : ''}`}>
      <div className="pocket-card__header">
        <h3 className="pocket-card__title">{pocket.name}</h3>
        <span
          className={`pocket-card__badge ${
            isCompleted ? 'pocket-card__badge--success' : 'pocket-card__badge--active'
          }`}
        >
          {isCompleted ? 'Completado' : 'En progreso'}
        </span>
      </div>

      <div className="pocket-card__amounts">
        <span className="pocket-card__current">{formatCurrency(pocket.currentAmount)}</span>
        <span className="pocket-card__target">/ {formatCurrency(pocket.targetAmount)}</span>
      </div>

      <div className="pocket-card__progress-container">
        <div
          className="pocket-card__progress-bar"
          style={{ width: `${Math.min(100, pocket.progress)}%`, backgroundColor: progressColor }}
          role="progressbar"
          aria-valuenow={pocket.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="pocket-card__footer">
        <span className="pocket-card__percentage">{pocket.progress}%</span>
        <button
          type="button"
          className="pocket-card__btn"
          disabled={isCompleted}
          onClick={() => onDepositClick(pocket)}
        >
          {isCompleted ? 'Completado' : 'Abonar'}
        </button>
      </div>
    </article>
  );
};
