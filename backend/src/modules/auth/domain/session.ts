export const SESSION_HOURS = 12;
export const REMEMBER_DAYS = 30;
const HOUR_MS = 3_600_000;
const RENEW_INTERVAL_MS = HOUR_MS;

export type SessionProps = {
  id: string;
  tokenHash: string;
  userId: string;
  remember: boolean;
  expiresAt: Date;
  lastUsedAt: Date;
};

export class Session {
  private constructor(private readonly props: SessionProps) {}

  static start(input: { id: string; tokenHash: string; userId: string; remember: boolean; now: Date }): Session {
    const { now, ...rest } = input;
    return new Session({ ...rest, expiresAt: Session.expiryFrom(now, input.remember), lastUsedAt: now });
  }

  static restore(props: SessionProps): Session {
    return new Session({ ...props });
  }

  private static expiryFrom(now: Date, remember: boolean) {
    return new Date(now.getTime() + (remember ? REMEMBER_DAYS * 24 : SESSION_HOURS) * HOUR_MS);
  }

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get remember() {
    return this.props.remember;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }

  toProps(): SessionProps {
    return { ...this.props };
  }

  isExpired(now: Date): boolean {
    return this.props.expiresAt <= now;
  }

  renew(now: Date): boolean {
    if (!this.props.remember || now.getTime() - this.props.lastUsedAt.getTime() < RENEW_INTERVAL_MS) return false;
    this.props.expiresAt = Session.expiryFrom(now, true);
    this.props.lastUsedAt = now;
    return true;
  }
}
