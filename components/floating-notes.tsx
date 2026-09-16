const notes = ["♪", "♫", "♩", "♪", "♫", "♬"];

export function FloatingNotes() {
  return (
    <div className="floating-notes" aria-hidden="true">
      {notes.map((note, index) => (
        <span key={`${note}-${index}`} className={`floating-note note-${index + 1}`}>{note}</span>
      ))}
    </div>
  );
}
