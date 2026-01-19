import { HydrateClient } from "@/trpc/server";
import AnonymousCancelClient from "./_components/anonymous-cancel";

type UploadRequestCancelPageParams = {
  searchParams?: { token?: string };
};

type UploadRequestCancelPageProps = {
  params: Promise<UploadRequestCancelPageParams>;
};

export default async function UploadRequestCancelPage({
  params,
}: UploadRequestCancelPageProps) {
  const { searchParams } = await params;
  const tokenParam = searchParams?.token;
  const initialToken = typeof tokenParam === "string" ? tokenParam : "";

  return (
    <HydrateClient>
      <AnonymousCancelClient initialToken={initialToken} />
    </HydrateClient>
  );
}

