import JobApply from "@/components/Career/JobApply";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Career Application",
  description:
    "Apply for current career opportunities at Zaron Metal Sections India Private Limited.",
};

export default async function CareerApplyPage({ params }) {
  // Next.js 16 route params must be awaited.
  const { jobId } = await params;

  return <JobApply jobId={jobId} />;
}