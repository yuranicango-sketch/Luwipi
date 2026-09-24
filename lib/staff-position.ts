export type StaffClef = "treble" | "bass";

const NOTE_DEGREES: Array<[RegExp, number]> = [
  [/^(do|c)([^a-z]|$)/i, 0],
  [/^(re|d)([^a-z]|$)/i, 1],
  [/^(mi|e)([^a-z]|$)/i, 2],
  [/^(fa|f)([^a-z]|$)/i, 3],
  [/^(sol|g)([^a-z]|$)/i, 4],
  [/^(la|a)([^a-z]|$)/i, 5],
  [/^(si|b)([^a-z]|$)/i, 6],
];

function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function degreeFromName(name: string) {
  const normalized=normalizeName(name);
  for(const [pattern,degree] of NOTE_DEGREES) if(pattern.test(normalized)) return degree;
  return null;
}

function degreeFromMidi(midi: number) {
  const pitch=((midi%12)+12)%12;
  // Accidentals inherit the letter below (C#, D#, F#, G#, A#).
  return [0,0,1,1,2,3,3,4,4,5,5,6][pitch];
}

export function diatonicIndex(name: string, midi: number) {
  const octave=Math.floor(midi/12)-1;
  const degree=degreeFromName(name) ?? degreeFromMidi(midi);
  return octave*7+degree;
}

export function staffStepForPitch(name: string, midi: number, clef: StaffClef) {
  // Bottom staff line:
  // treble = E4, bass = G2.
  const reference=clef==="treble" ? (4*7+2) : (2*7+4);
  return diatonicIndex(name,midi)-reference;
}

export function staffY(name: string, midi: number, clef: StaffClef, bottomLineY: number) {
  return bottomLineY-staffStepForPitch(name,midi,clef)*10;
}

export function ledgerLineSteps(step: number) {
  const lines:number[]=[];
  if(step<=-2){
    for(let current=-2;current>=step;current-=2) lines.push(current);
  } else if(step>=10){
    for(let current=10;current<=step;current+=2) lines.push(current);
  }
  return lines;
}
