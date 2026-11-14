import { withPageSeo } from "@/lib/pageSeo";
import About from '@/components/About us/about';

const fallbackMetadata = {
  alternates: {
    canonical: "https://www.zmsipl.com/about",
  },
};

export default function AboutPage() {
  return <About />;
}

export async function generateMetadata() {
  return withPageSeo('/about', fallbackMetadata);
}
