/** 卡通金毛 Bingo：垂耳画在脸之上，带描边，避免被脑袋挡住「没耳朵」 */
type Props = {
  expression: "none" | "happy" | "sip" | "nom" | "walk" | "brush";
  className?: string;
};

export function CuteBingoDog({ expression, className = "" }: Props) {
  const bounce = expression === "walk" || expression === "happy" || expression === "brush";
  const tongueOut = expression === "nom" || expression === "happy";
  const showTeeth = expression === "brush";

  return (
    <svg
      className={`cute-bingo-dog ${bounce ? "cute-bingo-dog--bounce" : ""} ${className}`}
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="bingo-fur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff6e8" />
          <stop offset="40%" stopColor="#f2d2a0" />
          <stop offset="100%" stopColor="#d9a050" />
        </linearGradient>
        <linearGradient id="bingo-ear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5dcc0" />
          <stop offset="100%" stopColor="#c89040" />
        </linearGradient>
        <linearGradient id="bingo-muzzle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fffaf4" />
          <stop offset="100%" stopColor="#edd8c8" />
        </linearGradient>
        <filter id="bingo-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
          <feOffset dx="0" dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="160" cy="228" rx="100" ry="18" fill="rgba(60,40,30,0.08)" />

      <g transform="translate(252 164) scale(0.72) translate(-252 -164)">
        <path
          d="M252 148c22-4 44 8 48 32s-14 44-36 48c-10 2-20 0-28-6"
          stroke="url(#bingo-ear)"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
      </g>

      <ellipse cx="158" cy="172" rx="76" ry="58" fill="url(#bingo-fur)" filter="url(#bingo-soft)" />
      <ellipse cx="158" cy="165" rx="34" ry="26" fill="rgba(255,255,255,0.4)" />

      <ellipse cx="160" cy="108" rx="68" ry="56" fill="url(#bingo-fur)" />

      <path
        d="M118 118 C118 118 128 168 160 178 C192 168 202 118 202 118 C202 100 188 88 160 88 C132 88 118 100 118 118 Z"
        fill="url(#bingo-muzzle)"
      />

      <path
        d="M118 102 Q160 92 202 102"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* 垂耳：略缩小，比例更贴近真实金毛 */}
      <g transform="translate(160 102) scale(0.78) translate(-160 -102)">
        <path
          d="M96 82 C62 88 48 128 56 168 C60 198 82 214 102 204 C124 188 132 138 124 98 C118 78 108 76 96 82 Z"
          fill="url(#bingo-ear)"
          stroke="#a07030"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M224 82 C258 88 272 128 264 168 C260 198 238 214 218 204 C196 188 188 138 196 98 C202 78 212 76 224 82 Z"
          fill="url(#bingo-ear)"
          stroke="#a07030"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      <ellipse cx="112" cy="118" rx="12" ry="9" fill="#ffb0b8" opacity="0.35" />
      <ellipse cx="208" cy="118" rx="12" ry="9" fill="#ffb0b8" opacity="0.35" />

      <ellipse cx="132" cy="102" rx="14" ry="16" fill="#fff" />
      <ellipse cx="188" cy="102" rx="14" ry="16" fill="#fff" />
      <ellipse cx="134" cy="104" rx="7" ry="9" fill="#3d3548" />
      <ellipse cx="186" cy="104" rx="7" ry="9" fill="#3d3548" />
      <ellipse cx="136" cy="100" rx="3" ry="3.5" fill="#fff" opacity="0.9" />
      <ellipse cx="184" cy="100" rx="3" ry="3.5" fill="#fff" opacity="0.9" />

      <ellipse cx="160" cy="152" rx="16" ry="12" fill="#2a2420" />
      <ellipse cx="156" cy="148" rx="4" ry="3" fill="#fff" opacity="0.2" />

      <path
        d="M142 162 Q160 172 178 162"
        stroke="#c09078"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {showTeeth && (
        <g fill="#fffefe" stroke="#d8c4b8" strokeWidth="0.5">
          <rect x="148" y="158" width="5" height="7" rx="1" />
          <rect x="154.5" y="158" width="5" height="7" rx="1" />
          <rect x="161" y="158" width="5" height="7" rx="1" />
          <rect x="167.5" y="158" width="5" height="7" rx="1" />
        </g>
      )}

      {(tongueOut || expression === "walk") && !showTeeth && (
        <ellipse
          cx="160"
          cy="172"
          rx="11"
          ry={tongueOut ? 10 : 7}
          fill="#f0a0b8"
          opacity="0.95"
        />
      )}

      {expression === "happy" && (
        <>
          <path d="M48 78l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffd87c" opacity="0.85" />
          <path d="M272 70l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#ffd87c" opacity="0.7" />
        </>
      )}

    </svg>
  );
}
