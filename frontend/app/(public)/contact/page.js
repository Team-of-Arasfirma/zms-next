import { withPageSeo } from "@/lib/pageSeo";
import Contact from '@/components/Contact/Contact';

const fallbackMetadata = {
  alternates: {
    canonical: "https://www.zmsipl.com/contact",
  },
};

export default function ContactPage() {
  return <Contact />;
}

export async function generateMetadata() {
  return withPageSeo('/contact', fallbackMetadata);
}
