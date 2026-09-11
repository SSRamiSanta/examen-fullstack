/**
 * Excepción base para todas las violaciones de reglas e invariantes del dominio.
 * No contiene acoplamiento a HTTP ni frameworks.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidPocketNameException extends DomainException {
  constructor(message: string = 'El nombre del bolsillo debe tener al menos 3 caracteres.') {
    super(message);
  }
}

export class InvalidAmountException extends DomainException {
  constructor(message: string = 'El monto debe ser un valor estrictamente mayor a 0.') {
    super(message);
  }
}

export class PocketCompletedException extends DomainException {
  constructor(message: string = 'No se pueden realizar abonos a un bolsillo completado.') {
    super(message);
  }
}

export class PocketGoalExceededException extends DomainException {
  constructor(message: string = 'El monto a abonar excede el objetivo establecido para el bolsillo.') {
    super(message);
  }
}

export class PocketNotFoundException extends DomainException {
  constructor(id: string) {
    super(`El bolsillo con ID '${id}' no fue encontrado.`);
  }
}

export class InvalidSignatureException extends DomainException {
  constructor(message: string = 'Firma digital HMAC-SHA256 inválida o ausente.') {
    super(message);
  }
}

export class ReplayAttackException extends DomainException {
  constructor(message: string = 'Timestamp desfasado: posible ataque de repetición.') {
    super(message);
  }
}

