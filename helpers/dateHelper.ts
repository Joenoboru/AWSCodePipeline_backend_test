/**
 *
 * @param {number} year
 * @param {number} month
 */
function toYMFormat(year: number | string, month: number | string): string {
    return `${year}${Number(month).toString().padStart(2, "0")}`;
}

export { toYMFormat };
