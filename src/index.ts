import { writeFileSync } from "node:fs";
import { createContributionGraph } from "./graph.js";
import { getGithubContributions } from "./github.js";
import { createStarAnimation } from "./animation.js";

function createBackground(): string {
    return `
        <defs>
            <linearGradient
                id="spaceGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop
                    offset="0%"
                    stop-color="#090b1f"
                />

                <stop
                    offset="50%"
                    stop-color="#17113b"
                />

                <stop
                    offset="100%"
                    stop-color="#090b1f"
                />
            </linearGradient>
        </defs>

        <rect
            width="720"
            height="130"
            fill="url(#spaceGradient)"
        />
    `;
}

function createBackgroundStars(): string {
    const stars: string[] = [];

    for (let i = 0; i < 150; i++) {
        const x = Math.random() * 720;
        const y = Math.random() * 130;
        const radius = Math.random() * 1.2 + 0.3;

        stars.push(`
            <circle
                cx="${x}"
                cy="${y}"
                r="${radius}"
                fill="#ffffff"
                opacity="${Math.random() * 0.7 + 0.3}"
            />
        `);
    }

    return stars.join("\n");
}

async function main(): Promise<void> {

    const contributions = await getGithubContributions();

    console.log(contributions);

    const graph = createContributionGraph(contributions);

    const animation = createStarAnimation();

    const svg = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="720"
        height="130"
        >

        ${createBackground()}
        ${createBackgroundStars()}
        <g transform="translate(22, 19.5)"> 
            ${graph} 
            ${animation}
        </g>
    </svg>
    `;

    writeFileSync("output/gitstar.svg", svg);

    console.log("⭐ GitStar criado!");
}

main();