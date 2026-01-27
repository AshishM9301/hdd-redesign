"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Tag,
  Trash2,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type NotificationType = "all" | "offer" | "message" | "system" | "price_drop";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<NotificationType>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const {
    data,
    isLoading,
    refetch,
  } = api.account.getNotifications.useQuery({
    page,
    pageSize: 20,
    type: typeFilter === "all" ? undefined : typeFilter,
    unreadOnly: showUnreadOnly,
  }, {
    enabled: isAuthenticated,
  });

  const markAsRead = api.account.markNotificationRead.useMutation({
    onSuccess: () => {
      toast.success("Notification marked as read");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to mark notification as read");
    },
  });

  const handleTypeChange = (value: string) => {
    setTypeFilter(value as NotificationType);
    setPage(1);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "offer":
        return <Tag className="h-5 w-5 text-green-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "price_drop":
        return <Tag className="h-5 w-5 text-amber-600" />;
      case "listing_update":
        return <Package className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Please log in to view your notifications
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {data?.unreadCount ?? 0} unread notification
            {data?.unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowUnreadOnly(!showUnreadOnly);
              setPage(1);
            }}
          >
            Unread Only
          </Button>
        </div>
      </div>

      <Tabs value={typeFilter} onValueChange={handleTypeChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="offer">Offers</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="price_drop">Price Drops</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={typeFilter} className="mt-6">
          {(!data || data.notifications.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BellRing className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-center text-muted-foreground">
                  {showUnreadOnly
                    ? "You have no unread notifications"
                    : "You don't have any notifications yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-colors ${!notification.read ? "border-primary/50 bg-primary/5" : ""
                    }`}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{notification.title}</p>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead.mutate({ id: notification.id })}
                              disabled={markAsRead.isPending}
                            >
                              <CheckCheck className="mr-2 h-4 w-4" />
                              Mark Read
                            </Button>
                          )}
                          {notification.listingId && (
                            <Link href={`/listings/${notification.listingId}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

