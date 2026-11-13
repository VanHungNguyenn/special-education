const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const generatePassword = (length = 12) => {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join("");
};

export type AccountStatus = { kind: "active" | "locked" | "disabled"; label: string };

export const accountStatus = (user: { isActive: boolean; lockedUntil: string | null }, now = new Date()): AccountStatus => {
  if (!user.isActive) return { kind: "disabled", label: "Đã vô hiệu hóa" };
  const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;
  if (lockedUntil && lockedUntil > now) {
    const time = lockedUntil.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { kind: "locked", label: `Tạm khóa đến ${time}` };
  }
  return { kind: "active", label: "Đang hoạt động" };
};
