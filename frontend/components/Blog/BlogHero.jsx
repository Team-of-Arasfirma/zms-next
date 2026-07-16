function Blog() {
  return (
    <>
      {/* Blog Hero Section Without Image */}
      <section className="relative w-full min-h-[560px] overflow-hidden bg-[#f7f7f7]">
        {/* Background Vector Shapes */}
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#ff6b2c]/15 blur-3xl"></div>
        <div className="absolute right-[-100px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-[#1d2b3a]/10 blur-3xl"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#1d2b3a_1px,transparent_1px),linear-gradient(to_bottom,#1d2b3a_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-20">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              <p className="mb-4 font-[Lato] text-sm uppercase tracking-[4px] text-[#ff6b2c] md:text-base">
                ZMS Insights
              </p>

              <h1 className="font-[Bebas_Neue] text-[62px] leading-[0.9] tracking-wide text-[#1d2b3a] md:text-[95px] lg:text-[115px]">
                Latest News <br />
                And Articles
              </h1>

              <p className="mt-6 max-w-2xl font-[Lato] text-base leading-relaxed text-gray-600 md:text-lg">
                Explore our latest blogs, fabrication updates, construction
                insights, and structural engineering knowledge from Zaron Metal
                Sections.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#blogs"
                  className="rounded-full bg-[#ff6b2c] px-7 py-3 font-[Poppins] text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1d2b3a]"
                >
                  Read Blogs
                </a>

                
              </div>
            </div>

            {/* Right Vector Illustration */}
            <div className="relative mx-auto flex h-[360px] w-full max-w-[460px] items-center justify-center">
              {/* Orange Circle */}
              <div className="absolute h-[300px] w-[300px] rounded-full bg-[#ff6b2c]/15"></div>

              {/* Main Document Card */}
              <div className="relative z-10 w-[280px] rounded-[28px] border border-black/10 bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#ff6b2c]"></span>
                  <span className="h-3 w-3 rounded-full bg-gray-300"></span>
                  <span className="h-3 w-3 rounded-full bg-gray-300"></span>
                </div>

                <div className="mb-4 h-5 w-40 rounded-full bg-[#1d2b3a]"></div>
                <div className="mb-3 h-3 w-full rounded-full bg-gray-200"></div>
                <div className="mb-3 h-3 w-[90%] rounded-full bg-gray-200"></div>
                <div className="mb-6 h-3 w-[70%] rounded-full bg-gray-200"></div>

                <div className="h-28 rounded-[20px] bg-[#ff6b2c]/15"></div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="h-3 w-20 rounded-full bg-gray-200"></div>
                  <div className="h-9 w-9 rounded-full bg-[#ff6b2c]"></div>
                </div>
              </div>

              {/* Floating Small Card */}
              <div className="absolute right-0 top-8 z-20 rounded-2xl bg-white px-5 py-4 shadow-xl">
                <p className="font-[Bebas_Neue] text-[36px] leading-none text-[#ff6b2c]">
                  BLOG
                </p>
                <p className="font-[Poppins] text-xs text-gray-500">
                  Latest Updates
                </p>
              </div>

              {/* Floating Icon Box */}
              <div className="absolute bottom-10 left-0 z-20 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1d2b3a] shadow-xl">
                <span className="text-3xl text-white">?</span>
              </div>

              {/* Decorative Lines */}
              <div className="absolute left-8 top-8 h-16 w-16 rounded-full border-4 border-[#ff6b2c]/30"></div>
              <div className="absolute bottom-0 right-12 h-24 w-24 rounded-full border border-[#1d2b3a]/20"></div>
            </div>
          </div>
        </div>

        {/* Bottom White Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block h-[70px] w-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>
    </>
  );
}

export default Blog;