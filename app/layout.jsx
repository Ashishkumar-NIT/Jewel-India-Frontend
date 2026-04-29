import { Bodoni_Moda, Jost, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";
import { getAuthUser } from "../lib/supabase/queries";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope-var",
  subsets: ["latin"],
});
export const metadata = {
  title: "Celestique | Timeless Jewelry",
  description: "A celestial touch for timeless moments.",
};

export default async function RootLayout({ children }) {
  // Fetched once here — React.cache() deduplicates any subsequent getAuthUser()
  // calls made by nested server components in the same render pass.
  const initialUser = await getAuthUser();

  return (
    <html lang="en">
      <head>
        {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" /> */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning
        className={`${bodoni.variable} ${jost.variable} ${manrope.variable} font-sans antialiased text-celestique-dark`}
      >
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
