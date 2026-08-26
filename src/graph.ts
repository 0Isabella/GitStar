const SIZE = 10;
const GAP = 3;

const LEVEL_COLORS = [
    "#a274e723",
    "#c4b5fd",
    "#8b5cf6",
    "#6d28d9",
    "#4c1d95"
];

function getColorForLevel(level: number): string {
    const index = Math.min(level, LEVEL_COLORS.length - 1);
    return LEVEL_COLORS[index]!;
}

export function createContributionRect(row: number, column: number, level: number): string {
    const color = getColorForLevel(level);
    const posX = column * (SIZE + GAP);
    const posY = row * (SIZE + GAP);

    return `<rect x="${posX}" y="${posY}" width="${SIZE}" height="${SIZE}" fill="${color}"/>`;
}

export function createContributionGraph(contributions: number[][]): string {
    const rects: string[] = [];

    for (let row = 0; row < contributions.length; row++) {
        const currentRow = contributions[row];
        if (!currentRow) continue;

        for (let column = 0; column < currentRow.length; column++) {
            const level = currentRow[column];
            if (level === undefined) continue;

            rects.push(createContributionRect(row, column, level));
        }
    }

    return rects.join("\n");
}