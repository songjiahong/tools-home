import { useEffect, useState } from 'react'
import { Unit, CM_PER_FT, CM_PER_IN, splitFeetInches } from '../utils/units'
import { useI18n } from '../../i18n/I18nProvider'
import { TKey } from '../../i18n/translations'

const FACTOR = { cm: 1, m: 100 } as const
const DP = { cm: 1, m: 3 } as const
const STEP = { cm: 1, m: 0.01 } as const
const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
const fmt = (n: number, dp: number) => String(parseFloat(n.toFixed(dp)))

interface Props {
  labelKey: TKey
  /** Value in cm (the stored unit). */
  valueCm: number
  onCommit: (cm: number) => void
  unit: Unit
}

/** Decimal number field in cm or m, or two fields (feet and decimal inches) in ft/in. Commits only valid positive values. */
export default function UnitInput({ labelKey, valueCm, onCommit, unit }: Props) {
  const { t } = useI18n()
  const [focused, setFocused] = useState(false)
  const single = unit === 'ft' ? null : { factor: FACTOR[unit], dp: DP[unit], step: STEP[unit] }
  const [text, setText] = useState('')
  const [ftText, setFtText] = useState('')
  const [inText, setInText] = useState('')

  // Follow outside changes (dragging a wall, switching units) unless the user is typing in this field.
  useEffect(() => {
    if (focused) return
    if (single) setText(fmt(valueCm / single.factor, single.dp))
    else {
      const { ft, inch } = splitFeetInches(valueCm)
      setFtText(String(ft))
      setInText(String(inch))
    }
  }, [valueCm, unit, focused]) // eslint-disable-line react-hooks/exhaustive-deps

  const label = (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {t(labelKey)} ({unit === 'ft' ? 'ft / in' : unit})
    </label>
  )

  if (single) {
    return (
      <>
        {label}
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={single.step}
          value={text}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            setText(e.target.value)
            const n = parseFloat(e.target.value)
            if (Number.isFinite(n) && n > 0) onCommit(n * single.factor)
          }}
          className={inputCls}
        />
      </>
    )
  }

  const commitFtIn = (ftStr: string, inStr: string) => {
    const f = parseFloat(ftStr) || 0
    const i = parseFloat(inStr) || 0
    const cm = f * CM_PER_FT + i * CM_PER_IN
    if (f >= 0 && i >= 0 && cm > 0) onCommit(cm)
  }

  return (
    <>
      {label}
      <div
        className="flex gap-2"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
        }}
      >
        <div className="relative flex-1 min-w-0">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            aria-label={`${t(labelKey)} (ft)`}
            value={ftText}
            onChange={(e) => {
              setFtText(e.target.value)
              commitFtIn(e.target.value, inText)
            }}
            className={`${inputCls} pr-8`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">ft</span>
        </div>
        <div className="relative flex-1 min-w-0">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            aria-label={`${t(labelKey)} (in)`}
            value={inText}
            onChange={(e) => {
              setInText(e.target.value)
              commitFtIn(ftText, e.target.value)
            }}
            className={`${inputCls} pr-8`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">in</span>
        </div>
      </div>
    </>
  )
}
