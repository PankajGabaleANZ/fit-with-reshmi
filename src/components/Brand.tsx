/** The HealthwithReshmi™ wordmark: "Healthwith" in the serif, "Reshmi" in a fine cursive script. */
export default function Brand({ className = "", tm = true }: { className?: string; tm?: boolean }) {
  return (
    <span className={`whitespace-nowrap ${className}`}>
      Healthwith
      <span
        className="text-[1.5em] leading-none align-[-0.04em] ml-[0.04em]"
        style={{ fontFamily: '"Pinyon Script", "Snell Roundhand", cursive', fontWeight: 400 }}
      >
        Reshmi
      </span>
      {tm && (
        <sup className="font-sans text-[0.4em] font-normal align-[0.95em] ml-[0.08em] tracking-normal" aria-label="trademark">
          ™
        </sup>
      )}
    </span>
  );
}
