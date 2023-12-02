import fs from 'fs';

//!! All references for total costs were purely for my own testing purposes.

let totalCost = 0;

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
function runVRP(loads: Load[], numberOfDrivers: number): Driver[] {

    const drivers: Driver[] = Array.from({ length: numberOfDrivers }, (_, index) => ({
        id: index + 1,
        schedule: [],
    }));

    for (const load of loads) {
        let closestDriver: Driver | undefined;
        let minDistance = Number.MAX_SAFE_INTEGER;
        let totalDriveTime = 0;
        for (const driver of drivers) {
            totalDriveTime =
                driver.schedule.reduce(sum => sum + calculateDistance(load.pickUp, load.dropOff), 0) +
                calculateDistance({ x: 0, y: 0 }, load.pickUp) +
                calculateDistance(load.pickUp, load.dropOff);

            if (totalDriveTime < 12 * 60 && totalDriveTime < minDistance) {
                closestDriver = driver;
                minDistance = totalDriveTime;
            }
        }

        if (closestDriver) {
            closestDriver.schedule.push(load.id);
            totalCost += 500 + totalDriveTime;
        }
    }

    return drivers;
}

/**
 * Resources used to create the below function.
 * https://www.rexegg.com/regex-quickstart.html
 */
function main(filePath: string, numberOfDrivers: number): void {
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

    const solution = runVRP(loads, numberOfDrivers);

    for (const driver of solution) {
        console.log(`[${driver.schedule.join(',')}]`);
    }

    //!! This was just used for my own testing purposes.
    //console.log(`Total Cost: ${totalCost.toFixed(2)}`);
}

const inputFilePath = process.argv[2];
const numberOfDrivers = parseInt(process.argv[3]);
main(inputFilePath, numberOfDrivers);
