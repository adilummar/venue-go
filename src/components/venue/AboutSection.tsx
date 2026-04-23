"use client";

import { useState } from "react";

interface AboutSectionProps {
  description: string;
}

export const AboutSection = ({ description }: AboutSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 200;
  const displayText = expanded || !isLong ? description : description.slice(0, 200) + "...";

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-3" style={{fontFamily: 'var(--font-noto-serif)'}}>About this space</h2>
      <p className="text-neutral-400 text-sm leading-relaxed">{displayText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white text-sm font-semibold mt-2 flex items-center gap-1 hover:text-amber-400 transition-colors"
        >
          {expanded ? "Show less" : "Show more ›"}
        </button>
      )}
    </div>
  );
};
