"use client";

import * as React from "react";
import { Home, Package, Eye, Bell, Settings, HelpCircle, ShoppingBag, MapPin, Lock } from "lucide-react";
import { createAuthClient } from "better-auth/react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const accountNavItems = [
  {
    title: "Dashboard",
    href: "/account",
    icon: Home,
  },
  {
    title: "My Listings",
    href: "/account/my-listings",
    icon: Package,
  },
  {
    title: "Watching",
    href: "/account/watching",
    icon: Eye,
  },
  {
    title: "Notifications",
    href: "/account/notifications",
    icon: Bell,
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/account/settings",
    icon: Settings,
    subItems: [
      {
        title: "Profile",
        href: "/account/profile",
        icon: Settings,
      },
      {
        title: "Change Email",
        href: "/account/change-email",
        icon: Settings,
      },
      {
        title: "Change Password",
        href: "/account/change-password",
        icon: Lock,
      },
    ],
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

// Create auth client once outside component
const authClient = createAuthClient();

export function AccountSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [session, setSession] = React.useState<{
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  } | null>(null);

  React.useEffect(() => {
    void authClient.getSession().then((data) => {
      if (data && typeof data === "object" && "user" in data && data.user) {
        const user = data.user as { id: string; name: string | null; email: string; image?: string | null };
        setSession({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
          },
        });
      } else {
        setSession(null);
      }
    });
  }, []);

  const user = session?.user;

  return (
    <Sidebar collapsible="offcanvas" {...props} className="relative">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <ShoppingBag className="size-5!" />
                <span className="text-base font-semibold">HDD Market</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* User Info */}
        {user && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                <AvatarFallback>
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1 px-2 py-1">
          {accountNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/account" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-yellow-500/20 text-yellow-500-foreground"
                    : "text-muted-foreground hover:bg-yellow-500 hover:text-yellow-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-2" />

        {/* Bottom Navigation */}
        <nav className="space-y-1 px-2 pb-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href ||
              item.subItems?.some(sub => pathname === sub.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-yellow-500/20 text-yellow-500-foreground"
                      : "text-muted-foreground hover:bg-yellow-500 hover:text-yellow-50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
                {item.subItems && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                            isSubActive
                              ? "text-yellow-500 font-medium"
                              : "text-muted-foreground hover:text-yellow-500"
                          )}
                        >
                          <subItem.icon className="h-3 w-3" />
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/sell">
              <Button variant="outline" className="w-full" size="sm">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Sell
              </Button>
            </Link>
            <Link href="/buy">
              <Button variant="outline" className="w-full" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                Buy
              </Button>
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

