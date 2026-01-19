import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

// Define server schema with conditional validation
const serverSchema = z
  .object({
    BETTER_AUTH_SECRET: isProduction
      ? z.string()
      : z.string().optional(),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // Email (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM: z.string().email().optional(),
    ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
    SITE_URL: z.string().url().optional(),
    STORAGE_PROVIDER: z.enum(["firebase", "aws", "railway"]).default("railway"),
    // Firebase variables - optional in development, required when STORAGE_PROVIDER is "firebase" or in production
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
    FIREBASE_SERVICE_ACCOUNT_KEY: z.string().min(1).optional(),
    // AWS variables - optional for now, required when STORAGE_PROVIDER is "aws"
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET_NAME: z.string().optional(),
    // Railway S3-compatible storage
    RAILWAY_S3_ENDPOINT: z.string().url().optional(),
    RAILWAY_S3_REGION: z.string().optional(),
    RAILWAY_S3_BUCKET: z.string().optional(),
    RAILWAY_S3_ACCESS_KEY_ID: z.string().optional(),
    RAILWAY_S3_SECRET_ACCESS_KEY: z.string().optional(),
    // Cron job security
    CRON_SECRET: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const storageProvider = data.STORAGE_PROVIDER ?? "railway";
    const isProd = data.NODE_ENV === "production";

    // Validate Firebase variables when STORAGE_PROVIDER is "firebase" or in production
    if (storageProvider === "firebase" || isProd) {
      if (!data.FIREBASE_PROJECT_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "FIREBASE_PROJECT_ID is required when STORAGE_PROVIDER is 'firebase' or in production",
          path: ["FIREBASE_PROJECT_ID"],
        });
      }
      if (!data.FIREBASE_STORAGE_BUCKET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "FIREBASE_STORAGE_BUCKET is required when STORAGE_PROVIDER is 'firebase' or in production",
          path: ["FIREBASE_STORAGE_BUCKET"],
        });
      }
      if (!data.FIREBASE_SERVICE_ACCOUNT_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "FIREBASE_SERVICE_ACCOUNT_KEY is required when STORAGE_PROVIDER is 'firebase' or in production",
          path: ["FIREBASE_SERVICE_ACCOUNT_KEY"],
        });
      }
    }

    // Validate AWS variables when STORAGE_PROVIDER is "aws"
    if (storageProvider === "aws") {
      if (!data.AWS_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "AWS_ACCESS_KEY_ID is required when STORAGE_PROVIDER is 'aws'",
          path: ["AWS_ACCESS_KEY_ID"],
        });
      }
      if (!data.AWS_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "AWS_SECRET_ACCESS_KEY is required when STORAGE_PROVIDER is 'aws'",
          path: ["AWS_SECRET_ACCESS_KEY"],
        });
      }
      if (!data.AWS_REGION) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "AWS_REGION is required when STORAGE_PROVIDER is 'aws'",
          path: ["AWS_REGION"],
        });
      }
      if (!data.AWS_S3_BUCKET_NAME) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "AWS_S3_BUCKET_NAME is required when STORAGE_PROVIDER is 'aws'",
          path: ["AWS_S3_BUCKET_NAME"],
        });
      }
    }

    // Validate Railway variables when STORAGE_PROVIDER is "railway"
    if (storageProvider === "railway") {
      const missingFields = [];
      if (!data.RAILWAY_S3_ENDPOINT) missingFields.push("RAILWAY_S3_ENDPOINT");
      if (!data.RAILWAY_S3_REGION) missingFields.push("RAILWAY_S3_REGION");
      if (!data.RAILWAY_S3_BUCKET) missingFields.push("RAILWAY_S3_BUCKET");
      if (!data.RAILWAY_S3_ACCESS_KEY_ID) {
        missingFields.push("RAILWAY_S3_ACCESS_KEY_ID");
      }
      if (!data.RAILWAY_S3_SECRET_ACCESS_KEY) {
        missingFields.push("RAILWAY_S3_SECRET_ACCESS_KEY");
      }

      for (const field of missingFields) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} is required when STORAGE_PROVIDER is 'railway'`,
          path: [field],
        });
      }
    }
  });

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: serverSchema.shape,

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET:
      process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
    SITE_URL: process.env.SITE_URL,
    RAILWAY_S3_ENDPOINT: process.env.RAILWAY_S3_ENDPOINT,
    RAILWAY_S3_REGION: process.env.RAILWAY_S3_REGION,
    RAILWAY_S3_BUCKET: process.env.RAILWAY_S3_BUCKET,
    RAILWAY_S3_ACCESS_KEY_ID: process.env.RAILWAY_S3_ACCESS_KEY_ID,
    RAILWAY_S3_SECRET_ACCESS_KEY: process.env.RAILWAY_S3_SECRET_ACCESS_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

// Apply conditional validation after createEnv
// This ensures the validation runs with the actual runtime values
if (!process.env.SKIP_ENV_VALIDATION) {
  try {
    serverSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.flatten().fieldErrors;
      console.error("❌ Invalid environment variables:", formattedErrors);
      throw new Error(
        `Invalid environment variables: ${JSON.stringify(formattedErrors, null, 2)}`,
      );
    }
    throw error;
  }
}
