import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Luwipi — página inicial">
      <span className="brand-mark" aria-hidden="true">
        <span className="note-stem" />
        <span className="note-dot" />
        <span className="note-spark">♪</span>
      </span>
      <span className="brand-copy">
        <strong>
          <span className="logo-blue">Lu</span>
          <span className="logo-yellow">w</span>
          <span className="logo-pink">i</span>
          <span className="logo-green">p</span>
          <span className="logo-blue">i</span>
        </strong>
        {!compact && <small>Pequenos músicos, grandes histórias.</small>}
      </span>
    </Link>
  );
}
