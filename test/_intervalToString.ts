import { Interval } from '../src/Interval'
import { inspect } from 'util'

export function intervalToString<T> (i: Interval<T>): string {
  function valueToString (v: T | undefined | null): string {
    if (typeof v === 'string') {
      return v
    }
    if (typeof v === 'number' || v instanceof Date) {
      return v.toString()
    }
    return inspect(v)
  }

  return `[${valueToString(i.start)}, ${valueToString(i.end)}[`
}
