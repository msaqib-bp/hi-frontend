import { ComplaintDetail } from "@/components/complaint-detail";

/**
 * In this version of Next.js, `params` is a Promise and must be awaited before its
 * fields are read.
 */
export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComplaintDetail complaintId={id} />;
}
