import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./UrgencyBar.css";

var stats = [
  {
    end: 96,
    prefix: "",
    suffix: "%",
    label: "of homepages have\nWCAG failures",
    color: "var(--red)",
    source: "WebAIM 2024",
    duration: 3000,
  },
  {
    end: 75,
    prefix: "$",
    suffix: "K+",
    label: "average ADA lawsuit\nsettlement",
    color: "var(--amber)",
    source: "UsableNet 2024",
    duration: 3000,
  },
  {
    end: 1.4,
    prefix: "",
    suffix: "B",
    label: "people worldwide\nwith disabilities",
    color: "var(--accent)",
    source: "WHO 2024",
    duration: 3000,
    decimals: 1,
  },
  {
    end: 30,
    prefix: "",
    suffix: "s",
    label: "to find out if\nyou're at risk",
    color: "var(--green)",
    source: "",
    duration: 3000,
  },
];

function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}

function CountUp({ end, prefix, suffix, duration, decimals, color }) {
  var [value, setValue] = useState(0);
  var [started, setStarted] = useState(false);
  var ref = useRef(null);

  // Start counting when element scrolls into view
  useEffect(
    function () {
      var el = ref.current;
      if (!el) return;
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting && !started) {
            setStarted(true);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return function () {
        observer.disconnect();
      };
    },
    [started]
  );

  // Animate from 0 to end with easing
  useEffect(
    function () {
      if (!started) return;
      var startTime = null;
      var frame;
      function tick(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = easeOutQuart(progress);
        setValue(eased * end);
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setValue(end);
        }
      }
      frame = requestAnimationFrame(tick);
      return function () {
        cancelAnimationFrame(frame);
      };
    },
    [started, end, duration]
  );

  var display = decimals ? value.toFixed(decimals) : Math.round(value);

  return (
    <div ref={ref} className="urgency__value" style={{ color: color }}>
      {prefix}
      {display}
      {suffix}
    </div>
  );
}

export default function UrgencyBar() {
  return (
    <div className="urgency">
      <div className="urgency__inner">
        {stats.map(function (s, i) {
          return (
            <div key={i} className="urgency__stat">
              <CountUp
                end={s.end}
                prefix={s.prefix || ""}
                suffix={s.suffix || ""}
                duration={s.duration || 1500}
                decimals={s.decimals || 0}
                color={s.color}
              />
              <div className="urgency__label">{s.label}</div>
              {s.source && <div className="urgency__source">{s.source}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
