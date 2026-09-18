type Props = {
  type:
    | "sound"
    | "rhythm"
    | "keyboard"
    | "hands"
    | "ear"
    | "colors"
    | "story"
    | "performance"
    | "reading"
    | "harmony"
    | "creativity";
};

export function ModuleIllustration({ type }: Props) {
  if (type === "keyboard" || type === "harmony") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <rect x="20" y="40" width="200" height="92" rx="18" fill="#fff" stroke="currentColor" strokeWidth="6" />
        {[0,1,2,3,4,5,6].map((i) => <rect key={i} x={28+i*27} y="48" width="27" height="76" fill="#fff" stroke="currentColor" strokeWidth="2" />)}
        {[0,1,3,4,5].map((i) => <rect key={i} x={47+i*27} y="48" width="15" height="45" rx="3" fill="currentColor" />)}
        {type === "harmony" && <><circle cx="72" cy="28" r="10" fill="currentColor"/><circle cx="120" cy="18" r="10" fill="currentColor"/><circle cx="168" cy="28" r="10" fill="currentColor"/></>}
      </svg>
    );
  }

  if (type === "reading") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        {[48,64,80,96,112].map((y) => <line key={y} x1="26" y1={y} x2="214" y2={y} stroke="currentColor" strokeWidth="3" opacity=".75" />)}
        <text x="34" y="112" fontSize="72" fill="currentColor" fontFamily='"Noto Music","Bravura","Segoe UI Symbol",serif'>𝄞</text>
        <circle cx="126" cy="88" r="10" fill="currentColor"/><line x1="135" y1="88" x2="135" y2="44" stroke="currentColor" strokeWidth="5"/>
        <circle cx="174" cy="72" r="10" fill="currentColor"/><line x1="183" y1="72" x2="183" y2="34" stroke="currentColor" strokeWidth="5"/>
      </svg>
    );
  }

  if (type === "rhythm") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <ellipse cx="118" cy="96" rx="64" ry="34" fill="#fff" stroke="currentColor" strokeWidth="7"/>
        <rect x="54" y="56" width="128" height="42" rx="18" fill="#fff" stroke="currentColor" strokeWidth="7"/>
        <line x1="74" y1="52" x2="112" y2="20" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
        <line x1="164" y1="52" x2="200" y2="26" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
        {[52,82,112,142,172].map((x) => <circle key={x} cx={x} cy="140" r="5" fill="currentColor" opacity=".55"/>)}
      </svg>
    );
  }

  if (type === "hands") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <path d="M66 120c-20-22-24-48-16-66 5-10 15-8 18 1l8 26V34c0-11 14-12 15-1l3 42V27c0-11 14-11 15 0l3 46V34c0-10 13-11 15-1l5 48 8-26c3-10 16-9 17 2 2 27-5 50-23 67-18 17-50 17-68-4Z" fill="#fff" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M150 122c13-13 18-28 18-44" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity=".5"/>
      </svg>
    );
  }

  if (type === "story") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <path d="M28 38c38-10 67-2 92 18v78c-26-18-57-24-92-14Z" fill="#fff" stroke="currentColor" strokeWidth="6"/>
        <path d="M212 38c-38-10-67-2-92 18v78c26-18 57-24 92-14Z" fill="#fff" stroke="currentColor" strokeWidth="6"/>
        <circle cx="82" cy="76" r="11" fill="currentColor"/>
        <path d="M148 76c18-24 31-18 28 7-2 16-16 25-28 28" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === "performance") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <path d="m120 20 14 30 34 4-25 23 7 33-30-16-30 16 7-33-25-23 34-4Z" fill="#fff" stroke="currentColor" strokeWidth="6"/>
        <path d="M50 132h140" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
        <path d="M76 132V92h88v40" fill="#fff" stroke="currentColor" strokeWidth="6"/>
      </svg>
    );
  }

  if (type === "colors") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <path d="M36 120c32-74 136-74 168 0" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round" opacity=".25"/>
        {[62,96,132,168].map((x,i) => <circle key={x} cx={x} cy={112-(i%2)*34} r="18" fill="currentColor" opacity={0.35+i*.16}/>)}
        <path d="M44 132h152" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === "creativity") {
    return (
      <svg viewBox="0 0 240 160" aria-hidden="true">
        <path d="M120 24c-37 0-62 39-42 70 8 12 19 17 22 33h40c3-16 14-21 22-33 20-31-5-70-42-70Z" fill="#fff" stroke="currentColor" strokeWidth="6"/>
        <path d="M104 140h32M102 127h36" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="91" cy="74" r="8" fill="currentColor"/><circle cx="120" cy="58" r="8" fill="currentColor"/><circle cx="149" cy="78" r="8" fill="currentColor"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 160" aria-hidden="true">
      <path d="M82 122c-22-15-35-39-35-65 0-9 7-16 16-16 19 0 37 13 45 31l9 20" fill="#fff" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M127 56c27-25 67-11 67 22 0 27-27 51-57 51-20 0-39-11-55-27" fill="#fff" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M155 42v48l25-8" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
      <circle cx="146" cy="94" r="12" fill="currentColor"/>
    </svg>
  );
}
