const CELL_SIZE = 10;
const GAP = 3;
const STEP = CELL_SIZE + GAP;
const ROWS = 7;
const COLUMNS = 52;
const STAR_SPEED = 60;

type Position = {
    row: number;
    column: number;
};

function getRandomPosition(): Position {
    return {
        row: Math.floor(Math.random() * ROWS),
        column: Math.floor(Math.random() * COLUMNS)
    };
}

function getRandomPositionNear(
    position: Position
): Position {

    let newPosition: Position;
    let distance: number;

    const MIN_DISTANCE = 3;
    const MAX_DISTANCE = 12;

    do {
        newPosition = getRandomPosition();

        const deltaRow =
            newPosition.row - position.row;

        const deltaColumn =
            newPosition.column - position.column;

        distance = Math.sqrt(
            deltaRow ** 2 +
            deltaColumn ** 2
        );

    } while (
        distance < MIN_DISTANCE ||
        distance > MAX_DISTANCE
    );

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

function calculatePathDistance(path: Position[]): number {
    let distance = 0;

    for (let i = 1; i < path.length; i++) {
        const previous = path[i - 1];
        const current = path[i];

        if (!previous || !current) {
            continue;
        }

        const previousX =
            previous.column * STEP + CELL_SIZE / 2;

        const previousY =
            previous.row * STEP + CELL_SIZE / 2;

        const currentX =
            current.column * STEP + CELL_SIZE / 2;

        const currentY =
            current.row * STEP + CELL_SIZE / 2;

        const deltaX = currentX - previousX;
        const deltaY = currentY - previousY;

        distance += Math.sqrt(
            deltaX ** 2 + deltaY ** 2
        );
    }

    return distance;
}

function calculateKeyTimes(path: Position[]): string {
    const distances: number[] = [0];

    let totalDistance = 0;

    for (let i = 1; i < path.length; i++) {
        const previous = path[i - 1];
        const current = path[i];

        if (!previous || !current) {
            continue;
        }

        const previousX =
            previous.column * STEP + CELL_SIZE / 2;

        const previousY =
            previous.row * STEP + CELL_SIZE / 2;

        const currentX =
            current.column * STEP + CELL_SIZE / 2;

        const currentY =
            current.row * STEP + CELL_SIZE / 2;

        const deltaX = currentX - previousX;
        const deltaY = currentY - previousY;

        const segmentDistance = Math.sqrt(
            deltaX ** 2 + deltaY ** 2
        );

        totalDistance += segmentDistance;

        distances.push(totalDistance);
    }

    if (totalDistance === 0) {
        return path.map(() => "0").join(";");
    }

    return distances
        .map((distance) => distance / totalDistance)
        .join(";");
}

function createAnimation(id: number, path: Position[], begin: number): 
    {
    svg: string; duration: number;} 
    {
    const distance = calculatePathDistance(path);

    const duration = distance / STAR_SPEED;

    const translateValues = path
        .map((position) => {
            const x = position.column * STEP + CELL_SIZE / 2;
            const y = position.row * STEP + CELL_SIZE / 2;
            return `${x},${y}`;
        })
        .join(";");

    const keyTimes = calculateKeyTimes(path);

    const svg = `
        <animateTransform
            id="star-translate-${id}"
            attributeName="transform"
            type="translate"
            values="${translateValues}"
            keyTimes="${keyTimes}"
            dur="${duration}s"
            begin="${begin}s"
            fill="freeze"
        />
    `;

    return {svg, duration};
}

function createGlow(): string {
    return `
        <defs>
            <filter
                id="starGlow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
            >
                <feGaussianBlur
                    stdDeviation="3"
                    result="blur"
                />

                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <polygon
            points="0,-6 1.8,-2 6,-2 3,0.8 4,5 0,2.5 -4,5 -3,0.8 -6,-2 -1.8,-2"
            fill="#ffe600"
            filter="url(#starGlow)"
        />
    `;
}

export function createStarAnimation(): string {
    const numberOfPaths = 20;
    const pointsPerPath = 12;

    const animations: string[] = [];
    let currentTime = 0;
    let lastPosition = getRandomPosition(); 

    for (let i = 0; i < numberOfPaths; i++) {
        const path = createPath(pointsPerPath, lastPosition); 
        const animation = createAnimation(i, path, currentTime);

        animations.push(animation.svg);
        currentTime += animation.duration;
        lastPosition = path[path.length - 1]!; 
    }

    return `
    <g>
        ${createGlow()}
        <polygon
            points="0,-6 1.8,-2 6,-2 3,0.8 4,5 0,2.5 -4,5 -3,0.8 -6,-2 -1.8,-2"
            fill="#ffe600"
        />
            ${animations.join("\n")}
        </g>    
    `;
}