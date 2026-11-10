import Link from "next/link";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

export const passwordHint = "Use 8 to 128 characters.";
export const usernameHint = "Up to 40 characters, with no spaces.";

export function AuthShell({ title, intro, illustrated, children }: {
  title: string; intro?: string; illustrated?: boolean; children: ReactNode;
}) {
  return (
    <main id="main-content" tabIndex={-1} className={`page-width auth-layout${illustrated ? " auth-layout--illustrated" : ""}`}>
      {illustrated && <div aria-hidden="true" className="auth-art" />}
      <div className="auth-panel">
        <div className="auth-heading">
          <h1 className="page-title">{title}</h1>
          {intro && <p className="muted">{intro}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}

export function Field({ label, hint, error, type = "text", id: explicitId, ...input }: ComponentProps<"input"> & {
  label: string; hint?: string; error?: string;
}) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const [show, setShow] = useState(false);
  const password = type === "password";
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const control = (
    <input {...input} id={id} className="field-control" type={password && show ? "text" : type}
      aria-invalid={error ? true : undefined} aria-describedby={describedBy} />
  );
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {password ? (
        <div className="password-field">
          {control}
          <button className="action action--secondary" type="button" onClick={() => setShow(!show)}
            aria-controls={id} aria-label={show ? "Hide password" : "Show password"}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      ) : control}
      {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function RegistrationFields({ errors }: { errors?: Record<string, string> }) {
  return (
    <div className="auth-identity">
      <p className="field-hint">Your name and username are public. Your name appears on your posts. Each name can be up to 80 characters.</p>
      <Field name="firstName" label="First name" autoComplete="given-name" maxLength={80} error={errors?.firstName} required />
      <Field name="lastName" label="Last name" autoComplete="family-name" maxLength={80} error={errors?.lastName} required />
      <Field name="username" label="Username" autoComplete="username" hint={usernameHint} maxLength={40} pattern={String.raw`\S+`} error={errors?.username} required />
    </div>
  );
}

export function RegistrationLegal() {
  return <p className="field-hint">Before creating an account, read our <Link href="/privacy" className="inline-link">privacy policy</Link> and <Link href="/terms" className="inline-link">terms of service</Link>.</p>;
}

export function focusFirstError(form: HTMLFormElement, errors: Record<string, string>) {
  const input = Array.from(form.elements).find((element): element is HTMLInputElement =>
    element instanceof HTMLInputElement && Boolean(errors[element.name]));
  // Wait for React to render the error and its accessible description.
  if (input) requestAnimationFrame(() => input.focus());
}
