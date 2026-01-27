import Link from "next/link";
import { getSession } from "@/server/better-auth/server";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Eye,
  Bell,
  Shield,
  ArrowRight,
  Camera,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WelcomePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const features = [
    {
      icon: Package,
      title: "List Your Equipment",
      description:
        "Create detailed listings for your heavy equipment with photos, specifications, and pricing.",
    },
    {
      icon: Eye,
      title: "Watch & Track",
      description:
        "Save listings you're interested in and get notified about price drops and updates.",
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description:
        "Receive real-time notifications about offers, messages, and important updates.",
    },
    {
      icon: Shield,
      title: "Verified Listings",
      description:
        "Our assurance system helps buyers feel confident about their purchases.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Listing",
      description: "Add photos, specifications, and details about your equipment.",
    },
    {
      number: "2",
      title: "Connect with Buyers",
      description: "Receive offers and messages from interested buyers.",
    },
    {
      number: "3",
      title: "Complete the Sale",
      description: "Finalize the transaction securely through our platform.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Your Account, {session.user.name}!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You&apos;re all set to buy and sell heavy equipment. Here&apos;s a quick guide to get
          started.
        </p>
      </div>

      {/* Getting Started Steps */}
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.number} className="relative">
            <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {step.number}
            </div>
            <CardHeader>
              <CardTitle className="mt-2">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          What You Can Do
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Actions</CardTitle>
          <CardDescription>
            Get the most out of your account with these actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/sell/list">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4">
                <Camera className="h-6 w-6" />
                <span>List Equipment</span>
              </Button>
            </Link>
            <Link href="/buy">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4">
                <Eye className="h-6 w-6" />
                <span>Browse Listings</span>
              </Button>
            </Link>
            <Link href="/account/profile">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4">
                <MessageSquare className="h-6 w-6" />
                <span>Complete Profile</span>
              </Button>
            </Link>
            <Link href="/account/my-listings">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4">
                <Package className="h-6 w-6" />
                <span>View My Listings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Pro Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Add high-quality photos from multiple angles",
              "Include detailed specifications and condition notes",
              "Set competitive pricing based on market research",
              "Respond promptly to inquiries and offers",
              "Keep your profile information up to date",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center">
        <Link href="/account/my-listings">
          <Button size="lg">
            Go to My Listings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

