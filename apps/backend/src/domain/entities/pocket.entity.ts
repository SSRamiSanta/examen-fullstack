import { Pocket } from '@examen-fullstack/shared';
import {
  InvalidPocketNameException,
  InvalidAmountException,
  PocketCompletedException,
  PocketGoalExceededException,
} from '../errors';

export interface CreatePocketProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  createdAt?: string;
}

export interface ReconstitutePocketProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

export class PocketEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _targetAmount: number;
  private _currentAmount: number;
  private _progress: number;
  private _isCompleted: boolean;
  private readonly _createdAt: string;

  private constructor(
    id: string,
    name: string,
    targetAmount: number,
    currentAmount: number,
    progress: number,
    isCompleted: boolean,
    createdAt: string
  ) {
    this._id = id;
    this._name = name;
    this._targetAmount = targetAmount;
    this._currentAmount = currentAmount;
    this._progress = progress;
    this._isCompleted = isCompleted;
    this._createdAt = createdAt;
  }

  public static create(props: CreatePocketProps): PocketEntity {
    const trimmedName = props.name ? props.name.trim() : '';
    if (trimmedName.length < 3) {
      throw new InvalidPocketNameException(
        'El nombre del bolsillo debe contener al menos 3 caracteres no vacíos.'
      );
    }

    if (props.targetAmount <= 0) {
      throw new InvalidAmountException('La meta de ahorro (targetAmount) debe ser mayor a 0.');
    }

    const currentAmount = props.currentAmount ?? 0;
    if (currentAmount < 0) {
      throw new InvalidAmountException('El monto actual no puede ser negativo.');
    }

    const progress = PocketEntity.calculateProgress(currentAmount, props.targetAmount);
    const isCompleted = currentAmount >= props.targetAmount;
    const createdAt = props.createdAt ?? new Date().toISOString();

    return new PocketEntity(
      props.id,
      trimmedName,
      props.targetAmount,
      currentAmount,
      progress,
      isCompleted,
      createdAt
    );
  }

  public static reconstitute(props: ReconstitutePocketProps): PocketEntity {
    return new PocketEntity(
      props.id,
      props.name,
      props.targetAmount,
      props.currentAmount,
      props.progress,
      props.isCompleted,
      props.createdAt
    );
  }

  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new InvalidAmountException('El monto del abono debe ser mayor a 0.');
    }

    if (this._isCompleted) {
      throw new PocketCompletedException(
        'No se pueden realizar abonos a un bolsillo que ya ha cumplido su meta.'
      );
    }

    const newAmount = Number((this._currentAmount + amount).toFixed(2));
    if (newAmount > this._targetAmount) {
      throw new PocketGoalExceededException(
        `El abono de ${amount} excede la meta restante de ${(this._targetAmount - this._currentAmount).toFixed(2)}.`
      );
    }

    this._currentAmount = newAmount;
    this._progress = PocketEntity.calculateProgress(this._currentAmount, this._targetAmount);
    this._isCompleted = this._currentAmount >= this._targetAmount;
  }

  private static calculateProgress(current: number, target: number): number {
    if (target <= 0) return 0;
    const rawProgress = (current / target) * 100;
    const bounded = Math.min(100, Math.max(0, rawProgress));
    return Number(bounded.toFixed(2));
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get targetAmount(): number {
    return this._targetAmount;
  }

  public get currentAmount(): number {
    return this._currentAmount;
  }

  public get progress(): number {
    return this._progress;
  }

  public get isCompleted(): boolean {
    return this._isCompleted;
  }

  public get createdAt(): string {
    return this._createdAt;
  }

  public toDTO(): Pocket {
    return {
      id: this._id,
      name: this._name,
      targetAmount: this._targetAmount,
      currentAmount: this._currentAmount,
      progress: this._progress,
      isCompleted: this._isCompleted,
      createdAt: this._createdAt,
    };
  }
}
