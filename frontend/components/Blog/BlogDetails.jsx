"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const normalizeImageSrc = (src) => {
  if (!src) {
    return "";
  }

  if (/^(https?:|data:|blob:|\/)/.test(src)) {
    return src;
  }

  return `/${src}`;
};

const BlogDetails = ({ slug, initialBlog }) => {
  const [blog, setBlog] = useState(initialBlog || null);
  const [loading, setLoading] = useState(!initialBlog);
  const [error, setError] = useState("");

  // Fetch blog only as a fallback when server data is not available.
  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/blogs/${encodeURIComponent(slug)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Blog not found");
      }

      setBlog(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Blog not found"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Server-side blog data already exists, so do not fetch again.
    if (initialBlog) {
      setBlog(initialBlog);
      setLoading(false);
      return;
    }

    // Fallback client-side fetch only when server data is missing.
    if (slug) {
      fetchBlogDetails();
    }
  }, [slug, initialBlog]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="font-[Poppins] text-sm text-gray-500">
          Loading blog...
        </p>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <h1 className="font-[Bebas_Neue] text-5xl text-[#1d2b3a]">
            Blog Not Found
          </h1>

          <p className="mt-3 font-[Poppins] text-sm text-gray-500">
            {error ||
              "The blog you are looking for is not available."}
          </p>

          <Link
            href="/blog"
            className="mt-6 inline-block rounded-full bg-[#ff6b2c] px-6 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a]"
          >
            Back To Blogs
          </Link>
        </div>
      </section>
    );
  }

  const coverImage = normalizeImageSrc(blog.coverImage);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative flex h-[420px] items-end overflow-hidden bg-[#1d2b3a] md:h-[520px]">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={blog.title}
            fill
            sizes="100vw"
            quality={75}
            className="object-cover"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 font-[Poppins] text-sm font-medium text-white transition hover:bg-white hover:text-[#1d2b3a]"
          >
            ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Back To Blogs
          </Link>

          <p className="mb-4 font-[Poppins] text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6b2c]">
            {blog.date}
          </p>

          <h1 className="max-w-4xl font-[Bebas_Neue] text-4xl leading-tight tracking-wide text-white sm:text-5xl md:text-6xl">
            {blog.title}
          </h1>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            className="blog-content font-[Lato] text-base leading-8 text-gray-700 md:text-lg"
            dangerouslySetInnerHTML={{
              __html: blog.content,
            }}
          />

          <div className="mt-12 border-t border-gray-200 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff6b2c] px-7 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a]"
            >
             Back To Blog Page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetails;
