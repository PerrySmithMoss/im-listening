export function validateEmail(email: string) {
  return email.length <= 254 && /^[^\s@<>,;:"\\]+@[^\s@<>,;:"\\]+\.[^\s@<>,;:"\\]+$/u.test(email);
}
