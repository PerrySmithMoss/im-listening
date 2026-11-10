import Head from "next/head";
import type { ReactNode } from "react";
import { Navbar } from "../Navbar/Navbar";

export const supportEmail = "imlistening.emails@gmail.com";

export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Head><title>{title} | I&apos;m Listening</title></Head>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-8">
        <header>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-sm">Updated 10 November 2026</p>
        </header>
        {children}
      </main>
    </>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 leading-relaxed">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
