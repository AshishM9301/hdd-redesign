import { redirect } from "next/navigation";

import { HydrateClient, api } from "@/trpc/server";
import { getSession } from "@/server/better-auth/server";
import MyUploadRequestsClient from "./_components/request-list";

export default async function MyUploadRequestsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  void api.mediaUpload.getMyUploadRequests.prefetch();

  return (
    <HydrateClient>
      <MyUploadRequestsClient />
    </HydrateClient>
  );
}

