/** Плейсхолдер логотипа: стилизованный QR-значок + название сервиса. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 grid-cols-3 grid-rows-3 gap-[2px] rounded-md bg-navy p-[3px]"
      >
        {/* Схематичный узор QR из спецификации (лого-плейсхолдер) */}
        {[1, 1, 1, 1, 0, 1, 1, 1, 0].map((on, i) => (
          <span
            key={i}
            className={`rounded-[1px] ${on ? 'bg-white' : 'bg-transparent'}`}
          />
        ))}
      </span>
    </span>
  );
}
