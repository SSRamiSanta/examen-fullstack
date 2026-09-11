import React, { useState } from 'react';
import { Pocket } from '@examen-fullstack/shared';
import { usePockets } from './hooks/usePockets';
import { formatCurrency } from './domain';
import {
  PocketCard,
  DepositModal,
  CreatePocketModal,
  GoalCelebration,
} from './components';

export const App: React.FC = () => {
  const {
    pockets,
    loading,
    error,
    refresh,
    celebratedPocket,
    dismissCelebration,
  } = usePockets();

  const [selectedPocketForDeposit, setSelectedPocketForDeposit] = useState<Pocket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Métricas acumuladas calculadas en memoria
  const totalSaved = pockets.reduce((acc, p) => acc + p.currentAmount, 0);
  const totalTarget = pockets.reduce((acc, p) => acc + p.targetAmount, 0);
  const completedCount = pockets.filter((p) => p.isCompleted).length;

  return (
    <div className="app-container">
      {/* Header Principal */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">💎</div>
          <div>
            <h1 className="brand-title">Bolsillo de Ahorro Programado</h1>
            <p className="brand-subtitle">Planifica, ahorra y celebra el cumplimiento de tus metas financieras</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <span>＋</span> Nuevo Bolsillo
        </button>
      </header>

      {/* Grid de Métricas Generales */}
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Ahorrado</span>
          <span className="metric-value">{formatCurrency(totalSaved)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Meta Global</span>
          <span className="metric-value">{formatCurrency(totalTarget)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Metas Cumplidas</span>
          <span className="metric-value">
            {completedCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {pockets.length}</span>
          </span>
        </div>
      </section>

      {/* Listado de Bolsillos */}
      <section className="pockets-section">
        <div className="section-header">
          <h2 className="section-title">Tus Metas de Ahorro</h2>
          {loading && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Actualizando...</span>}
        </div>

        {error && <div className="modal-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {pockets.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎯</div>
            <h3 className="empty-state__title">No tienes bolsillos de ahorro creados</h3>
            <p className="empty-state__desc">
              Comienza creando tu primera meta de ahorro (por ejemplo: vacaciones, fondo de emergencia, nuevo equipo).
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Crear mi primer bolsillo
            </button>
          </div>
        ) : (
          <div className="pockets-grid">
            {pockets.map((pocket) => (
              <PocketCard
                key={pocket.id}
                pocket={pocket}
                onDepositClick={(p) => setSelectedPocketForDeposit(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modales */}
      <DepositModal
        pocket={selectedPocketForDeposit}
        isOpen={Boolean(selectedPocketForDeposit)}
        onClose={() => setSelectedPocketForDeposit(null)}
        onDepositSuccess={refresh}
      />

      <CreatePocketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refresh}
      />

      {/* Modal de Celebración de Meta al 100% (Reactivo WebSocket) */}
      <GoalCelebration
        pocket={celebratedPocket}
        onClose={dismissCelebration}
      />
    </div>
  );
};
