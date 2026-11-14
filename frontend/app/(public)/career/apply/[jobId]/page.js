import { withPageSeo } from "@/lib/pageSeo";
import JobApply from "@/components/Career/JobApply";

export const dynamic = "force-dynamic";

const fallbackMetadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Career Application",
  description:
    "Apply for current career opportunities at Zaron Metal Sections India Private Limited.",
};

export default async function CareerApplyPage({ params }) {
  // Next.js 16 route params must be awaited.
  const { jobId } = await params;

  return <JobApply jobId={jobId} />;
}
export async function generateMetadata({ params }) {
  const { jobId } = await params;
  return withPageSeo(`/career/apply/${jobId}`, fallbackMetadata);
}
