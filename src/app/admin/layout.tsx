import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { db } from "@/server/db";

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
  if (!user || user.role !== "admin") {
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

  return <>{children}</>;
}

