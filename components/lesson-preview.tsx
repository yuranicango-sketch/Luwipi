export function LessonPreview() {
  return (
    <div className="lesson-preview" aria-label="Pré-visualização de uma aula Luwipi">
      <div className="preview-glow preview-glow-one" />
      <div className="preview-glow preview-glow-two" />
      <div className="preview-topbar">
        <div className="mini-avatar">L</div>
        <div><strong>Aula de hoje</strong><span>Primeiros sons</span></div>
        <div className="mini-stars">★ 12</div>
      </div>
      <div className="preview-scene">
        <div className="window-sky"><span className="cloud cloud-one"/><span className="cloud cloud-two"/><span className="hill hill-one"/><span className="hill hill-two"/></div>
        <div className="scene-note note-a">♪</div><div className="scene-note note-b">♫</div><div className="scene-note note-c">♪</div>
        <div className="lamb" aria-hidden="true">
          <span className="lamb-ear left"/><span className="lamb-ear right"/>
          <span className="lamb-face"><i/><i/><b>⌣</b></span><span className="lamb-body"/><span className="lamb-scarf">♪</span>
        </div>
        <div className="piano-case">
          <div className="tablet"><div className="tablet-progress"><span/></div><div className="falling-bars"><i/><i/><i/><i/></div></div>
          <div className="preview-keys">{Array.from({ length: 8 }).map((_, i) => <span key={i} className={i === 2 ? "key-lit" : ""}/>)}</div>
        </div>
      </div>
      <div className="preview-panel">
        <div><small>Próxima nota</small><strong>MI</strong></div>
        <div className="preview-progress"><span className="done">✓</span><span className="done">✓</span><span className="active">3</span><span>4</span><span>5</span></div>
      </div>
    </div>
  );
}
