import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/server/better-auth/server";
import { Package, Eye, Bell, TrendingUp, ArrowRight, Plus } from "lucide-react";

import { api } from "@/trpc/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}! Here&apos;s an overview of your account.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/sell/list">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsGrid userId={session.user.id} />
      </Suspense>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
        <QuickActionCard
          href="/account/my-listings"
          title="Manage Listings"
          description="View and edit your equipment listings"
          icon={Package}
        />
        <QuickActionCard
          href="/account/watching"
          title="Watched Items"
          description="Track listings you're interested in"
          icon={Eye}
        />
        <QuickActionCard
          href="/account/notifications"
          title="Notifications"
          description="Check your offers and updates"
          icon={Bell}
        />
      </div>

      {/* Recent Activity */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </div>
            <Link href="/account/notifications">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RecentActivityList userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function StatsGrid({ userId }: { userId: string }) {
  try {
    const stats = await api.account.getStats();

    type StatsType = {
      activeListings: number;
      watchedCount: number;
      pendingOffers: number;
      unreadNotifications: number;
    };

    const typedStats = stats as StatsType;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        <StatCard
          title="Active Listings"
          value={typedStats.activeListings}
          icon={Package}
          trend="+12%"
          trendUp
        />
        <StatCard
          title="Watched Items"
          value={typedStats.watchedCount}
          icon={Eye}
        />
        <StatCard
          title="Pending Offers"
          value={typedStats.pendingOffers}
          icon={TrendingUp}
        />
        <StatCard
          title="Unread Notifications"
          value={typedStats.unreadNotifications}
          icon={Bell}
        />
      </div>
    );
  } catch {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trend} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-yellow-500/20 hover:border-yellow-500">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

async function RecentActivityList({ userId }: { userId: string }) {
  try {
    const { notifications } = await api.account.getNotifications({
      page: 1,
      pageSize: 5,
    });

    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No recent activity</p>
          <Link href="/sell/list">
            <Button variant="link" size="sm">
              Create your first listing
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notifications.map((notification: { id: string; title: string; message: string; createdAt: Date; read: boolean }) => (
          <div
            key={notification.id}
            className="flex items-start gap-4 rounded-lg border p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!notification.read && (
              <Badge variant="secondary" className="shrink-0">
                New
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  } catch {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Unable to load recent activity
      </div>
    );
  }
}
