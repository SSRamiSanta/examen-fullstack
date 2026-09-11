import { Deposit } from '@examen-fullstack/shared';
import { InvalidAmountException } from '../errors';

export interface CreateDepositProps {
  id: string;
  pocketId: string;
  amount: number;
  createdAt?: string;
}

export class DepositEntity {
  private readonly _id: string;
  private readonly _pocketId: string;
  private readonly _amount: number;
  private readonly _createdAt: string;

  private constructor(id: string, pocketId: string, amount: number, createdAt: string) {
    this._id = id;
    this._pocketId = pocketId;
    this._amount = amount;
    this._createdAt = createdAt;
  }

  public static create(props: CreateDepositProps): DepositEntity {
    if (props.amount <= 0) {
      throw new InvalidAmountException('El monto de la transacción de abono debe ser mayor a 0.');
    }

    const createdAt = props.createdAt ?? new Date().toISOString();

    return new DepositEntity(props.id, props.pocketId, props.amount, createdAt);
  }

  public get id(): string {
    return this._id;
  }

  public get pocketId(): string {
    return this._pocketId;
  }

  public get amount(): number {
    return this._amount;
  }

  public get createdAt(): string {
    return this._createdAt;
  }

  public toDTO(): Deposit {
    return {
      id: this._id,
      pocketId: this._pocketId,
      amount: this._amount,
      createdAt: this._createdAt,
    };
  }
}
