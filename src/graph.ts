const SIZE = 10;
const GAP = 3;

const LEVEL_COLORS = [
    "#a274e723",
    "#c4b5fd",
    "#8b5cf6",
    "#6d28d9",
    "#4c1d95"
];

const FLASH_COLOR = "#ffe600";
const FLASH_HALF_DURATION = 0.5;
const MIN_KEYFRAME_GAP = 0.001;
const CELL_GLOW_ID = "cellGlow";
const GLOW_LEAD_TIME = 0.15;

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Set", "Oct", "Nov", "Dec"
];

export function createMonthLabels(weekDates: string[]): string {
    const labels: string[] = [];
    let lastMonth = -1;

    for (let column = 0; column < weekDates.length; column++) {
        const dateStr = weekDates[column];
        if (!dateStr) continue;

        const month = new Date(dateStr).getUTCMonth();

        if (month !== lastMonth) {
            const posX = column * (SIZE + GAP);
            labels.push(
                `<text x="${posX}" y="0" font-size="10" fill="#c4b5fd" font-family="sans-serif">${MONTH_NAMES[month]}</text>`
            );
            lastMonth = month;
        }
    }

    return labels.join("\n");
}

function getColorForLevel(level: number): string {
    const index = Math.min(level, LEVEL_COLORS.length - 1);
    return LEVEL_COLORS[index]!;
}

function createHitAnimation(
    baseColor: string,
    hitTimes: number[],
    totalDurationSeconds: number
): string {
    if (hitTimes.length === 0 || totalDurationSeconds <= 0) return "";

    const halfFlash = FLASH_HALF_DURATION / totalDurationSeconds;

    const keyframes: { time: number; color: string }[] = [{ time: 0, color: baseColor }];

    const glowKeyframes: { time: number; filter: string }[] = [{ time: 0, filter: "none" }];


    for (const hit of [...hitTimes].sort((a, b) => a - b)) {
        const previousTime = keyframes[keyframes.length - 1]!.time;

        const start = Math.min(0.999, Math.max(previousTime + MIN_KEYFRAME_GAP, hit - GLOW_LEAD_TIME/ totalDurationSeconds));
        const peak = Math.min(0.9995, Math.max(start + MIN_KEYFRAME_GAP, hit));
        const end = Math.min(1, Math.max(peak + MIN_KEYFRAME_GAP, peak + halfFlash));

        keyframes.push({ time: start, color: baseColor });
        keyframes.push({ time: peak, color: FLASH_COLOR });
        keyframes.push({ time: end, color: baseColor });

        glowKeyframes.push({ time: start, filter: `url(#${CELL_GLOW_ID})` });
        glowKeyframes.push({ time: end, filter: "none" });
    }

    if (keyframes[keyframes.length - 1]!.time < 1) {
        keyframes.push({ time: 1, color: baseColor });
    }

    if (glowKeyframes[glowKeyframes.length - 1]!.time < 1) {
        glowKeyframes.push({ time: 1, filter: "none" });
    }
    const fillKeyTimes = keyframes.map((k) => k.time.toFixed(4)).join(";");
    const fillValues = keyframes.map((k) => k.color).join(";");

    const glowKeyTimes = glowKeyframes.map((k) => k.time.toFixed(4)).join(";");
    const glowValues = glowKeyframes.map((k) => k.filter).join(";");

    return `
        <animate
            attributeName="fill"
            values="${fillValues}"
            keyTimes="${fillKeyTimes}"
            dur="${totalDurationSeconds}s"
            repeatCount="indefinite"
            calcMode="linear"
        />
        <animate
            attributeName="filter"
            values="${glowValues}"
            keyTimes="${glowKeyTimes}"
            dur="${totalDurationSeconds}s"
            repeatCount="indefinite"
            calcMode="discrete"
        />
    `;
}

export function createContributionRect(
    row: number,
    column: number,
    level: number,
    hitTimes: number[] = [],
    totalDurationSeconds: number = 0
): string {
    const color = getColorForLevel(level);
    const posX = column * (SIZE + GAP);
    const posY = row * (SIZE + GAP);
    const hitAnimation = createHitAnimation(color, hitTimes, totalDurationSeconds);

    return `<rect x="${posX}" y="${posY}" width="${SIZE}" height="${SIZE}" fill="${color}">${hitAnimation}</rect>`;
}

export function createContributionGraph(
    contributions: number[][],
    cellHits: Map<string, number[]> = new Map(),
    totalDurationSeconds: number = 0
): string {
    const rects: string[] = [];

    for (let row = 0; row < contributions.length; row++) {
        const currentRow = contributions[row];
        if (!currentRow) continue;

        for (let column = 0; column < currentRow.length; column++) {
            const level = currentRow[column];
            if (level === undefined) continue;

            const hitTimes = cellHits.get(`${row}-${column}`) ?? [];
            rects.push(createContributionRect(row, column, level, hitTimes, totalDurationSeconds));
        }
    }

    return rects.join("\n");
}