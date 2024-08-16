import { DayOfWeek, Event, Task } from '@prisma/client';
import { DAYS_OF_WEEK_DICT, DEFAULT_TIMES_OF_DAY } from '@/lib/definitions';

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
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

// Convert events from database to HexaFlexa events
import { localDateTimeToString, utcDateTimeToString } from '@hexaflexa/timegrid';
import { toZonedTime } from 'date-fns-tz';
export const eventsToHf = (events: Event[], eventColours: string[], timezone: string) => {
    let eventsForHf = [];
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const [ startTime, endTime ] = getLocalStartAndEnd(event);
        if ( areSameDay(new Date(startTime), new Date(endTime)) ) {
            // Events that start and end on the same day
            eventsForHf.push({
                id: event.id,
                taskId: event.taskId,
                title: event.name,
                resources: ['1'],
                start: startTime,
                end: endTime,
                style: {
                    backgroundColor: eventColours[i]
                },
            });
        } else {
            // Events that start and end in different days
            const endTimeCopy = new Date(endTime);
            const endTimeEndDay = new Date(endTimeCopy.setUTCHours(23,59,0,0));
            for (let d = new Date(startTime); d <= endTimeEndDay; d.setDate(d.getDate() + 1)) {
                const dCopy = new Date(d.getTime());
                const start = d.getTime() === new Date(startTime).getTime() ? startTime : utcDateTimeToString(new Date(dCopy.setUTCHours(0,0,0,0)));
                const end = d < new Date(endTime) ? utcDateTimeToString(new Date(dCopy.setUTCHours(23, 59, 0, 0))) : endTime;
                eventsForHf.push({
                    id: event.id,
                    taskId: event.taskId,
                    title: event.name,
                    resources: ['1'],
                    start: start,
                    end: end,
                    style: {
                        backgroundColor: eventColours[i]
                    },
                });
            }
        }
    }
    // console.log('eventsForHf', eventsForHf);
    return eventsForHf;
}

export const getMinutesBetweenLocalAndUTC = (event: Event) => {
    if (!event.localTime) return 0;
    const startTimeAsNum = (new Date(event.startTime)).setHours(Number(event.localTime.split(':')[0]), Number(event.localTime.split(':')[1]));
    const minutesBetweenLocalTimes = minutesBetweenDates(new Date(startTimeAsNum), new Date(event.startTime));
    return minutesBetweenLocalTimes;
}

export const getLocalStartAndEnd = (event: Event) => {
    
    let [ startTime, endTime ] = ['', ''];
    if (event.localTime) {
        // Get startTime from localTime
        const startTimeAsNum = (new Date(event.startTime)).setHours(Number(event.localTime.split(':')[0]), Number(event.localTime.split(':')[1]));
        startTime = localDateTimeToString(new Date(startTimeAsNum));
        // Get endTime using timezone difference
        const minutesBetweenLocalTimes = minutesBetweenDates(new Date(startTimeAsNum), new Date(event.startTime));
        endTime = localDateTimeToString(addMinutesToDate(new Date(event.endTime), -1 * minutesBetweenLocalTimes));
    } else {
        startTime = localDateTimeToString(new Date(event.startTime));
        endTime = localDateTimeToString(new Date(event.endTime));
    }
    return [startTime, endTime];
}


export const getZonedNow = (timezone: string = 'Europe/London') => {
    return new Date(toZonedTime(new Date(), timezone));
}

export const getStartAndEndOfDay = (day: Date): [Date, Date] => {
    return [
        new Date(new Date(day).setUTCHours(0,0,0,0)),
        new Date(new Date(day).setUTCHours(23,59,59,999))
    ];
}

/**
 * 
 * @param obj Any object with potential date props saved as string
 * @returns The same object, after converting all valid date props into Date objects
 */
export function convertPropsToDate(obj: any): any {
    const result: Record<string, any> = { ...obj };

    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            const value = result[key];

            // Check if the value is a string that can be converted to a valid Date
                // Strings like 'Test 2' seem to be parsed as a date; Removing the space resolves this
            if (typeof value === 'string' && Date.parse(value.replace(' ', ''))) { 
                result[key] = new Date(value);
            }
        }
    }

    return result;
}

/**
 * 
 * @param date date object to covert
 * @returns local date formatted as string 'yyyy-MM-dd' for HTML input
 */
export function dateToHtmlInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}