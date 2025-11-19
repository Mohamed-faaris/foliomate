import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise, { dbName } from "~/lib/db";
import nodemailer from "nodemailer";
import { env } from "~/env";
import type { BetterAuthUser } from "~/types";

const client = await clientPromise;
const db = client.db(dbName);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_PASS,
  },
});

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: BetterAuthUser;
      url: string;
    }) => {
      await transporter.sendMail({
        from: `"Foliomate" <${env.GMAIL_USER}>`,
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Click the link below to verify your email address:</p><a href="${url}">${url}</a>`,
      });
    },
  },
  passwordReset: {
    sendResetPassword: async ({ user, url }: { user: BetterAuthUser; url: string }) => {
      await transporter.sendMail({
        from: `"Foliomate" <${env.GMAIL_USER}>`,
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click the link below to reset your password:</p><a href="${url}">${url}</a>`,
      });
    },
  },
});

export type Session = typeof auth.$Infer.Session;
