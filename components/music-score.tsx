"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  notes: string[];
  currentIndex: number;
  timeSignature?: "4/4" | "3/4";
  wrongIndex?: number | null;
  hideLabels?: boolean;
  compact?: boolean;
};

const DIATONIC: Record<string, number> = { "Dó": 0, "Ré": 1, "Mi": 2, "Fá": 3, "Sol": 4, "Lá": 5, "Si": 6 };

function parseStaffNote(note: string) {
  const match = note.match(/^(Dó|Ré|Mi|Fá|Sol|Lá|Si)([45])?$/);
  const name = match?.[1] ?? "Mi";
  const octave = Number(match?.[2] ?? 4);
  const step = (DIATONIC[name] ?? 2) + (octave - 4) * 7;
  return { name, octave, step, y: 88 - step * 6 };
}

export function MusicScore({ notes, currentIndex, timeSignature = "4/4", wrongIndex = null, hideLabels = false, compact = false }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const beatsPerMeasure = timeSignature === "3/4" ? 3 : 4;
  const parsed = useMemo(() => notes.map(parseStaffNote), [notes]);
  const minY = Math.min(88, ...parsed.map((n) => n.y));
  const maxY = Math.max(14, ...parsed.map((n) => n.y));
  const topPad = Math.max(0, 22 - minY);
  const bottomPad = Math.max(0, maxY - 94);
  const staffOffset = topPad;
  const svgHeight = (hideLabels ? 118 : 142) + topPad + bottomPad;
  const staffLeft = 144;
  const noteGap = compact ? 54 : 64;
  const width = Math.max(760, staffLeft + Math.max(1, notes.length) * noteGap + 80);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || currentIndex < 0) return;
    const x = staffLeft + currentIndex * noteGap;
    const target = Math.max(0, x - el.clientWidth * 0.42);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [currentIndex, noteGap]);

  return <div className="scoreWrap" data-compact={compact ? "true" : "false"}>
    <div className="scoreTop"><div><span>PARTITURA INTERATIVA</span><b>Toque a nota que está dentro do cursor</b></div><strong>{timeSignature}</strong></div>
    <div className="scroll" ref={scrollRef}>
      <svg className="score" viewBox={`0 0 ${width} ${svgHeight}`} role="img" aria-label={`Partitura interativa em ${timeSignature}`}>
        <rect width={width} height={svgHeight} rx="22" fill="#fff" />
        {[26, 38, 50, 62, 74].map((baseY) => <line key={baseY} x1="18" y1={baseY + staffOffset} x2={width - 18} y2={baseY + staffOffset} stroke="#314158" strokeWidth="1.7" />)}
        <text x="28" y={78 + staffOffset} fontSize="64" fontFamily="Noto Music, Bravura Text, Segoe UI Symbol, serif" fill="#20324a">𝄞</text>
        <g fill="#314158" fontFamily="system-ui, sans-serif" fontWeight="900"><text x="105" y={47 + staffOffset} fontSize="18">{timeSignature.split("/")[0]}</text><text x="105" y={69 + staffOffset} fontSize="18">{timeSignature.split("/")[1]}</text></g>

        {currentIndex >= 0 && currentIndex < notes.length && <g className="playhead"><rect x={staffLeft + currentIndex * noteGap - 25} y={9 + staffOffset} width="50" height={84} rx="16" fill="rgba(88,204,2,.09)" stroke="#58cc02" strokeWidth="2"/><line x1={staffLeft + currentIndex * noteGap} y1={10 + staffOffset} x2={staffLeft + currentIndex * noteGap} y2={94 + staffOffset} stroke="#58cc02" strokeWidth="2" strokeDasharray="5 5"/></g>}

        {notes.map((note, index) => {
          const x = staffLeft + index * noteGap;
          const p = parseStaffNote(note);
          const y = p.y + staffOffset;
          const active = index === currentIndex;
          const done = index < currentIndex;
          const wrong = wrongIndex === index;
          const stemUp = y >= 50 + staffOffset;
          const ledgerYs: number[] = [];
          if (p.step <= 0) for (let ly = 88 + staffOffset; ly >= y; ly -= 12) ledgerYs.push(ly);
          if (p.step >= 12) for (let ly = 16 + staffOffset; ly <= y; ly += 12) ledgerYs.push(ly);
          const color = wrong ? "#ef4444" : active ? "#58cc02" : done ? "#57a93c" : "#24364d";
          const barAfter = (index + 1) % beatsPerMeasure === 0 && index < notes.length - 1;
          return <g key={`${note}-${index}`}>
            {ledgerYs.map((ly) => <line key={ly} x1={x - 13} y1={ly} x2={x + 13} y2={ly} stroke="#314158" strokeWidth="1.7" />)}
            {wrong && <circle cx={x} cy={y} r="20" fill="rgba(239,68,68,.12)" />}
            {active && !wrong && <circle cx={x} cy={y} r="19" fill="rgba(88,204,2,.14)" />}
            <ellipse cx={x} cy={y} rx="9.5" ry="6.7" transform={`rotate(-18 ${x} ${y})`} fill={color} />
            {stemUp ? <line x1={x + 8} y1={y - 1} x2={x + 8} y2={y - 34} stroke={color} strokeWidth="2.2"/> : <line x1={x - 8} y1={y + 1} x2={x - 8} y2={y + 34} stroke={color} strokeWidth="2.2"/>}
            {!hideLabels && <text x={x} y={svgHeight - 15} textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="900" fill={color}>{note}</text>}
            {barAfter && <line x1={x + noteGap / 2} y1={26 + staffOffset} x2={x + noteGap / 2} y2={74 + staffOffset} stroke="#314158" strokeWidth="1.8" />}
          </g>;
        })}
      </svg>
    </div>
    <style jsx>{`
      .scoreWrap{border:1px solid #dfe7ef;border-radius:20px;background:#f7fafc;padding:10px;overflow:hidden}.scoreTop{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:2px 5px 9px}.scoreTop div{display:flex;flex-direction:column;gap:2px}.scoreTop span{font-size:10px;font-weight:950;letter-spacing:.1em;color:#6270c7}.scoreTop b{font-size:12px;color:#64748b}.scoreTop strong{font-size:12px;padding:6px 8px;border-radius:9px;background:#eaf0f6;color:#3f5066}.scroll{overflow-x:auto;scrollbar-width:none}.scroll::-webkit-scrollbar{display:none}.score{display:block;width:${width}px;max-width:none;height:${compact ? "132px" : "160px"}}.scoreWrap[data-compact=true]{padding:7px}.scoreWrap[data-compact=true] .scoreTop{padding-bottom:5px}.scoreWrap[data-compact=true] .scoreTop b{display:none}@media(max-width:680px){.scoreTop b{display:none}.score{height:${compact ? "116px" : "145px"}}`
    }</style>
  </div>;
}
