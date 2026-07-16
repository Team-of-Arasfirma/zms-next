import JobApply from '@/components/Career/JobApply';

export default function CareerApplyPage({ params }) {
  return <JobApply jobId={params.jobId} />;
}
