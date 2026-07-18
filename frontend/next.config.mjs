/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    qualities: [70, 75],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/jlb5c2cq/**",
      },
    ],
  },
};

export default nextConfig;