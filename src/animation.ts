const CELL_SIZE = 10;
const GAP = 3;
const STEP = CELL_SIZE + GAP;
const ROWS = 7;
const COLUMNS = 52;
const STAR_SPEED = 60;

const STAR_POLYGON_POINTS =
    "0,-6 1.8,-2 6,-2 3,0.8 4,5 0,2.5 -4,5 -3,0.8 -6,-2 -1.8,-2";

type Position = {
    row: number;
    column: number;
};

type Point = {
    x: number;
    y: number;
};

function getRandomPosition(): Position {
    return {
        row: Math.floor(Math.random() * ROWS),
        column: Math.floor(Math.random() * COLUMNS)
    };
}

function getRandomPositionNear(position: Position): Position {
    const MIN_DISTANCE = 3;
    const MAX_DISTANCE = 12;

    let newPosition: Position;
    let distance: number;

    do {
        newPosition = getRandomPosition();
        const deltaRow = newPosition.row - position.row;
        const deltaColumn = newPosition.column - position.column;
        distance = Math.sqrt(deltaRow ** 2 + deltaColumn ** 2);
    } while (distance < MIN_DISTANCE || distance > MAX_DISTANCE);

    return newPosition;
}

function createPath(numberOfPoints: number, startPosition: Position): Position[] {
    const path: Position[] = [startPosition];
    let current = startPosition;
    for (let i = 0; i < numberOfPoints; i++) {
        current = getRandomPositionNear(current);
        path.push(current);
    }
    return path;
}

function positionToPoint(position: Position): Point {
    return {
        x: position.column * STEP + CELL_SIZE / 2,
        y: position.row * STEP + CELL_SIZE / 2
    };
}

function analyzePath(path: Position[]): { totalDistance: number; keyTimes: string } {
    const points = path.map(positionToPoint);
    const cumulative: number[] = [0];
    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
        const deltaX = points[i]!.x - points[i - 1]!.x;
        const deltaY = points[i]!.y - points[i - 1]!.y;
        totalDistance += Math.sqrt(deltaX ** 2 + deltaY ** 2);
        cumulative.push(totalDistance);
    }

    const keyTimes =
        totalDistance === 0
            ? path.map(() => "0").join(";")
            : cumulative.map((d) => d / totalDistance).join(";");

    return { totalDistance, keyTimes };
}

function createAnimation(
    id: number,
    path: Position[],
    begin: number
): { svg: string; duration: number } {
    const { totalDistance, keyTimes } = analyzePath(path);
    const duration = totalDistance / STAR_SPEED;

    const translateValues = path
        .map((position) => {
            const { x, y } = positionToPoint(position);
            return `${x},${y}`;
        })
        .join(";");

    const svg = `
        <animateTransform
            id="star-translate-${id}"
            attributeName="transform"
            type="translate"
            values="${translateValues}"
            keyTimes="${keyTimes}"
            dur="${duration}s"
            begin="${begin}s"
        />
    `;

    return { svg, duration };
}

function createGlowFilter(): string {
    return `
        <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    `;
}

export function createStarAnimation(): string {
    const numberOfPaths = 200;
    const pointsPerPath = 12;

    const firstPosition = getRandomPosition();
    let lastPosition = firstPosition;

    const allPositions: Position[] = [firstPosition];

    for (let i = 0; i < numberOfPaths; i++) {
        const path = createPath(pointsPerPath, lastPosition);

        for (let j = 1; j < path.length; j++) {
            allPositions.push(path[j]!);
        }

        lastPosition = path[path.length - 1]!;
    }

    allPositions.push(firstPosition);

    const translateValues = allPositions
        .map((position) => {
            const { x, y } = positionToPoint(position);
            return `${x},${y}`;
        })
        .join(";");

    const { totalDistance, keyTimes } = analyzePath(allPositions);

    const duration = totalDistance / STAR_SPEED;

    const svg = `
        <g>
            <defs>${createGlowFilter()}</defs>

            <polygon
                points="${STAR_POLYGON_POINTS}"
                fill="#ffe600"
                filter="url(#starGlow)"
            />

            <animateTransform
                id="star-translate"
                attributeName="transform"
                type="translate"
                values="${translateValues}"
                keyTimes="${keyTimes}"
                dur="${duration}s"
                repeatCount="indefinite"
                calcMode="linear"
            />
        </g>
    `;
    return svg;
}