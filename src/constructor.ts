/**
 * When an `object` is used as point, it's precise type is expressed by its constructor.
 *
 * Any constructor represents a possible point type.
 */
export type Constructor<T extends Object> = new (...args: never[]) => T
