'use client';

// Bottom-of-hero quote with soft quotation marks.
export function MotivationalQuote({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <blockquote className="text-white/55 text-[12.5px] italic leading-relaxed">
      <span className="text-white/40 text-xl leading-none mr-1 align-[-2px]">“</span>
      {line1}
      <br />
      {line2}
      <span className="text-white/40 text-xl leading-none ml-1 align-[-2px]">”</span>
    </blockquote>
  );
}

export default MotivationalQuote;
