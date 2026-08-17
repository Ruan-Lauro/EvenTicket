export function resolveSeatsPerRow(capacity: number): number {
    if (capacity <= 200) return 10;
    if (capacity <= 500) return 15;
    return 20;
}
 

export function indexToRowLabel(index: number): string {
    let label = "";
    let n = index;

    do {
        label = String.fromCharCode(65 + (n % 26)) + label;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);

    return label;
}