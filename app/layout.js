import "./globals.css";

export const metadata = {
  title: "PTanzo Albay Dashboard",
  description: "PTanzo Albay Sales and Operations Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
