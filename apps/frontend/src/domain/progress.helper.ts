/**
 * Helpers puros para el estado visual del progreso
 */
export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'var(--success-color, #10b981)';
  if (progress >= 70) return 'var(--primary-color, #6366f1)';
  if (progress >= 30) return 'var(--accent-color, #06b6d4)';
  return 'var(--warning-color, #f59e0b)';
}
