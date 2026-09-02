import { writeFileSync } from "node:fs";
import { createContributionGraph, createMonthLabels } from "./graph.js";
import { getGithubContributions } from "./github.js";
import { createStarAnimation } from "./animation.js";

const WIDTH = 720;
const HEIGHT = 145;

function createBackground(): string {
    return `
        <defs>
            <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090b1f" />
                <stop offset="50%" stop-color="#17113b" />
                <stop offset="100%" stop-color="#090b1f" />
            </linearGradient>

            <filter id="cellGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#spaceGradient)" />
    `;
}

function createBackgroundStars(): string {
    const stars: string[] = [];

    for (let i = 0; i < 150; i++) {
        const x = Math.random() * WIDTH;
        const y = Math.random() * HEIGHT;
        const radius = Math.random() * 1.2 + 0.3;
        const opacity = Math.random() * 0.7 + 0.3;

        const duration = Math.random() * 2 + 1;
        const delay = Math.random() * 3;

        stars.push(
            `<circle cx="${x}" cy="${y}" r="${radius}" fill="#ffffff" opacity="${opacity}">
            <animate attributeName="opacity" values="${opacity};${opacity * 0.2};${opacity}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
            </circle>`
        );
    }

    return stars.join("\n");
}

async function main(): Promise<string> {
    const { contributions, weekDates } = await getGithubContributions();

    const { svg: animation, duration, cellHits } = createStarAnimation();
    const graph = createContributionGraph(contributions, cellHits, duration);
    const monthLabels = createMonthLabels(weekDates);

    console.log("-=-⋆-=-⋆ ✧ ⋆-=-⋆-=-");
    console.log("⋮ GitStar's ready! ⋮");
    console.log("-=-⋆-=-⋆ ✧ ⋆-=-⋆-=-");

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
        ${createBackground()}
        ${createBackgroundStars()}
        <g transform="translate(17, 20)">
            ${monthLabels}
        </g>
        <g transform="translate(17, 35)">
            ${graph}
            ${animation}
        </g>
    </svg>
    `;
    
    writeFileSync("gitstar.svg", svg);

    return svg;
}

main().catch((error) => {
    console.error("Falha ao gerar o GitStar:", error instanceof Error ? error.message : error);
    process.exit(1);
});