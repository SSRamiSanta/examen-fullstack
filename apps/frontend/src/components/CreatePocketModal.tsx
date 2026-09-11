import React, { useState } from 'react';
import { Pocket } from '@examen-fullstack/shared';
import { apiService } from '../services/api.service';

export interface CreatePocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (pocket: Pocket) => void;
}

export const CreatePocketModal: React.FC<CreatePocketModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setTargetAmount('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('La meta debe ser mayor a 0.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await apiService.createPocket({
        name: name.trim(),
        targetAmount: target,
      });
      handleClose();
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el bolsillo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Nuevo Bolsillo de Ahorro</h3>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="pocket-name">Nombre de la meta:</label>
            <input
              id="pocket-name"
              type="text"
              placeholder="Ej. Vacaciones Europa, Fondo de Emergencia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pocket-target">Meta de ahorro (USD):</label>
            <input
              id="pocket-target"
              type="number"
              step="0.01"
              min="1"
              placeholder="Ej. 5000.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !name || !targetAmount}>
              {loading ? 'Creando...' : 'Crear Bolsillo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
