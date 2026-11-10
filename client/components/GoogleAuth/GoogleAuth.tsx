import { useQuery } from "@apollo/client/react";
import { GetSignInMethodsDocument } from "../../graphql/generated/graphql";
import { authHref, returnPath } from "../../lib/returnPath";
import { AuthShell, Field, RegistrationFields, RegistrationLegal, passwordHint } from "../Auth/Auth";
import { useCooldown } from "../Auth/useCooldown";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, type FormEvent } from "react";
import styles from "./GoogleAuth.module.css";

type Status = {
  enabled: boolean;
  signedIn?: boolean;
  linked?: boolean;
  hasPassword?: boolean;
  pending?: { kind: "register" | "password"; email: string; needsCode: boolean };
};

const messages: Record<string, string> = {
  cancelled: "Google sign-in was cancelled. You can try again.",
  retry: "Could not finish Google sign-in. Please try again.",
  unavailable: "Google sign-in is temporarily unavailable.",
  "email-unverified": "Verify your email with Google before creating an account.",
  "link-failed": "Could not connect this Google account. Try another Google account.",
  "password-failed": "Choose the Google account you use to sign in here.",
  linked: "Google is connected to your account.",
};

const secondary = "action action--secondary";

async function request<T>(path: string, body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/auth/google/${path}`, {
    credentials: "same-origin",
    signal,
    ...(body && {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
  if (path === "status" && response.status === 404) return { enabled: false } as T;
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new Error(result?.error ?? "Could not reach Google sign-in. Please try again.");
  }
  return result;
}

function useGoogleStatus() {
  const usesProxy = process.env.NEXT_PUBLIC_GRAPHQL_API_URL === "/api/graphql";
  const [status, setStatus] = useState<Status | undefined>(usesProxy ? undefined : { enabled: false });
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!usesProxy) return;
    const controller = new AbortController();
    request<Status>("status", undefined, controller.signal).then(setStatus).catch(() => {
      if (!controller.signal.aborted) setError("Could not load Google sign-in.");
    });
    return () => controller.abort();
  }, [attempt, usesProxy]);
  return {
    status, setStatus, statusError: error,
    retry: () => { setError(""); setStatus(undefined); setAttempt(attempt + 1); },
  };
}

function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(action: () => Promise<void | "navigating">) {
    setBusy(true);
    setError("");
    try {
      if (await action() === "navigating") return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    }
    setBusy(false);
  }
  return { busy, error, run };
}

function useOutcome() {
  const { query } = useRouter();
  return typeof query.google === "string" && Object.hasOwn(messages, query.google) ? messages[query.google] : "";
}

async function openGoogle(body: Record<string, unknown>) {
  const { authorizationUrl } = await request<{ authorizationUrl: string }>("start", body);
  window.location.assign(authorizationUrl);
  return "navigating" as const;
}

export function GoogleContinue({ entry }: { entry: "/login" | "/sign-up" }) {
  const { query } = useRouter();
  const { status, statusError } = useGoogleStatus();
  const { busy, error, run } = useAction();
  const outcome = useOutcome();
  const pending = status?.pending?.kind === "register";
  const available = status?.enabled && !status.signedIn;
  if (!outcome && !statusError && !pending && !available) return null;
  return (
    <div className="auth-form">
      {outcome && <p role="status">{outcome}</p>}
      {statusError && <p role="status">{statusError}</p>}
      {pending ? (
        <Link className="inline-link" href="/google-onboarding">Finish creating your I&apos;m Listening account</Link>
      ) : available && (
        <button
          type="button"
          className={`${styles.googleButton} inline-flex min-h-[44px] items-center gap-2.5 rounded border border-[#747775] bg-white px-3 text-sm leading-5 font-medium text-[#1f1f1f] hover:bg-[#f8faff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60`}
          disabled={busy}
          onClick={() => void run(() => openGoogle({ intent: "sign-in", entry, returnTo: returnPath(query.next) }))}
        >
          <Image src="/assets/google-g.png" alt="" width={200} height={204} className="h-5 w-auto shrink-0" />
          {entry === "/sign-up" ? "Sign up with Google" : "Sign in with Google"}
        </button>
      )}
      {busy && <p role="status">Opening Google…</p>}
      {error && <p role="alert" className="field-error">{error}</p>}
      {(pending || available) && <p className="field-hint">{entry === "/sign-up" ? "Or sign up with email" : "Or log in with email"}</p>}
    </div>
  );
}

