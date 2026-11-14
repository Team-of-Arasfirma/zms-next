import { getCatalogue } from "@/lib/productCatalogue.server";
import { createProductSitemap } from "@/lib/productSitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Runtime public HTTP APIs only; never import backend models or database code.
    const xml = createProductSitemap(await getCatalogue());
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    // A failed catalogue request must not look like a valid, empty sitemap.
    return new Response("Product sitemap temporarily unavailable. Please retry later.", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "300",
        "X-Robots-Tag": "noindex",
      },
    });
  }
}