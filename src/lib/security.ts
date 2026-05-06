// Input sanitization — removes dangerous characters to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// Email validation
export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (email.length > 254) return "Email is too long";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  if (/<|>|'|"|;|--|\/\*/.test(email)) return "Email contains invalid characters";
  return null;
}

// Password strength validation
export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
  return null;
}

// Password strength score (0-4)
export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 1) return { score, label: "Very Weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Weak", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Strong", color: "bg-blue-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

// Name validation
export function validateName(name: string): string | null {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 100) return "Name is too long";
  if (/<|>|'|"|;|--|\/\*/.test(name)) return "Name contains invalid characters";
  if (/[0-9]/.test(name)) return "Name cannot contain numbers";
  return null;
}

// Device name validation
export function validateDeviceName(name: string): string | null {
  if (!name) return "Device name is required";
  if (name.length < 2) return "Device name must be at least 2 characters";
  if (name.length > 50) return "Device name is too long";
  if (/<|>|"|;|--|\/\*/.test(name)) return "Device name contains invalid characters";
  return null;
}

// Hardware ID validation
export function validateHardwareId(id: string): string | null {
  if (!id) return "Hardware ID is required";
  if (id.length > 50) return "Hardware ID is too long";
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return "Hardware ID can only contain letters, numbers, hyphens and underscores";
  return null;
}

// Rate limiting (client-side — tracks login attempts)
const loginAttempts: { [email: string]: { count: number; lastAttempt: number } } = {};

export function checkRateLimit(email: string): string | null {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts[email]) {
    loginAttempts[email] = { count: 0, lastAttempt: now };
  }

  const record = loginAttempts[email];

  // Reset if window has passed
  if (now - record.lastAttempt > windowMs) {
    record.count = 0;
    record.lastAttempt = now;
  }

  if (record.count >= maxAttempts) {
    const remainingMs = windowMs - (now - record.lastAttempt);
    const remainingMins = Math.ceil(remainingMs / 60000);
    return `Too many login attempts. Please try again in ${remainingMins} minute(s).`;
  }

  return null;
}

export function recordLoginAttempt(email: string, success: boolean): void {
  if (!loginAttempts[email]) {
    loginAttempts[email] = { count: 0, lastAttempt: Date.now() };
  }
  if (!success) {
    loginAttempts[email].count++;
    loginAttempts[email].lastAttempt = Date.now();
  } else {
    // Reset on success
    delete loginAttempts[email];
  }
}