import { accountDisabled, accountLocked } from './auth-errors.js';

export const ROLES = ['MANAGER', 'TEACHER'] as const;
export type Role = (typeof ROLES)[number];

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export type UserProps = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  role: Role;
  isActive: boolean;
  failedLoginCount: number;
  lockedUntil: Date | null;
};

export type NewUser = Pick<UserProps, 'id' | 'email' | 'passwordHash' | 'fullName' | 'phone' | 'role'>;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(input: NewUser): User {
    return new User({
      id: input.id,
      passwordHash: input.passwordHash,
      role: input.role,
      email: normalizeEmail(input.email),
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
    });
  }

  static restore(props: UserProps): User {
    const { id, email, passwordHash, fullName, phone, role, isActive, failedLoginCount, lockedUntil } = props;
    return new User({ id, email, passwordHash, fullName, phone, role, isActive, failedLoginCount, lockedUntil });
  }

  get id() {
    return this.props.id;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get fullName() {
    return this.props.fullName;
  }
  get phone() {
    return this.props.phone;
  }
  get role() {
    return this.props.role;
  }
  get isActive() {
    return this.props.isActive;
  }
  get lockedUntil() {
    return this.props.lockedUntil;
  }

  toProps(): UserProps {
    return { ...this.props };
  }

  assertCanLogIn(now: Date): void {
    this.assertActive();
    this.assertNotLocked(now);
  }

  assertActive(): void {
    if (!this.props.isActive) throw accountDisabled();
  }

  assertNotLocked(now: Date): void {
    const { lockedUntil } = this.props;
    if (lockedUntil && lockedUntil > now) throw accountLocked(Math.ceil((lockedUntil.getTime() - now.getTime()) / 60_000));
  }

  registerFailedLogin(now: Date): void {
    this.props.failedLoginCount += 1;
    if (this.props.failedLoginCount >= MAX_FAILED_LOGINS) {
      this.props.lockedUntil = new Date(now.getTime() + LOCK_MINUTES * 60_000);
      this.props.failedLoginCount = 0;
    }
  }

  registerSuccessfulLogin(): void {
    this.props.failedLoginCount = 0;
    this.props.lockedUntil = null;
  }

  changePassword(passwordHash: string): void {
    this.props.passwordHash = passwordHash;
    this.registerSuccessfulLogin();
  }

  updateProfile(changes: { email?: string; fullName?: string; phone?: string }): void {
    if (changes.email !== undefined) this.props.email = normalizeEmail(changes.email);
    if (changes.fullName !== undefined) this.props.fullName = changes.fullName.trim();
    if (changes.phone !== undefined) this.props.phone = changes.phone.trim();
  }

  setRole(role: Role): void {
    this.props.role = role;
  }

  setActive(isActive: boolean): void {
    this.props.isActive = isActive;
  }
}
