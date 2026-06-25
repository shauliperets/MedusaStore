import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import SubdomainBanner from "@modules/layout/components/subdomain-banner"
import "../styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const isRtl = locale === "he"

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      data-mode="light"
      className={inter.variable}
    >
      <body
        className="app-surface min-h-screen text-base antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <SubdomainBanner />
          <main className="relative min-h-screen">{props.children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
