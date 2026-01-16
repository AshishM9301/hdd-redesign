# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## Environment Variables

This project uses [@t3-oss/env-nextjs](https://env.t3.gg/) for type-safe environment variable validation. All environment variables are validated at build time and runtime to ensure type safety and prevent configuration errors.

### Quick Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all required environment variables in `.env`

3. The application will validate all environment variables on startup

### Required Variables

#### Authentication (Better Auth)
- `BETTER_AUTH_SECRET` - Secret key for Better Auth (optional in development, required in production)
  - Generate: `openssl rand -base64 32`
- `BETTER_AUTH_GITHUB_CLIENT_ID` - GitHub OAuth Client ID
  - Get from: [GitHub Developer Settings](https://github.com/settings/developers)
- `BETTER_AUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret
  - Get from: [GitHub Developer Settings](https://github.com/settings/developers)

#### Database
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`

#### Application
- `NODE_ENV` - Environment mode: `development`, `test`, or `production`
  - Default: `development`

### Storage Provider Configuration

The application supports multiple storage providers for file uploads. Configure which provider to use with the `STORAGE_PROVIDER` variable.

#### Storage Provider Selection
- `STORAGE_PROVIDER` - Storage provider to use: `firebase` or `aws`
  - Default: `firebase`

**Important:** The required variables depend on your selected storage provider. See the sections below for provider-specific requirements.

### Firebase Storage Setup

Firebase Storage is the default and recommended storage provider. These variables are **required** when `STORAGE_PROVIDER=firebase` or in production.

#### Step 1: Get Firebase Project ID
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) > **General**
4. Copy the **Project ID**

Set `FIREBASE_PROJECT_ID` to this value.

#### Step 2: Get Firebase Storage Bucket
1. In Firebase Console, go to **Storage**
2. If Storage isn't enabled, click **Get Started** and follow the setup
3. The bucket name is shown at the top (format: `your-project-id.appspot.com`)

Set `FIREBASE_STORAGE_BUCKET` to this value.

#### Step 3: Generate Service Account Key
1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Confirm the download (this creates a JSON file)
4. **Important:** You need to stringify this JSON for the environment variable:
   - Open the downloaded JSON file
   - Remove all newlines and format it as a single line
   - Escape any quotes if necessary
   - Paste the entire stringified JSON as the value for `FIREBASE_SERVICE_ACCOUNT_KEY`

Example format:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Firebase Variables:**
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket name
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Stringified JSON service account key

**Documentation:** [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### AWS S3 Storage Setup (Future/Optional)

AWS S3 storage is available as an alternative storage provider. These variables are **required** when `STORAGE_PROVIDER=aws`.

> **Note:** AWS S3 support is implemented but may require additional testing. Firebase Storage is recommended for production use.

#### Step 1: Create AWS Account
1. Sign up at [AWS](https://aws.amazon.com/) if you don't have an account
2. Complete the account setup process

#### Step 2: Create IAM User with S3 Permissions
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** > **Add users**
3. Create a user (e.g., `s3-storage-user`)
4. Attach the `AmazonS3FullAccess` policy (or create a custom policy with S3 read/write permissions)
5. After creating the user, go to **Security credentials** tab
6. Click **Create access key**
7. Select **Application running outside AWS**
8. **Important:** Copy both the **Access Key ID** and **Secret Access Key** immediately (the secret is only shown once)

Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to these values.

#### Step 3: Create S3 Bucket
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Choose a unique bucket name (globally unique across all AWS accounts)
4. Select a region (e.g., `us-east-1`)
5. Configure bucket settings as needed
6. Create the bucket

Set `AWS_S3_BUCKET_NAME` to your bucket name and `AWS_REGION` to your selected region.

**AWS Variables:**
- `AWS_ACCESS_KEY_ID` - IAM user access key ID
- `AWS_SECRET_ACCESS_KEY` - IAM user secret access key
- `AWS_REGION` - AWS region (e.g., `us-east-1`, `us-west-2`, `eu-west-1`)
- `AWS_S3_BUCKET_NAME` - S3 bucket name

**Documentation:** 
- [AWS S3 Getting Started](https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html)
- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

### Conditional Requirements

The environment validation system automatically enforces requirements based on your configuration:

- **When `STORAGE_PROVIDER=firebase` or in production:**
  - All Firebase variables are required
  - AWS variables are optional

- **When `STORAGE_PROVIDER=aws`:**
  - All AWS variables are required
  - Firebase variables are optional (unless in production)

- **In development with `STORAGE_PROVIDER=firebase`:**
  - Firebase variables are still required (recommended for testing)

### Validation Errors

If you see validation errors on startup, check:
1. All required variables for your selected `STORAGE_PROVIDER` are set
2. Variable values are correctly formatted (no extra spaces, proper JSON stringification for Firebase)
3. You're not missing any required variables for your environment (`NODE_ENV`)

The error messages will indicate which variables are missing or invalid.

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
