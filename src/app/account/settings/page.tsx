import Link from "next/link";
import { Settings, User, Mail, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settingsItems = [
  {
    title: "Profile",
    description: "Manage your personal information",
    href: "/account/profile",
    icon: User,
  },
  {
    title: "Change Email",
    description: "Update your email address",
    href: "/account/change-email",
    icon: Mail,
  },
  {
    title: "Change Password",
    description: "Secure your account with a new password",
    href: "/account/change-password",
    icon: Lock,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4">
        {settingsItems.map((item) => (
          <Card key={item.href} className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </div>
              <Link href={item.href}>
                <Button variant="ghost" size="sm">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

