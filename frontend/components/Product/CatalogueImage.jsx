"use client";

import Image from "next/image";
import { useState } from "react";
import { catalogueImage } from "@/lib/productCatalogue";

export default function CatalogueImage({ src, alt, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" }) {
  const [failedSource, setFailedSource] = useState(null);
  const image = catalogueImage(src);
  if (!image || failedSource === image) {
    return <div className="flex h-full min-h-48 items-center justify-center bg-[#f7f4f1] p-6 text-sm text-gray-500">Image unavailable</div>;
  }
  return <Image src={image} alt={alt} fill sizes={sizes} unoptimized onError={() => setFailedSource(image)} className="object-contain p-4" />;
}