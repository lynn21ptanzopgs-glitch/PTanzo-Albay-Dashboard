export const metadata = {
  title: "PTanzo Albay Dashboard",
  description: "PTanzo Albay Sales and Operations Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
