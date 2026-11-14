import { withPageSeo } from "@/lib/pageSeo";
import Career from '@/components/Career/Career';

const fallbackMetadata = {
  alternates: {
    canonical: "https://www.zmsipl.com/career",
  },
};

export default function CareerPage() {
  return <Career />;
}

export async function generateMetadata() {
  return withPageSeo('/career', fallbackMetadata);
}
