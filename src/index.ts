import { writeFileSync } from "node:fs";

function createContributionRect(row: number ,column: number, level: number): string {
    const size = 10;
    const gap = 3;
    let color = "#edebf0";
        if (level === 1) {
            color = "#c4b5fd";
        }

        if (level === 2) {
            color = "#8b5cf6";
        }

        if (level === 3) {
            color = "#6d28d9";
        }

        if (level >= 4) {
            color = "#4c1d95";
        }
    const posX = column * (size + gap);
    const posY = row * (size + gap);

    return `<rect x = "${posX}" y = "${posY}" width = "${size}" height = "${size}" fill = "${color}"/>`;
}

function createContributionGraph(contributions: number[][]): string {

    const rects: string[] = [];

    for (let row = 0; row < contributions.length; row++) {

        const currentRow = contributions[row];

        if (!currentRow) {
            continue;
        }

        for (let column = 0; column < currentRow.length; column++) {

            const level = currentRow[column];

            if (level === undefined) {
                continue;
            }

            const rect = createContributionRect(
                row,
                column,
                level
            );

            rects.push(rect);
        }
    }

    return rects.join("\n");
}

function generateFakeContributions(): number[][] {

    const contributions: number[][] = [];

    for (let row = 0; row < 7; row++) {

        const rowData: number[] = [];

        for (let column = 0; column < 52; column++) {

            const level = Math.floor(Math.random() * 5) 

            rowData.push(level);
            }

        contributions.push(rowData);
    }
    return contributions;
}

function main(): void {

    const contributions = generateFakeContributions();

console.log(contributions);

    const graph = createContributionGraph(contributions);

    const svg = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="720"
        height="130"
    >
        <rect
            width="720"
            height="130"
            fill="#0b1026"
        />

        ${graph}
    </svg>
    `;

    writeFileSync("output/gitstar.svg", svg);

    console.log("⭐ GitStar criado!");
}

main();