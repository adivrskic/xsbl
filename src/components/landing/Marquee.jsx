import { marqueeItems } from "../../data/content";
import "./Marquee.css";

export default function Marquee() {
  const renderItems = (items) =>
    items.map((text, i) => (
      <span key={i} className="marquee__item">
        <span aria-hidden="true" className="marquee__dot" />
        {text}
      </span>
    ));

  return (
    <div className="marquee">
      <div className="marquee__track">
        {/* First set — visible to screen readers */}
        <span style={{ display: "contents" }}>{renderItems(marqueeItems)}</span>
        {/* Duplicate sets — hidden from screen readers */}
        <span aria-hidden="true" style={{ display: "contents" }}>
          {renderItems(marqueeItems)}
        </span>
        <span aria-hidden="true" style={{ display: "contents" }}>
          {renderItems(marqueeItems)}
        </span>
      </div>
    </div>
  );
}
