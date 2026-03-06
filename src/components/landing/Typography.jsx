export function Eyebrow({ children }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-line" />
      {children}
    </div>
  );
}

export function H2({ children }) {
  return <h2 className="h2-serif">{children}</h2>;
}

export function SubText({ children }) {
  return <p className="sub-text">{children}</p>;
}

export function Italic({ children }) {
  return <span className="italic-accent">{children}</span>;
}
