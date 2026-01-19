/**
 * Firebase Admin SDK Configuration
 * 
 * Initializes Firebase Admin SDK with service account credentials
 * and provides access to the storage bucket instance.
 */

import { initializeApp, cert, type App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { env } from "@/env";

/**
 * Service account credentials interface
 */
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

let adminApp: App | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storageBucket: any = null;

/**
 * Initializes Firebase Admin SDK
 * 
 * @returns The initialized Firebase Admin app instance
 * @throws {Error} If initialization fails
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Parse service account key from environment variable
    const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is required but not provided",
      );
    }
    
    let serviceAccount: ServiceAccount;

    try {
      serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
    } catch (parseError) {
      throw new Error(
        `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError instanceof Error ? parseError.message : "Invalid JSON"}`,
      );
    }

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields: project_id, private_key, or client_email",
      );
    }

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert(serviceAccount as Parameters<typeof cert>[0]),
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });

    return adminApp;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during Firebase Admin initialization";
    console.error("Firebase Admin initialization failed:", errorMessage);
    throw new Error(`Firebase Admin initialization failed: ${errorMessage}`);
  }
}

/**
 * Gets the Firebase Storage bucket instance
 * 
 * @returns The storage bucket instance
 * @throws {Error} If bucket cannot be accessed
 */
export function getFirebaseBucket() {
  if (storageBucket) {
    return storageBucket;
  }

  try {
    // Ensure Firebase Admin is initialized
    if (!adminApp) {
      initializeFirebaseAdmin();
    }

    // Get storage bucket
    const bucketName = env.FIREBASE_STORAGE_BUCKET;
    storageBucket = getStorage(adminApp!).bucket(bucketName);

    if (!storageBucket) {
      throw new Error(`Failed to get storage bucket: ${bucketName}`);
    }

    return storageBucket;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error getting storage bucket";
    console.error("Failed to get Firebase Storage bucket:", errorMessage);
    throw new Error(`Failed to get Firebase Storage bucket: ${errorMessage}`);
  }
}

/**
 * Gets the Firebase Admin app instance
 * 
 * @returns The Firebase Admin app instance
 */
export function getFirebaseApp(): App {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return adminApp!;
}

// Initialize on module load
try {
  initializeFirebaseAdmin();
} catch (error) {
  // Don't throw on module load, allow lazy initialization
  console.warn(
    "Firebase Admin initialization deferred. Will initialize on first use.",
  );
}

