export const sharePath = "/?share=1";

// Keep the allowlist in sync with localReturnPath in the Google API.
export function returnPath(value: unknown): string {
  if (value === sharePath || value === "/account/sign-in") return value;
  if (typeof value === "string" && /^\/post\/[1-9][0-9]{0,9}$/.test(value) &&
      Number(value.slice(6)) <= 2147483647) return value;
  return "/";
}

export function authHref(pathname: "/login" | "/sign-up", next: unknown) {
  const target = returnPath(next);
  return target === "/" ? { pathname } : { pathname, query: { next: target } };
}