function VerificationCode({ email }: { email: string }) {
  const { busy, error, run } = useAction();
  const [sent, setSent] = useState(false);
  const { remaining, start } = useCooldown(60);
  return (
    <div className="auth-form">
      <p>We’ll send a code to <strong className="wrap-anywhere">{email}</strong> to confirm you can access this inbox.</p>
      <button type="button" className={`${secondary} justify-self-start`} disabled={busy || remaining > 0} onClick={() => void run(async () => {
        await request("email-code", {});
        setSent(true);
        start();
      })}>
        {busy ? "Sending…" : remaining ? `Send again in ${remaining}s` : sent ? "Send another code" : "Send verification code"}
      </button>
      {sent && <p role="status">Check your inbox and spam folder for the eight-digit code. Use the newest code if you requested another one.</p>}
      {error && <p role="alert" className="field-error">{error}</p>}
      <Field name="code" label="Email verification code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} required />
    </div>
  );
}

export function GoogleOnboarding() {
  const { status, statusError, retry } = useGoogleStatus();
  const { busy, error, run } = useAction();
  const pending = status?.pending;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    void run(async () => {
      const { next } = await request<{ next: string }>("register", fields);
      window.location.assign(returnPath(next));
      return "navigating";
    });
  }

  return (
    <AuthShell title="Finish creating your I’m Listening account">
      {statusError ? (
        <>
          <p role="alert" className="field-error">{statusError}</p>
          <button type="button" className={`${secondary} justify-self-start`} onClick={retry}>Try again</button>
        </>
      ) : !status ? <p role="status">Checking your Google sign-in…</p> :
        pending?.kind !== "register" ? (
          <p>{status.enabled ? "This Google sign-in has expired." : "Google sign-in is currently unavailable."} <Link className="inline-link" href="/login">Back to log in</Link>.</p>
        ) : (
          <form onSubmit={submit} className="auth-form" aria-busy={busy}>
            <p>Complete your profile for <strong className="wrap-anywhere">{pending.email}</strong>.</p>
            <RegistrationFields />
            {pending.needsCode && <VerificationCode email={pending.email} />}
            <RegistrationLegal />
            {error && <p role="alert" className="field-error">{error}</p>}
            <div className="actions">
              <button type="submit" className="action" disabled={busy}>{busy ? "Working…" : "Create account"}</button>
              <button className={secondary} type="button" disabled={busy} onClick={() => void run(async () => {
                const { next } = await request<{ next: string }>("cancel", {});
                // The cancellation route returns the entry page with the original next query.
                redirectToEntry(next);
                return "navigating";
              })}>Cancel</button>
            </div>
          </form>
        )}
    </AuthShell>
  );
}

function redirectToEntry(value: string) {
  const url = new URL(value, window.location.origin);
  const path = url.origin === window.location.origin && url.pathname === "/sign-up" ? "/sign-up" : "/login";
  const next = url.origin === window.location.origin ? returnPath(url.searchParams.get("next")) : "/";
  window.location.assign(next === "/" ? path : `${path}?${new URLSearchParams({ next })}`);
}

