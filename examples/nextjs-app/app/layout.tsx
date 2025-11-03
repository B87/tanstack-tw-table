import "./globals.css";

export const metadata = {
  title: "Next.js App Example - TanStack Data Table",
  description: "Example Next.js application using @b87/tanstack-tw-table",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
