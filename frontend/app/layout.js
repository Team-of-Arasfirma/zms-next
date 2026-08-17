import Script from "next/script";
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
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KMZ73DX2');
        `}
      </Script>

      <body className="bg-white text-[#171717]">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KMZ73DX2"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}