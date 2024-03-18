import { DEFAULT_TIMES_OF_DAY } from "../lib/definitions";

export const dateDifferenceInMinutes = (dateA : Date, dateB : Date) => {
    return (
        Math.round(
            (dateA.getTime() - dateB.getTime()) / 1000 / 60
        )
    )
};

export function getCurrentTimeOfDay() {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    for (const [timeOfDay, range] of Object.entries(DEFAULT_TIMES_OF_DAY)) {
        if (
            (range[0] < range[1] && hours >= range[0] && hours <= range[1] - 1) ||
            (range[0] > range[1] && (hours >= range[0] || hours <= range[1] - 1))
        )
            return [timeOfDay, range];
        return ['', [-1, -1]];
    }
}

export function addMinutesToDate(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}