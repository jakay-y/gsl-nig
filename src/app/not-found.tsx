import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap empty">
      <h1 className="heading">This page isn&rsquo;t in the catalogue.</h1>
      <p className="muted">The address may be from the old site. Every product now lives under one catalogue.</p>
      <div className="row" style={{ marginTop: 24 }}>
        <Link href="/catalogue" className="btn btn--quiet">Open the catalogue</Link>
        <Link href="/" className="text-btn">Go to the home page</Link>
      </div>
    </div>
  );
}
