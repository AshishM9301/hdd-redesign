"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function ChangeEmailPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const changeEmail = api.account.changeEmail.useMutation({
    onSuccess: () => {
      toast.success("Email changed successfully");
      router.refresh();
      setNewEmail("");
      setPassword("");
      setConfirmEmail("");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to change email");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newEmail !== confirmEmail) {
      toast.error("Email addresses do not match");
      return;
    }

    changeEmail.mutate({
      newEmail,
      password,
    });
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Email</h1>
          <p className="text-muted-foreground">Update your email address</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Please log in to change your email</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Change Email</h1>
        <p className="text-muted-foreground">Update your email address</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Change your email address. You will need to verify the new email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg border bg-muted/50 p-4">
            <p className="text-sm">
              <span className="font-medium">Current email:</span> {user.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email"
                required
                disabled={changeEmail.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail">Confirm New Email</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Confirm your new email"
                required
                disabled={changeEmail.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Current Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                disabled={changeEmail.isPending}
              />
              <p className="text-xs text-muted-foreground">
                For security, please enter your current password to confirm this
                change.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={changeEmail.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changeEmail.isPending}>
                {changeEmail.isPending ? "Changing..." : "Change Email"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-800">Important</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800">
          <ul className="list-disc space-y-1 pl-4">
            <li>You will be logged out after changing your email</li>
            <li>You may need to verify your new email address</li>
            <li>Some features may be temporarily unavailable</li>
            <li>Make sure you have access to both old and new email addresses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

