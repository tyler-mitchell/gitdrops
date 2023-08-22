import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  server: {
    GITHUB_ACCESS_TOKEN: z.string().optional(),
  },
  client: {
    VITE_CLERK_PUBLISHABLE_KEY: z.string(),
    VITE_FIREBASE_API_KEY: z.string(),
    VITE_FIREBASE_AUTH_DOMAIN: z.string(),
    VITE_FIREBASE_PROJECT_ID: z.string(),
    VITE_FIREBASE_STORAGE_BUCKET: z.string(),
    VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
    VITE_FIREBASE_APP_ID: z.string(),
  },
  runtimeEnv: import.meta.env,
});

type Env = typeof env;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
