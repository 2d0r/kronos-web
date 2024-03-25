import { DEFAULT_TIMES_OF_DAY } from '../lib/definitions';

export const minutesBetweenDates = (earlierDate : Date, laterDate : Date) => {
    return (
        Math.round(
            (laterDate.getTime() - earlierDate.getTime()) / 1000 / 60
        )
    );
};

export const hoursBetweenDates = (earlierDate : Date, laterDate : Date) => {
    return (
        Math.round(
            (laterDate.getTime() - earlierDate.getTime()) / 1000 / 60 / 60
        )
    );
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

export function addDaysToDate(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function calcRepeatIntervalInMinutes(repeatFrequency: number, repeatTimespanMultiplier: number, repeatTimespan: string) {
    const repeatTimespanInMinutes =
        repeatTimespan === 'hour' ? 60 :
        repeatTimespan === 'day' ? 60 * 24 :
        repeatTimespan === 'week' ? 60 * 24 * 7 :
        repeatTimespan === 'month' ? 60 * 24 * 7 * 30.437 :
        repeatTimespan === 'year' ? 60 * 24 * 7 * 365.25 : 0;
    const repeatInterval = repeatTimespanInMinutes * repeatTimespanMultiplier / repeatFrequency; // in milliseconds
    return repeatInterval;
}