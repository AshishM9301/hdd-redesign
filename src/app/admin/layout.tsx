import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Show 403 if not admin
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">403</h1>
          <p className="text-muted-foreground mb-4 text-lg">
            Access Forbidden
          </p>
          <p className="text-muted-foreground text-sm">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const pendingUploadRequests = await db.mediaUploadRequest.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/admin/listings"
              className="rounded-md px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              Listings
            </Link>
            <Link
              href="/admin/upload-requests"
              className="rounded-md px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              <span className="flex items-center gap-2">
                Upload Requests
                {pendingUploadRequests > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-900"
                  >
                    {pendingUploadRequests}
                  </Badge>
                )}
              </span>
            </Link>
          </nav>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

