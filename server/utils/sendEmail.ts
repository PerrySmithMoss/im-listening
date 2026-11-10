import nodemailer from "nodemailer";
import type { loadConfig } from "../src/config";

export function createMailer({ smtp, clientOrigin }: ReturnType<typeof loadConfig>) {
  if (!smtp) return undefined;
  const { from, ...options } = smtp;
  const transporter = nodemailer.createTransport({
    ...options,
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  }, {
    from: { name: "I'm Listening", address: from },
  });

  const sendReset = async (email: string, token: string) => {
    const url = new URL(`/change-password/${token}`, clientOrigin);
    await transporter.sendMail({
      to: { name: "", address: email },
      subject: "Reset your I'm Listening password",
      text: `Use this link within one hour to reset your password: ${url.href}`,
    });
  };

  return {
    sendReset,
    async sendVerification(email: string, code: string) {
      await transporter.sendMail({
        to: { name: "", address: email },
        subject: "Verify your email for I'm Listening",
        text: `Your I'm Listening verification code is ${code}. It expires in 10 minutes. Only enter it on I'm Listening.`,
      });
    },
  };
}
