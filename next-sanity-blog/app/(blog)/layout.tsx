import "../globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import {
  VisualEditing,
  toPlainText,
  type PortableTextBlock,
} from "next-sanity";
import { Inter } from "next/font/google";
import { draftMode } from "next/headers";

import AlertBanner from "./alert-banner";
import PortableText from "./portable-text";

import * as demo from "@/sanity/lib/demo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { settingsQuery } from "@/sanity/lib/queries";
import { resolveOpenGraphImage } from "@/sanity/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({
    query: settingsQuery,
    stega: false,
  });
  const title = settings?.title || demo.title;
  const description = settings?.description || demo.description;

  const ogImage = resolveOpenGraphImage(settings?.ogImage);
  let metadataBase: URL | undefined = undefined;
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined;
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await sanityFetch({ query: settingsQuery });
  const footer = data?.footer || [];
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang="en" className={`${inter.variable} bg-gray-100 text-gray-900`}>
      <body className="flex flex-col min-h-screen">
        <section className="w-full">
          <AlertBanner />
          <main className="container mx-auto max-w-3xl px-6 py-10 lg:px-12 lg:py-14 bg-white shadow-lg rounded-lg">
            {children}
          </main>
          <footer className="mt-10 bg-gray-800 text-white py-10">
            <div className="container mx-auto max-w-3xl text-center px-6">
              {footer.length > 0 ? (
                <PortableText
                  className="prose text-gray-300"
                  value={footer as PortableTextBlock[]}
                />
              ) : (
                <div className="flex flex-col items-center">
                  <h3 className="text-3xl font-semibold tracking-tight">
                    Thanks for Visiting
                  </h3>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a
                      href="/"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition"
                    >
                      Back to Home
                    </a>
                    <a
                      href="https://github.com/vercel/next.js/tree/canary/examples/cms-sanity"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              )}
            </div>
          </footer>
        </section>
        {isDraftMode && <VisualEditing />}
        <SpeedInsights />
      </body>
    </html>
  );
}
