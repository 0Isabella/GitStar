import { writeFileSync } from "node:fs";
import { createContributionGraph } from "./graph.js";
import { getGithubContributions } from "./github.js";
import { createStarAnimation } from "./animation.js";

const WIDTH = 720;
const HEIGHT = 130;
const OUTPUT_PATH = "output/gitstar.svg";

function createBackground(): string {
    return `
        <defs>
            <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090b1f" />
                <stop offset="50%" stop-color="#17113b" />
                <stop offset="100%" stop-color="#090b1f" />
            </linearGradient>
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

        stars.push(
            `<circle cx="${x}" cy="${y}" r="${radius}" fill="#ffffff" opacity="${opacity}" />`
        );
    }

    return stars.join("\n");
}

async function main(): Promise<void> {
    const contributions = await getGithubContributions();

    const graph = createContributionGraph(contributions);
    const animation = createStarAnimation();

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
        ${createBackground()}
        ${createBackgroundStars()}
        <g transform="translate(18, 25)">
            ${graph}
            ${animation}
        </g>
    </svg>
    `;

    writeFileSync(OUTPUT_PATH, svg);

    console.log("⭐ GitStar criado!");
}

main().catch((error) => {
    console.error("Falha ao gerar o GitStar:", error instanceof Error ? error.message : error);
    process.exit(1);
});