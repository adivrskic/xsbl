import { useInView } from "../../hooks/useInView";
import "./FadeIn.css";

export default function FadeIn({
  children,
  delay = 0,
  className = "",
  style = {},
}) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={
        "fade-in" +
        (visible ? " fade-in--visible" : "") +
        (className ? " " + className : "")
      }
      style={{
        ...style,
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
