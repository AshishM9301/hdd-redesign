import { HydrateClient } from "@/trpc/server";
import AnonymousCancelClient from "./_components/anonymous-cancel";

type PageProps = {
  searchParams?: { token?: string };
};

export default function UploadRequestCancelPage({ searchParams }: PageProps) {
  const tokenParam = searchParams?.token;
  const initialToken = typeof tokenParam === "string" ? tokenParam : "";

  return (
    <HydrateClient>
      <AnonymousCancelClient initialToken={initialToken} />
    </HydrateClient>
  );
}

