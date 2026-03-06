export default function Section({ id, children, style = {} }) {
  return (
    <section id={id} className="section" style={style}>
      {children}
    </section>
  );
}
