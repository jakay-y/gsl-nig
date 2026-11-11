import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import "./globals.css";
import "./theme-v2.css";
import { Header, ShowroomStatus } from "@/components/Chrome";
import { Loader } from "@/components/Loader";
import { SiteFx } from "@/components/SiteFx";
import { categories, site } from "@/lib/catalogue";

// One family across its width axis: condensed for display, normal for reading.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gsl-nig.com"),
  title: { default: "Gladiator Systems | Security, fire and entrance doors in Abuja", template: "%s | Gladiator Systems" },
  description:
    "Gladiator Systems supplies and installs steel security doors, fire-rated doors and smart locks from its showroom in Wuse II, Abuja. Registered 2012.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecedea" },
    { media: "(prefers-color-scheme: dark)", color: "#131517" },
  ],
};

// Applies a saved theme before first paint so the page never flashes.
// It also marks that scripts run (so scroll reveals may hide content first)
// and lets the loading screen play only once per visit.
const themeScript = `var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("gsl-theme");if(t==="light"||t==="dark")d.dataset.theme=t;if(sessionStorage.getItem("gsl-loaded"))d.dataset.loader="off";else sessionStorage.setItem("gsl-loaded","1")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Loader />
        <SiteFx />
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <footer className="footer">
          <div className="wrap">
            <div className="footer__lead">
              <div>
                <h2 className="title">Visit us in Wuse II.</h2>
                <p className="lede">
                  {site.address.join(", ")}. Bring your drawings or the size of the opening and we will go
                  through models, finishes and locks with you.
                </p>
                <p style={{ marginTop: 20, minHeight: "1.55em" }}><ShowroomStatus /></p>
              </div>
              <div className="row">
                <a
                  className="btn btn--primary"
                  href="https://www.google.com/maps/search/?api=1&query=11+Thaba+Tseka+Crescent+Wuse+II+Abuja"
                  target="_blank"
                  rel="noopener"
                >
                  Get directions
                </a>
                <Link className="btn btn--quiet" href="/quote">Request a quote</Link>
              </div>
            </div>

            <div className="footer__grid">
              <nav aria-label="Ranges">
                <h3>Ranges</h3>
                <ul>
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link className="link" href={`/catalogue?range=${c.slug}`}>{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div>
                <h3>Catalogues, PDF</h3>
                <ul>
                  {site.pdfs.map((pdf) => (
                    <li key={pdf.href}>
                      <a className="link" href={pdf.href} target="_blank" rel="noopener">{pdf.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Call or write</h3>
                <ul>
                  {site.phones.map((p) => (
                    <li key={p.href}><a className="link" href={p.href}>{p.label}</a></li>
                  ))}
                  <li><a className="link" href={`mailto:${site.email}`}>{site.email}</a></li>
                </ul>
              </div>
              <div>
                <h3>Open</h3>
                <ul>
                  <li>Monday to Friday</li>
                  <li>8am to 5pm</li>
                </ul>
              </div>
            </div>

            <div className="footer__base small muted">
              <span>© {new Date().getFullYear()} {site.legalName}. Registered in Nigeria, 2012.</span>
              <a className="link" href="#main">Back to top</a>
            </div>
          </div>
          <p className="footer__mark" aria-hidden="true">Gladiator Systems</p>
        </footer>
      </body>
    </html>
  );
}
