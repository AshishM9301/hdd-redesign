"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/server/better-auth/client";

export default function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const schema = React.useMemo(
    () =>
      z
        .object({
          firstName: z.string().trim().min(1, "First name is required."),
          lastName: z.string().trim().min(1, "Last name is required."),
          companyName: z
            .string()
            .trim()
            .max(120, "Company name is too long.")
            .optional()
            .or(z.literal("")),
          phoneNumber: z
            .string()
            .trim()
            .max(32, "Phone number is too long.")
            .optional()
            .or(z.literal("")),
          mobileNumber: z
            .string()
            .trim()
            .max(32, "Mobile number is too long.")
            .optional()
            .or(z.literal("")),
          email: z.string().trim().email("Enter a valid email address."),
          password: z
            .string()
            .min(8, "Password must be at least 8 characters."),
          confirmPassword: z.string().min(1, "Please confirm your password."),
          acceptTerms: z
            .boolean()
            .refine(
              (v) => v === true,
              "You must accept the Terms and Conditions.",
            ),
          subscribeNewsletter: z.boolean().optional(),
          captcha: z
            .boolean()
            .refine((v) => v === true, "Please confirm you are not a robot."),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match.",
          path: ["confirmPassword"],
        }),
    [],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      phoneNumber: "",
      mobileNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      subscribeNewsletter: true,
      captcha: false,
    },
    mode: "onSubmit",
  });

  const router = useRouter();
  const acceptTerms = watch("acceptTerms");
  const subscribeNewsletter = watch("subscribeNewsletter");
  const captcha = watch("captcha");

  const onSubmit = React.useCallback(
    async (data: FormValues) => {
      try {
        // Combine firstName and lastName into name
        const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

        // Prepare metadata for additional fields
        const metadata: Record<string, string> = {};
        if (data.companyName) {
          metadata.companyName = data.companyName;
        }
        if (data.phoneNumber) {
          metadata.phoneNumber = data.phoneNumber;
        }
        if (data.mobileNumber) {
          metadata.mobileNumber = data.mobileNumber;
        }
        if (data.subscribeNewsletter !== undefined) {
          metadata.subscribeNewsletter = String(data.subscribeNewsletter);
        }

        const result = await authClient.signUp.email({
          email: data.email,
          password: data.password,
          name: fullName,
          ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
        });

        if (result.error) {
          // Handle different error types
          if (result.error.code === "EMAIL_ALREADY_EXISTS") {
            setError("email", {
              message: "An account with this email already exists.",
            });
            toast.error("Email already registered");
          } else if (result.error.code === "WEAK_PASSWORD") {
            setError("password", {
              message: result.error.message ?? "Password is too weak.",
            });
            toast.error("Password is too weak");
          } else {
            setError("root", {
              message: result.error.message ?? "An error occurred during signup.",
            });
            toast.error(result.error.message ?? "Signup failed");
          }
          return;
        }

        // Success - redirect to login page
        toast.success("Account created successfully! Please log in.");
        router.push("/login");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred.";
        setError("root", { message: errorMessage });
        toast.error(errorMessage);
      }
    },
    [router, setError],
  );

  const handleGitHubSignup = React.useCallback(async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message ?? "GitHub signup failed");
        return;
      }

      // Handle redirect response
      if ("url" in result.data && result.data.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "GitHub signup failed";
      toast.error(errorMessage);
    }
  }, []);

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        {errors.root && (
          <div className="bg-destructive/15 text-destructive rounded-md border border-destructive/50 p-3 text-sm">
            {errors.root.message}
          </div>
        )}

        <Field orientation="responsive" data-invalid={!!errors.firstName}>
          <FieldLabel htmlFor="first-name">First Name *</FieldLabel>
          <FieldContent>
            <Input
              id="first-name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              disabled={isSubmitting}
              {...register("firstName")}
            />
            <FieldError errors={[errors.firstName]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.lastName}>
          <FieldLabel htmlFor="last-name">Last Name *</FieldLabel>
          <FieldContent>
            <Input
              id="last-name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              disabled={isSubmitting}
              {...register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.companyName}>
          <FieldLabel htmlFor="company-name">Company Name</FieldLabel>
          <FieldContent>
            <Input
              id="company-name"
              type="text"
              placeholder="Company Name"
              autoComplete="organization"
              aria-invalid={!!errors.companyName}
              disabled={isSubmitting}
              {...register("companyName")}
            />
            <FieldError errors={[errors.companyName]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.phoneNumber}>
          <FieldLabel htmlFor="phone-number">Phone Number</FieldLabel>
          <FieldContent>
            <Input
              id="phone-number"
              type="tel"
              placeholder="(555) 123-4567"
              autoComplete="tel"
              aria-invalid={!!errors.phoneNumber}
              disabled={isSubmitting}
              {...register("phoneNumber")}
            />
            <FieldError errors={[errors.phoneNumber]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.mobileNumber}>
          <FieldLabel htmlFor="mobile-number">Mobile Number</FieldLabel>
          <FieldContent>
            <Input
              id="mobile-number"
              type="tel"
              placeholder="(555) 123-4567"
              autoComplete="tel-national"
              aria-invalid={!!errors.mobileNumber}
              disabled={isSubmitting}
              {...register("mobileNumber")}
            />
            <FieldError errors={[errors.mobileNumber]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email Address *</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              {...register("email")}
            />
            <FieldDescription>
              We&apos;ll use this to contact you. We will not share your email
              with anyone else.
            </FieldDescription>
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password *</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              {...register("password")}
            />
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
            <FieldError errors={[errors.password]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirm-password">Confirm Password *</FieldLabel>
          <FieldContent>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />
            <FieldDescription>Please confirm your password.</FieldDescription>
            <FieldError errors={[errors.confirmPassword]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.acceptTerms}>
          <FieldLabel className="leading-snug">
            <span className="sr-only">Accept terms</span>
          </FieldLabel>
          <FieldContent>
            <div className="flex items-start gap-2">
              <Checkbox
                checked={acceptTerms}
                disabled={isSubmitting}
                onCheckedChange={(v) =>
                  setValue("acceptTerms", v === true, { shouldValidate: true })
                }
                aria-invalid={!!errors.acceptTerms}
              />
              <Label className="text-sm leading-snug font-normal">
                I have read the{" "}
                <a href="#" className="underline underline-offset-4">
                  Terms and Conditions
                </a>{" "}
                *
              </Label>
            </div>
            <FieldError errors={[errors.acceptTerms]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel className="leading-snug">
            <span className="sr-only">Newsletter</span>
          </FieldLabel>
          <FieldContent>
            <div className="flex items-start gap-2">
              <Checkbox
                checked={subscribeNewsletter}
                disabled={isSubmitting}
                onCheckedChange={(v) =>
                  setValue("subscribeNewsletter", v === true)
                }
              />
              <div className="flex flex-col gap-1">
                <Label className="text-sm leading-snug font-normal">
                  Sign up for our newsletter
                </Label>
                <FieldDescription>
                  Subscribers receive special offers and exclusive content
                </FieldDescription>
              </div>
            </div>
          </FieldContent>
        </Field>

        <Field orientation="responsive" data-invalid={!!errors.captcha}>
          <FieldLabel className="leading-snug">
            <span className="sr-only">Captcha</span>
          </FieldLabel>
          <FieldContent>
            <div className="border-input bg-muted/20 flex items-center justify-between rounded-md border px-4 py-5">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={captcha}
                  disabled={isSubmitting}
                  onCheckedChange={(v) =>
                    setValue("captcha", v === true, { shouldValidate: true })
                  }
                  aria-invalid={!!errors.captcha}
                />
                <span className="text-sm">I&apos;m not a robot</span>
              </div>
              <div className="text-muted-foreground text-xs">Captcha</div>
            </div>
            <FieldError errors={[errors.captcha]} />
          </FieldContent>
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={handleGitHubSignup}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
