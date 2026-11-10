export function toErrorMap(errors: readonly { field: string; message: string }[]) {
  return Object.fromEntries(errors.map(({ field, message }) => [field, message]));
}
