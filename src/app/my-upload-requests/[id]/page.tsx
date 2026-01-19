import { redirect } from "next/navigation";

import { getSession } from "@/server/better-auth/server";
import { HydrateClient, api } from "@/trpc/server";
import UploadRequestDetailClient from "./_components/request-detail";

type UploadRequestDetailPageParams = {
  id: string;
};

type UploadRequestDetailPageProps = {
  params: Promise<UploadRequestDetailPageParams>;
};

export default async function UploadRequestDetailPage({
  params,
}: UploadRequestDetailPageProps) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const requestId = id;
  if (requestId) {
    void api.mediaUpload.getUploadRequest.prefetch({ requestId });
  }

  return (
    <HydrateClient>
      <UploadRequestDetailClient requestId={requestId} />
    </HydrateClient>
  );
}
