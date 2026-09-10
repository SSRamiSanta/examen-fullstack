/**
 * Entidades y modelos base del dominio según spec.md
 */

export interface Pocket {
  id: string; // UUID v4
  name: string; // Min 3 caracteres
  targetAmount: number; // > 0
  currentAmount: number; // >= 0
  progress: number; // Calculado: min(100, (currentAmount / targetAmount) * 100)
  isCompleted: boolean; // currentAmount >= targetAmount
  createdAt: string; // ISO 8601
}

export interface Deposit {
  id: string; // UUID v4
  pocketId: string;
  amount: number; // > 0
  createdAt: string; // ISO 8601
}
