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

const inputClass = "block w-full rounded border border-gray-400 p-2 text-black";
const buttonClass = "rounded border border-current px-3 py-2 disabled:opacity-60";

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
  useEffect(() => {
    if (!usesProxy) return;
    const controller = new AbortController();
    request<Status>("status", undefined, controller.signal).then(setStatus).catch(() => {
      if (!controller.signal.aborted) setError("Could not load Google sign-in. Reload to try again.");
    });
    return () => controller.abort();
  }, [usesProxy]);
  return { status, setStatus, statusError: error };
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
  return (
    <div className="mb-4">
      {outcome && <p role="status">{outcome}</p>}
      {statusError && <p role="status">{statusError}</p>}
      {status?.pending?.kind === "register" ? (
        <Link className="underline" href="/google-onboarding">Finish creating your Google account</Link>
      ) : status?.enabled && !status.signedIn && (
        <button
          type="button"
          className={`${styles.googleButton} inline-flex min-h-[44px] items-center gap-2.5 rounded border border-[#747775] bg-white px-3 text-sm leading-5 font-medium text-[#1f1f1f] hover:bg-[#f8faff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60`}
          disabled={busy}
          onClick={() => void run(() => openGoogle({ intent: "sign-in", entry, returnTo: query.next }))}
        >
          <Image src="/assets/google-g.png" alt="" width={200} height={204} className="h-5 w-auto shrink-0" />
          {entry === "/sign-up" ? "Sign up with Google" : "Sign in with Google"}
        </button>
      )}
      {busy && <p role="status">Opening Google…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export function GoogleSettingsLink() {
  const { status } = useGoogleStatus();
  return status?.enabled ? <Link href="/account/sign-in" className="block mb-2 hover:text-brand-orange">Sign-in methods</Link> : null;
}

function VerificationCode({ email }: { email: string }) {
  const { busy, error, run } = useAction();
  const [sent, setSent] = useState(false);
  return (
    <div className="space-y-2">
      <p>Send a verification code to <strong className="break-all">{email}</strong>.</p>
      <button type="button" className={buttonClass} disabled={busy} onClick={() => void run(async () => {
        await request("email-code", {});
        setSent(true);
      })}>
        {busy ? "Sending…" : sent ? "Send another code" : "Send verification code"}
      </button>
      {sent && <p role="status">Check your inbox for the eight-digit code.</p>}
      {error && <p role="alert">{error}</p>}
      <label className="block">
        Email verification code
        <input className={inputClass} name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} required />
      </label>
    </div>
  );
}

export function GoogleOnboarding() {
  const { status, statusError } = useGoogleStatus();
  const { busy, error, run } = useAction();
  const pending = status?.pending;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    void run(async () => {
      const { next } = await request<{ next: string }>("register", fields);
      window.location.assign(next);
    });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Finish creating your account</h1>
      {statusError ? <p role="alert">{statusError}</p> :
        !status ? <p role="status">Loading…</p> :
        pending?.kind !== "register" ? <p>This Google sign-in has expired. <Link className="underline" href="/login">Start again</Link>.</p> : (
          <form onSubmit={submit} className="space-y-4">
            <p>Complete your profile for <strong className="break-all">{pending.email}</strong>.</p>
            <label className="block">First name<input className={inputClass} name="firstName" autoComplete="given-name" maxLength={80} required /></label>
            <label className="block">Last name<input className={inputClass} name="lastName" autoComplete="family-name" maxLength={80} required /></label>
            <label className="block">Username<input className={inputClass} name="username" autoComplete="username" maxLength={40} required /></label>
            {pending.needsCode && <VerificationCode email={pending.email} />}
            <div className="flex flex-wrap gap-2">
              <button className={buttonClass} disabled={busy}>{busy ? "Working…" : "Create account"}</button>
              <button className={buttonClass} type="button" disabled={busy} onClick={() => void run(async () => {
                const { next } = await request<{ next: string }>("cancel", {});
                window.location.assign(next);
              })}>Cancel</button>
            </div>
            {error && <p role="alert">{error}</p>}
          </form>
        )}
    </main>
  );
}

export function SignInSettings() {
  const { status, setStatus, statusError } = useGoogleStatus();
  const { busy, error, run } = useAction();
  const [notice, setNotice] = useState("");
  const outcome = useOutcome();
  const pending = status?.pending;
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
    });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Sign-in methods</h1>
      {(notice || outcome) && <p role="status" className="mb-3">{notice || outcome}</p>}
      {statusError ? <p role="alert">{statusError}</p> :
        !status ? <p role="status">Loading…</p> :
        !status.enabled ? <p>Google sign-in is currently unavailable.</p> :
        !status.signedIn ? <p><Link className="underline" href="/login">Sign in</Link> to manage your sign-in methods.</p> : (
          <div className="space-y-4">
            <p>{status.linked ? "Google is connected to your account." : "Connect Google to use it as another way to sign in."}</p>
            {status.hasPassword || pending?.kind === "password" ? (
              <form className="space-y-3" onSubmit={submit}>
                {pending?.kind === "password" && <VerificationCode email={pending.email} />}
                <label className="block">
                  {pending?.kind === "password" ? "New password" : "Current password"}
                  <input className={inputClass} type="password" name="password" autoComplete={pending?.kind === "password" ? "new-password" : "current-password"}
                    minLength={pending?.kind === "password" ? 8 : undefined} maxLength={128} required />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className={buttonClass} disabled={busy}>
                    {busy ? "Working…" : pending?.kind === "password" ? "Save password" : status.linked ? "Disconnect Google" : "Connect Google"}
                  </button>
                  {pending?.kind === "password" && <button className={buttonClass} type="button" disabled={busy} onClick={() => void run(async () => {
                    await request("cancel", {});
                    setStatus(await request<Status>("status"));
                  })}>Cancel</button>}
                </div>
              </form>
            ) : (
              <>
                <p>Set a password before disconnecting Google. You’ll confirm your Google account and verify your email address.</p>
                <button type="button" className={buttonClass} disabled={busy} onClick={() => void run(() => openGoogle({ intent: "password" }))}>
                  {busy ? "Opening Google…" : "Verify with Google to set a password"}
                </button>
              </>
            )}
            {error && <p role="alert">{error}</p>}
          </div>
        )}
    </main>
  );
}
