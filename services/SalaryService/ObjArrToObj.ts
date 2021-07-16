/**
 *
 * @param {Array<T>} arr
 * @param {(value: T, index: number, array: T[]) => U} func
 */
export const ObjArrToObj = (arr, func) => {
    return Object.fromEntries(new Map(arr.map(func)));
};
