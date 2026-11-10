/**
 * A bay: one product standing in a lit recess of wall.
 * Doors stand on the bay floor; handles, locks and canopies float centred.
 * No hooks, so it renders on the server and inside client components alike.
 */
export function Bay({
  src,
  w,
  h,
  alt,
  size = "grid",
  eager = false,
}: {
  src: string;
  w: number;
  h: number;
  alt: string;
  size?: "grid" | "feature";
  eager?: boolean;
}) {
  const door = h / w > 1.25;
  return (
    <span className={`bay bay--${size} ${door ? "bay--door" : "bay--object"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
      />
    </span>
  );
}
