import React, { useState } from 'react';
import { Pocket } from '@examen-fullstack/shared';
import { formatCurrency } from '../domain';
import { useDeposit } from '../hooks/useDeposit';

export interface DepositModalProps {
  pocket: Pocket | null;
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  pocket,
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [amount, setAmount] = useState<string>('');
  const { deposit, loading, error, clearError } = useDeposit();

  if (!isOpen || !pocket) return null;

  const remaining = Math.max(0, Number((pocket.targetAmount - pocket.currentAmount).toFixed(2)));

  const handleClose = () => {
    setAmount('');
    clearError();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    try {
      await deposit(pocket.id, num);
      setAmount('');
      onDepositSuccess();
      onClose();
    } catch {
      // El hook useDeposit captura el error para mostrarlo en UI
    }
  };

  const handleQuickAdd = (value: number) => {
    const nextVal = Math.min(remaining, value);
    setAmount(nextVal.toString());
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Abonar a "{pocket.name}"</h3>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-info">
            <span>Saldo actual: <strong>{formatCurrency(pocket.currentAmount)}</strong></span>
            <span>Meta restante: <strong>{formatCurrency(remaining)}</strong></span>
          </div>

          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="deposit-amount">Monto a abonar (USD):</label>
            <input
              id="deposit-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              placeholder="Ej. 150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="quick-amount-group">
            <button type="button" className="quick-chip" onClick={() => handleQuickAdd(50)} disabled={loading || remaining < 50}>+$50</button>
            <button type="button" className="quick-chip" onClick={() => handleQuickAdd(100)} disabled={loading || remaining < 100}>+$100</button>
            <button type="button" className="quick-chip" onClick={() => handleQuickAdd(250)} disabled={loading || remaining < 250}>+$250</button>
            <button type="button" className="quick-chip" onClick={() => handleQuickAdd(remaining)} disabled={loading || remaining <= 0}>Todo ({formatCurrency(remaining)})</button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !amount || parseFloat(amount) <= 0}>
              {loading ? 'Procesando...' : 'Confirmar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
