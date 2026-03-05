export default function Section({ id, children, style = {} }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "6rem clamp(1.5rem, 3vw, 3rem)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}
