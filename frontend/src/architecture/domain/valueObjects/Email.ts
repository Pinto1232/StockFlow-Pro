// Value Object: Email
// Represents and validates email addresses

export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(public readonly value: string) {
    if (!Email.isValid(value)) {
      throw new Error(`Invalid email address: ${value}`);
    }
  }

  static isValid(email: string): boolean {
    return Email.EMAIL_REGEX.test(email);
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  get localPart(): string {
    return this.value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }

  static fromString(value: string): Email {
    return new Email(value.trim().toLowerCase());
  }
}