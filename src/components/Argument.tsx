import type { Argument as ArgumentData } from '../content/types'

/**
 * A short proof: numbered premises, a rule, then the conclusion marked ∴.
 * Premises really are an ordered sequence, so <ol> and P1/P2 labels are earned.
 */
export function Argument({ argument, label }: { argument: ArgumentData; label: string }) {
  return (
    <div className="measure">
      <ol aria-label={`${label}: premises`} className="flex flex-col gap-1">
        {argument.premises.map((premise, i) => (
          <li key={premise} className="hang">
            <span aria-hidden="true" className="font-sans text-sm leading-[1.85] text-(--color-muted) tabular-nums">
              P{i + 1}
            </span>
            <span>{premise}</span>
          </li>
        ))}
      </ol>
      <div className="hang mt-3">
        <span aria-hidden="true" />
        <hr className="w-24 border-0 border-t border-(--color-ink)" />
      </div>
      <p className="hang mt-3">
        <span aria-hidden="true" className="text-[1.6rem] leading-none font-semibold text-(--color-accent)">
          ∴
        </span>
        <span className="font-medium">
          <span className="sr-only">Therefore: </span>
          {argument.conclusion}
        </span>
      </p>
    </div>
  )
}
