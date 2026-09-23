export type InstrumentInputKind = "virtual" | "midi" | "microphone";

export type DetectedNote = {
  midi: number;
  confidence: number;
  at: number;
};

export interface InstrumentInputAdapter {
  readonly kind: InstrumentInputKind;
  readonly available: boolean;
  start(onNote: (note: DetectedNote) => void): Promise<void>;
  stop(): Promise<void>;
}

export function unavailableInstrumentInput(kind: Exclude<InstrumentInputKind, "virtual">): InstrumentInputAdapter {
  return {
    kind,
    available: false,
    async start() { throw new Error(`${kind}_input_not_enabled`); },
    async stop() { /* no-op until a future adapter is enabled */ },
  };
}

// Fase futura: implementar adapters MIDI e microfone sem alterar o Modo Aula.
// A UI consome apenas InstrumentInputAdapter, não APIs específicas de browser/hardware.
