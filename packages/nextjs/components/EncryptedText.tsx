"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

interface EncryptedTextProps {
  text: string;
  interval?: number;
  className?: string;
}

export const EncryptedText = ({
  text,
  interval = 50,
  className = "",
}: EncryptedTextProps) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    const maxIterations = 10;
    
    const timer = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(timer);
      }

      iteration += 1 / 2;
    }, interval);

    return () => clearInterval(timer);
  }, [text, interval]);

  return <span className={className}>{displayText}</span>;
};

