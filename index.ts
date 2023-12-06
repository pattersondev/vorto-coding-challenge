import fs from 'fs';

interface Load {
    id: number;
    pickUp: { x: number; y: number };
    dropOff: { x: number; y: number };
}

interface Driver {
    id: number;
    schedule: number[];
}

/**
 * I'm not sure if this counts as a resource but i'm going to include it to be safe.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
 */
function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}


/**
 * Resources used to create the below function.
 * https://www.myrouteonline.com/blog/shortest-path-algorithms
 * https://brilliant.org/wiki/greedy-algorithm/#:~:text=A%20greedy%20algorithm%20is%20a,to%20solve%20the%20entire%20problem.
 * https://www.youtube.com/watch?v=bC7o8P_Ste4
 */
function runVRP(loads: Load[]): Driver[] {
    const drivers: Driver[] = Array.from({ length: 1 }, (_, index) => ({
        id: index + 1,
        schedule: [],
    }));

    // Was used for testing.
    let totalCost = 0;
    let index = 0;

    for (const driver of drivers) {
        let depot = { x: 0, y: 0 };
        let totalDriveTime = 0;
        index++;

        for (let i = 0; i < loads.length; i++) {
            const load = loads[i];
            const currDriveTime = calculateDistance(depot, load.pickUp) + calculateDistance(load.pickUp, load.dropOff);
            const returnHome = totalDriveTime + currDriveTime + calculateDistance(load.dropOff, { x: 0, y: 0 });

            if (returnHome < 12 * 60) {
                driver.schedule.push(load.id);
                totalDriveTime += currDriveTime;
                depot = load.dropOff;
                loads.splice(i, 1);
                i--;
                totalCost += 500 + totalDriveTime;
            }
        }

        if (loads.length > 0) {
            drivers.push({ id: index, schedule: [] });
        }
    }

    return drivers;
}

/**
 * Resources used to create the below function.
 * https://www.rexegg.com/regex-quickstart.html
 */
function main(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');

    const loads: Load[] = [];

    for (let index = 1; index < lines.length; index++) {
        const line = lines[index];
        const [id, pickup, dropoff] = line.split(' ');

        const pickupCoordinates = pickup.match(/\(([^,]+),([^)]+)\)/);
        const dropoffCoordinates = dropoff.match(/\(([^,]+),([^)]+)\)/);

        // Just to satisfy typescript compiler.
        if (!pickupCoordinates || !dropoffCoordinates) {
            throw new Error();
        }

        const pickupX = parseFloat(pickupCoordinates[1]);
        const pickupY = parseFloat(pickupCoordinates[2]);
        const dropoffX = parseFloat(dropoffCoordinates[1]);
        const dropoffY = parseFloat(dropoffCoordinates[2]);

        loads.push({
            id: parseInt(id),
            pickUp: { x: pickupX, y: pickupY },
            dropOff: { x: dropoffX, y: dropoffY },
        });
    }

    const solution = runVRP(loads);

    for (const driver of solution) {
        console.log(`[${driver.schedule.join(',')}]`);
    }
}

const inputFilePath = process.argv[2];
main(inputFilePath);
