import { redirect } from "next/navigation";

import { getSession } from "@/server/better-auth/server";
import { HydrateClient, api } from "@/trpc/server";
import UploadRequestDetailClient from "./_components/request-detail";

type PageProps = {
  params: { id: string };
};

export default async function UploadRequestDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const requestId = params.id;
  if (requestId) {
    void api.mediaUpload.getUploadRequest.prefetch({ requestId });
  }

  return (
    <HydrateClient>
      <UploadRequestDetailClient requestId={requestId} />
    </HydrateClient>
  );
}

