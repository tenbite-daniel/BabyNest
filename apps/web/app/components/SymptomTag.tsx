type Props = { label: string; onRemove?: () => void };

export default function SymptomTag({ label, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-2 bg-pink-100 text-[--color-primary] px-3 py-1 rounded-full text-sm">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full w-5 h-5 flex items-center justify-center border border-[--color-primary]/30"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
