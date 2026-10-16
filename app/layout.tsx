import type { Metadata } from "next"
import "@/app/globals.css"

// providers
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Pocket Heist",
  description: "In. Out. Gone.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
