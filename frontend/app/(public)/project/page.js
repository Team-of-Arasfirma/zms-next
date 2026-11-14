import { withPageSeo } from "@/lib/pageSeo";
import Project from '@/components/Project/project';

const fallbackMetadata = {
  alternates: {
    canonical: "https://www.zmsipl.com/project",
  },
};

export default function ProjectPage() {
  return <Project />;
}

export async function generateMetadata() {
  return withPageSeo('/project', fallbackMetadata);
}
