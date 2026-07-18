"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const normalizeImageSrc = (src) => {
  if (!src) {
    return "";
  }

  if (/^(https?:|data:|blob:|\/)/.test(src)) {
    return src;
  }

  return `/${src}`;
};

const BlogCards = ({ initialBlogs = [] }) => {
  const blogs = Array.isArray(initialBlogs)
    ? initialBlogs.filter((blog) => blog.status === "Published")
    : [];

  return (
    <section
      id="blogs"
      className="w-full bg-[#f7f7f7] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6b2c]">
            Our Blogs
          </p>

          <h2 className="mt-3 font-[Bebas_Neue] text-4xl tracking-wide text-[#1d2b3a] sm:text-5xl md:text-6xl">
            Latest News & Articles
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-[Lato] text-base leading-7 text-gray-600">
            Explore our latest updates, construction insights, and steel
            structure solutions for modern industrial projects.
          </p>
        </div>

        {blogs.length === 0 ? (
          <p className="text-center font-[Poppins] text-sm text-gray-500">
            No blogs added yet.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => {
              const coverImage = normalizeImageSrc(blog.coverImage);

              return (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                  }}
                  viewport={{ once: true }}
                  className="group overflow-hidden rounded-[22px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)]"
                >
                  <div className="relative h-[240px] w-full overflow-hidden">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        quality={70}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : null}
                  </div>

                  <div className="p-6">
                    <p className="mb-3 font-[Poppins] text-sm font-medium text-[#ff6b2c]">
                      {blog.date}
                    </p>

                    <h3 className="font-['DM_Serif_Display'] text-2xl leading-snug text-[#1d2b3a] transition-colors duration-300 group-hover:text-[#ff6b2c]">
                      {blog.title}
                    </h3>

                    <p className="mt-4 font-[Poppins] text-sm leading-7 text-gray-600">
                      {blog.excerpt || "Read more about this article."}
                    </p>

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff6b2c] px-6 py-3 font-[Poppins] text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1d2b3a]"
                    >
                      Read More

                      <span className="text-lg leading-none">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogCards;
