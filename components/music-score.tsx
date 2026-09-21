"use client";

import { useMemo } from "react";

type Props = {
  notes: string[];
  currentIndex: number;
  timeSignature?: "4/4" | "3/4";
};

const DIATONIC: Record<string, number> = {
  "Dó": 0,
  "Ré": 1,
  "Mi": 2,
  "Fá": 3,
  "Sol": 4,
  "Lá": 5,
  "Si": 6,
};


function parseStaffNote(note:string){
  const match=note.match(/^(Dó|Ré|Mi|Fá|Sol|Lá|Si)([45])?$/);
  const name=match?.[1]??"Mi";
  const octave=Number(match?.[2]??4);
  const step=(DIATONIC[name]??2)+(octave-4)*7;
  return {name,octave,step,y:86-step*6};
}
export function MusicScore({
  notes,
  currentIndex,
  timeSignature = "4/4",
}: Props) {
  const beatsPerMeasure = timeSignature === "3/4" ? 3 : 4;
  const parsedNotes=useMemo(()=>notes.map(parseStaffNote),[notes]);
  const minY=Math.min(86,...parsedNotes.map(n=>n.y));
  const maxY=Math.max(14,...parsedNotes.map(n=>n.y));
  const topPad=Math.max(0,20-minY);
  const bottomPad=Math.max(0,maxY-92);
  const staffOffset=topPad;
  const svgHeight=132+topPad+bottomPad;
  const width = useMemo(() => Math.max(720, 150 + notes.length * 64), [notes.length]);
  const staffLeft = 150;
  const noteGap = 64;

  return (
    <div className="scoreWrap" aria-label="Partitura pedagógica">
      <div className="scoreHeader">
        <span>PARTITURA</span>
        <strong>{timeSignature}</strong>
      </div>

      <div className="scroll">
        <svg
          className="score"
          viewBox={`0 0 ${width} ${svgHeight}`}
          role="img"
          aria-label={`Partitura em ${timeSignature}`}
        >
          <rect x="0" y="0" width={width} height={svgHeight} rx="18" fill="#fff" />

          {[26, 38, 50, 62, 74].map((baseY) => { const y=baseY+staffOffset; return (
            <line key={y} x1="18" y1={y} x2={width - 18} y2={y} stroke="#334155" strokeWidth="1.6" />
          );})}

          <text x="30" y={76+staffOffset} fontSize="62" fontFamily="Noto Music, Bravura Text, Segoe UI Symbol, serif" fill="#26364d">
            𝄞
          </text>

          <g fill="#334155" fontFamily="system-ui, sans-serif" fontWeight="800">
            <text x="104" y={47+staffOffset} fontSize="18">{timeSignature.split("/")[0]}</text>
            <text x="104" y={68+staffOffset} fontSize="18">{timeSignature.split("/")[1]}</text>
          </g>

          {notes.map((note, index) => {
            const x = staffLeft + index * noteGap;
            const parsed = parseStaffNote(note);
            const y = parsed.y+staffOffset;
            const active = index === currentIndex;
            const done = index < currentIndex;
            const ledgerYs:number[]=[];
            if(parsed.step<=0) for(let ly=86+staffOffset;ly>=y;ly-=12) ledgerYs.push(ly);
            if(parsed.step>=12) for(let ly=14+staffOffset;ly<=y;ly+=12) ledgerYs.push(ly);
            const middleLine=50+staffOffset;
            const stemUp = y >= middleLine;
            const barAfter = (index + 1) % beatsPerMeasure === 0 && index < notes.length - 1;

            return (
              <g key={`${note}-${index}`}>
                {ledgerYs.map((ly) => (
                  <line key={ly} x1={x - 13} y1={ly} x2={x + 13} y2={ly} stroke="#334155" strokeWidth="1.6" />
                ))}

                {active && <circle cx={x} cy={y} r="18" fill="#dff7cf" />}

                <ellipse
                  cx={x}
                  cy={y}
                  rx="9"
                  ry="6.6"
                  transform={`rotate(-18 ${x} ${y})`}
                  fill={active ? "#58cc02" : done ? "#78b95b" : "#26364d"}
                />

                {stemUp ? (
                  <line x1={x + 8} y1={y - 1} x2={x + 8} y2={y - 34} stroke={active ? "#58cc02" : done ? "#78b95b" : "#26364d"} strokeWidth="2" />
                ) : (
                  <line x1={x - 8} y1={y + 1} x2={x - 8} y2={y + 34} stroke={active ? "#58cc02" : done ? "#78b95b" : "#26364d"} strokeWidth="2" />
                )}

                <text x={x} y={svgHeight-16} textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="800" fill={active ? "#3f8f1e" : "#7b8798"}>
                  {note}
                </text>

                {barAfter && (
                  <line x1={x + noteGap / 2} y1={26+staffOffset} x2={x + noteGap / 2} y2={74+staffOffset} stroke="#334155" strokeWidth="1.8" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <style jsx>{`
        .scoreWrap{margin:20px 0 12px;border:1px solid #e2e8f0;border-radius:22px;background:#f8fafc;padding:14px}.scoreHeader{display:flex;justify-content:space-between;align-items:center;margin:0 4px 10px}.scoreHeader span{font-size:10px;letter-spacing:.09em;font-weight:950;color:#6b7280}.scoreHeader strong{font-size:12px;color:#53617a}.scroll{overflow-x:auto;padding-bottom:4px}.score{display:block;min-width:680px;width:100%;height:auto;max-height:190px}@media(max-width:650px){.scoreWrap{padding:10px;border-radius:18px}.score{min-width:720px}}
      `}</style>
    </div>
  );
}
