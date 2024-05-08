import { Event, Task } from '@prisma/client';
import { DAYS_OF_WEEK_DICT, DEFAULT_TIMES_OF_DAY } from '../lib/definitions';

export function minutesBetweenDates (earlierDate : Date, laterDate : Date) {
    return (
        Math.round(
            (laterDate.getTime() - earlierDate.getTime()) / 1000 / 60
        )
    );
};

export function hoursBetweenDates (earlierDate : Date, laterDate : Date) {
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

export function calcRepeatIntervalInMinutes(task: Task) {
    if (task.repeat && task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespan && task.repeatTimespanMultiplier) {
        const repeatTimespanInMinutes =
        task.repeatTimespan === 'hour' ? 60 :
        task.repeatTimespan === 'day' ? 60 * 24 :
        task.repeatTimespan === 'week' ? 60 * 24 * 7 :
        task.repeatTimespan === 'month' ? 60 * 24 * 7 * 30.437 :
        task.repeatTimespan === 'year' ? 60 * 24 * 7 * 365.25 : 0;
    
        const repeatInterval = repeatTimespanInMinutes * task.repeatTimespanMultiplier / task.repeatFrequency; // in milliseconds
        return repeatInterval;
    }
    else {
        console.error(`Task '${task.name}' is missing repetition data`);
        return 0;
    }
    
}

export function findNearestDate(dayName: string) {
    const today = new Date();
    const dayOfWeek = today.getDay();  // 0 for Sunday, 1 for Monday, ...
    const dayNum : number = DAYS_OF_WEEK_DICT[dayName];
  
    // Calculate days to add to reach the next Wednesday 
    const daysToAdd = (dayNum - dayOfWeek + 7) % 7; 
  
    const nearestDate = new Date(today.getTime());
    nearestDate.setDate(today.getDate() + daysToAdd);
  
    return nearestDate;
}

export const hourRangeXDate = (hourRange: [number, number], date: Date): [Date, Date] => {
    const [startHour, endHour] = hourRange;
    // Create Date objects for the start and end of the range
    const startDate = new Date(date);
    startDate.setUTCHours(startHour, 0, 0, 0); // Set minutes, seconds, milliseconds to 0
  
    const endDate = new Date(startHour < endHour ? date : date.setDate(date.getDate() + 1));
    endDate.setUTCHours(endHour, 0, 0, 0);
  
    return [startDate, endDate];
}

export const hourRangesXDates = (hourRanges: [number, number][], dates: Date[]): [Date, Date][] => {
    let idealTimes: [Date, Date][] = [];
    for ( let i = 0; i < dates.length; i++ ) {
        for ( let j = 0; j < hourRanges.length; j++) {
            console.log('hourRanges:', hourRanges[j]);
            const dateRange = hourRangeXDate(hourRanges[j], dates[i]);
            console.log('dateRange:', dateRange);
            idealTimes.push(dateRange);
        }
    }
    return idealTimes;
};

export const updateTimeGaps = (event: [Date, Date], timeGaps: [Date, Date][]): [Date, Date][] => {
    
    const affectedGap = timeGaps.filter(gap => (gap[0] <= event[0] && gap[1] >= event[1]))[0];
    const affectedGapIndex = timeGaps.findIndex(el => el === affectedGap);

    // Edit and replace the affected time gap
    const newGaps: [Date, Date][] = 
        affectedGap[0] === event[0] && affectedGap[1] === event[1] ? [] :
        affectedGap[0] === event[0] ? [[event[1], affectedGap[1]]] :
        affectedGap[1] === event[1] ? [[affectedGap[0], event[0]]] :
        [[affectedGap[0], event[0]], [event[1], affectedGap[1]]];
  
    // Remove affected time gap from timeGaps
    const updatedTimeGaps = timeGaps.slice(affectedGapIndex, affectedGapIndex);
    // Insert back in timeGaps array
    updatedTimeGaps.splice(affectedGapIndex, 0, ...newGaps);

    return updatedTimeGaps;
}

export function startOfDay(date: Date): Date {
    return new Date(date.setUTCHours(0, 0, 0, 0));
}

export function dateToDDMMYYYY (date: Date) {
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

export function minutesToDisplayDuration (durationMinutes: number, displaySeconds: boolean = false) {
    const hours = Math.floor(durationMinutes / 60);
    const hoursPlural = hours === 1 ? '' : 's';
    const hoursDisplay = hours > 0 ? `${hours} hr${hoursPlural}` : '';

    const minutes = Math.floor(durationMinutes - hours * 60);
    const minutesDisplay = minutes > 0 ? ` ${minutes} min` : '';
    // const minutesPlural = minutes - (minutes / 60 % 1) === 1 ? '' : 's';

    const seconds = Math.floor((durationMinutes - hours * 60 - minutes) * 60);
    const secondsDisplay = displaySeconds ? seconds > 0 ? ` ${seconds} s` : '' : '';

    return `${hoursDisplay}${minutesDisplay}${secondsDisplay}`;
}

export function minutesToTimerDisplay (durationMinutes: number) {
    const hours = Math.floor(durationMinutes / 60);
    const hoursDisplay = hours > 0 ? `${String(hours)}:` : '';

    const minutes = Math.floor(durationMinutes - hours * 60);
    const minutesDisplay = minutes > 0 ? `${String(minutes).padStart(2, '0')}:` : '';

    const seconds = Math.floor((durationMinutes - hours * 60 - minutes) * 60);
    const secondsDisplay = minutes > 0 || hours > 0 ? String(seconds).padStart(2, '0') : String(seconds);

    return `${hoursDisplay}${minutesDisplay}${secondsDisplay}`;
}

export function dateToHHMM (date: Date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// export function areSameDay(date1: Date, date2: Date) {
//     return (
//         date1.getFullYear() === date2.getFullYear() &&
//         date1.getMonth() === date2.getMonth() &&
//         date1.getDate() === date2.getDate()
//     );
// }

export function areSameDay(date1: Date, date2: Date) {
    const date1Copy = new Date(date1.getTime()); // Create a copy
    const date2Copy = new Date(date2.getTime()); // Create a copy

    date1Copy.setUTCHours(0, 0, 0, 0);
    date2Copy.setUTCHours(0, 0, 0, 0);

    return date1Copy.getTime() === date2Copy.getTime();
  }