export function SignInSettings() {
  const account = useQuery(GetSignInMethodsDocument, { ssr: false, fetchPolicy: "network-only" });
  const { status, setStatus, statusError, retry } = useGoogleStatus();
  const { busy, error, run } = useAction();
  const [notice, setNotice] = useState("");
  const outcome = useOutcome();
  const pending = status?.pending;
  const user = account.data?.getCurrentUser;
  const hasPassword = status?.enabled && status.signedIn ? status.hasPassword : user?.hasPassword;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    void run(async () => {
      if (pending?.kind === "password") {
        await request("password", fields);
        setNotice("Password saved. You can now sign in with Google or your password.");
      } else if (status?.linked) {
        await request("unlink", fields);
        setNotice("Google is disconnected.");
      } else {
        return openGoogle({ intent: "link", password: fields.password });
      }
      form.reset();
      setStatus(await request<Status>("status"));
      void account.refetch().catch(() => undefined);
    });
  }

  return (
    <AuthShell title="Sign-in methods" intro="Manage how you sign in to I’m Listening.">
      {(notice || outcome) && <p role="status">{notice || outcome}</p>}
      {account.error ? (
        <div className="auth-form">
          <p role="alert" className="field-error">Could not load your sign-in methods.</p>
          <button type="button" className={`${secondary} justify-self-start`} onClick={() => void account.refetch().catch(() => undefined)}>Try again</button>
        </div>
      ) : account.loading || !account.data ? <p role="status">Loading your sign-in methods…</p> :
        !user ? <p><Link className="inline-link" href={authHref("/login", "/account/sign-in")}>Log in</Link> to manage your sign-in methods.</p> : (
          <>
            <section className="auth-form">
              <h2 className="section-title">Password</h2>
              <p>{hasPassword ? "Password is set." : "No password is set for this account."}</p>
              {hasPassword && <Link className="inline-link justify-self-start" href="/forgot-password">Reset your password</Link>}
            </section>
            <section className="auth-form">
              <h2 className="section-title">Google</h2>
              {statusError ? (
                <>
                  <p className="field-error" role="alert">{statusError}</p>
                  <button type="button" className={`${secondary} justify-self-start`} onClick={retry}>Try again</button>
                </>
              ) : !status ? <p role="status">Checking Google availability…</p> :
                !status.enabled ? <p>Google sign-in is currently unavailable.</p> :
                !status.signedIn ? <p>Google couldn’t confirm your session. <Link className="inline-link" href={authHref("/login", "/account/sign-in")}>Log in again</Link>.</p> : (
                  <>
                    <p>{status.linked ? "Google is connected to your account." : "Connect Google to use it as another way to sign in."}</p>
                    {hasPassword || pending?.kind === "password" ? (
                      <form className="auth-form" onSubmit={submit} aria-busy={busy}>
                        {pending?.kind === "password" && <VerificationCode email={pending.email} />}
                        <Field name="password" key={pending?.kind ?? "current"} type="password"
                          label={pending?.kind === "password" ? "New password" : "Current password"}
                          autoComplete={pending?.kind === "password" ? "new-password" : "current-password"}
                          hint={pending?.kind === "password" ? passwordHint : undefined}
                          minLength={pending?.kind === "password" ? 8 : undefined} maxLength={128} required />
                        <div className="actions">
                          <button type="submit" className="action" disabled={busy}>
                            {busy ? "Working…" : pending?.kind === "password" ? "Save password" : status.linked ? "Disconnect Google" : "Connect Google"}
                          </button>
                          {pending?.kind === "password" && <button className={secondary} type="button" disabled={busy} onClick={() => void run(async () => {
                            await request("cancel", {});
                            setStatus(await request<Status>("status"));
                          })}>Cancel</button>}
                        </div>
                      </form>
                    ) : (
                      <>
                        <p>Set a password before disconnecting Google. You’ll confirm your Google account and verify your email address.</p>
                        <button type="button" className="action justify-self-start" disabled={busy} onClick={() => void run(() => openGoogle({ intent: "password" }))}>
                          {busy ? "Opening Google…" : "Verify with Google to set a password"}
                        </button>
                      </>
                    )}
                  </>
                )}
              {error && <p role="alert" className="field-error">{error}</p>}
            </section>
          </>
        )}
    </AuthShell>
  );
}
