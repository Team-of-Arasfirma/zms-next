import "./globals.css";

export const metadata = {
  title: {
    default: "ZMSIPL | Zaron Metal Sections",
    template: "%s | ZMSIPL",
  },
  description:
    "ZMSIPL provides high-quality solar mounting structures and metal section solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-white text-[#171717]">
        {children}
      </body>
    </html>
  );
}