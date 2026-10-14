import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pumpgtm.com"),
  title: {
    default: "PumpGTM",
    template: "%s | PumpGTM",
  },
  description: "Find buyers and start better conversations.",
  icons: {
    icon: "/pumpgtm-mark.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
