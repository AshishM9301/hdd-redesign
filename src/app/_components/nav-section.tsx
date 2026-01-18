"use client";

import * as React from "react";
import Link from "next/link";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    label: "Buy",
    href: "/buy",
  },
  {
    label: "Sell",
    href: "/sell",
  },
  {
    label: "Go to Listing",
    href: "/listings/access",
  },
];

export default function NavSection() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const mainItems = navItems;

  return (
    <NavigationMenu
      viewport={isMobile}
      className="max-w-auto z-[10000] flex flex-1 justify-between"
    >
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuLink className="hover:bg-transparent" asChild>
            <Link href="/">
              <Image
                src="/images/header-logo.svg"
                alt="Logo"
                width={100}
                height={100}
              />
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuList className="flex-wrap">
        {mainItems.map((item) => (
          <NavigationMenuItem key={item.label} className="px-2">
            <NavigationMenuLink asChild>
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}

        {!isLoading && (
          <div className="flex h-5 items-center">
            <Separator orientation="vertical" className="mr-2" />
            {isAuthenticated && user ? (
              <NavigationMenuItem className="px-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.image ?? undefined}
                          alt={user.name ?? "User"}
                        />
                        <AvatarFallback>
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await signOut();
                        toast.success("Logged out successfully");
                        router.push("/");
                        router.refresh();
                      }}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            ) : (
              <>
                <NavigationMenuItem className="px-2">
                  <NavigationMenuLink asChild>
                    <Link href="/register">Register</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem className="px-2">
                  <NavigationMenuLink asChild>
                    <Link href="/login">Login</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </div>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
