import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function XsblBull({ size = 40, style = {} }) {
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

  var eyeR = blink ? 1.5 : 7;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      style={{ display: "block", ...style }}
    >
      {/* Left horn — wide base, sharp tip, slight curve */}
      <path
        d="M38 46 C34 40 26 32 24 30 C30 30 42 38 50 48 Z"
        fill={t.accent}
        opacity="0.75"
      />

      {/* Right horn — wide base, sharp tip, slight curve */}
      <path
        d="M112 46 C116 40 124 32 126 30 C120 30 108 38 100 48 Z"
        fill={t.accent}
        opacity="0.75"
      />

      {/* Left ear — filled */}
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

      {/* Right ear — filled */}
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

      {/* Head — filled */}
      <path
        d="M115 74C115 87 102 93 102 98C102 118 102 128 90 131L87 135H63L60 131C48 128 48 118 48 98C48 93 35 87 35 74C35 45 53 41 75 41C97 41 115 45 115 74Z"
        fill={t.cardBg}
        stroke={t.ink20}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Snout — filled lighter */}
      <path
        d="M95 115C95 123 91 127 86 127C82 127 79 124 76 124C73 124 69 127 65 127C60 127 55 123 55 115C55 107 62 103 66 103C70 103 69 105 76 105C82 105 81 103 85 103C89 103 95 107 95 115Z"
        fill={t.paper}
        stroke={t.ink08}
        strokeWidth="1.5"
      />

      {/* Left eye */}
      <circle
        cx="57"
        cy="73"
        r={eyeR}
        fill={t.ink}
        style={{ transition: "r 0.1s ease" }}
      />

      {/* Right eye */}
      <circle
        cx="92"
        cy="73"
        r={eyeR}
        fill={t.ink}
        style={{ transition: "r 0.1s ease" }}
      />

      {/* Eye shine */}
      {!blink && (
        <circle cx="59.5" cy="70" r="3" fill={t.cardBg} opacity="0.85" />
      )}
      {!blink && (
        <circle cx="94.5" cy="70" r="3" fill={t.cardBg} opacity="0.85" />
      )}

      {/* Left nostril */}
      <ellipse cx="66" cy="116" rx="2.5" ry="1.5" fill={t.ink} opacity="0.3" />

      {/* Right nostril */}
      <ellipse cx="84" cy="116" rx="2.5" ry="1.5" fill={t.ink} opacity="0.3" />

      {/* Mouth — happy curve */}
      <path
        d="M68 122 Q75 126 82 122"
        stroke={t.ink20}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <circle cx="44" cy="80" r="5" fill={t.accent} opacity="0.06" />
      <circle cx="106" cy="80" r="5" fill={t.accent} opacity="0.06" />
    </svg>
  );
}
