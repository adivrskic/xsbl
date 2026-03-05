import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function XsblBull({ size = 36, style = {} }) {
  const { t } = useTheme();
  const [blink, setBlink] = useState(false);

  useEffect(function () {
    var interval = setInterval(function () {
      setBlink(true);
      setTimeout(function () {
        setBlink(false);
      }, 150);
    }, 3000 + Math.random() * 2000);
    return function () {
      clearInterval(interval);
    };
  }, []);

  var eyeR = blink ? 1.5 : 9;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      style={{ display: "block", ...style }}
    >
      {/* LEFT HORN */}
      <path
        d="M52 58
           C25 50 18 40 28 26
           C28 38 65 36 45 48
           Z"
        fill={t.accent}
        opacity="0.85"
      />

      {/* RIGHT HORN */}
      <path
        d="M98 58
           C125 50 132 40 122 26
           C122 38 85 36 105 48
           Z"
        fill={t.accent}
        opacity="0.85"
      />

      {/* LEFT EAR */}
      <path
        d="M46 78C27 89 14 79 8 73C15 71 29 61 42 69Z"
        fill={t.cardBg}
        stroke={t.ink20}
        strokeWidth="1.5"
      />
      <path
        d="M42 76C30 84 20 78 15 74C19 73 28 66 38 71Z"
        fill={t.accentBg}
        opacity="0.6"
      />

      {/* RIGHT EAR */}
      <path
        d="M104 78C123 89 136 79 142 73C135 71 121 61 108 69Z"
        fill={t.cardBg}
        stroke={t.ink20}
        strokeWidth="1.5"
      />
      <path
        d="M108 76C120 84 130 78 135 74C131 73 122 66 112 71Z"
        fill={t.accentBg}
        opacity="0.6"
      />

      {/* HEAD (wider bull shape) */}
      <path
        d="M118 72
           C118 92 104 98 104 104
           C104 124 96 132 88 134
           L84 138
           H66
           L62 134
           C54 132 46 124 46 104
           C46 98 32 92 32 72
           C32 45 55 38 75 38
           C95 38 118 45 118 72Z"
        fill={t.cardBg}
        stroke={t.ink20}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* HEAVY BULL SNOUT */}
      <path
        d="M98 115
           C98 126 92 132 86 132
           C82 132 78 129 75 129
           C72 129 68 132 64 132
           C58 132 52 126 52 115
           C52 104 62 100 67 100
           C72 100 70 103 75 103
           C80 103 78 100 83 100
           C88 100 98 104 98 115Z"
        fill={t.paper}
        stroke={t.ink08}
        strokeWidth="1.5"
      />

      {/* NOSE RING */}
      <path
        d="M70 120
           A8 8 0 0 0 80 120"
        stroke="#D4A21A"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* EYES */}
      <circle
        cx="60"
        cy="72"
        r={eyeR}
        fill={t.ink}
        style={{ transition: "r 0.1s ease" }}
      />
      <circle
        cx="90"
        cy="72"
        r={eyeR}
        fill={t.ink}
        style={{ transition: "r 0.1s ease" }}
      />

      {/* EYE SHINE */}
      {!blink && (
        <circle cx="62" cy="69" r="5" fill={t.cardBg} opacity="0.85" />
      )}
      {!blink && (
        <circle cx="92" cy="69" r="6" fill={t.cardBg} opacity="0.85" />
      )}

      {/* NOSTRILS */}
      <ellipse cx="66" cy="116" rx="3" ry="2" fill={t.ink} opacity="0.35" />
      <ellipse cx="84" cy="116" rx="3" ry="2" fill={t.ink} opacity="0.35" />

      {/* SMILE */}
      <path
        d="M69 125 Q75 129 81 125"
        stroke={t.ink20}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* CHEEKS */}
      <circle cx="44" cy="80" r="6" fill={t.accent} opacity="0.05" />
      <circle cx="106" cy="80" r="6" fill={t.accent} opacity="0.05" />
    </svg>
  );
}
