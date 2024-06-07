// If repeating: Go to its next occurrence -> go to a time that divides perfectly by timespan

import { DayOfWeek, Event, Task } from '@prisma/client';
import { DAYS_OF_WEEK_DICT, MAX_REP_OFFSET } from '../lib/definitions';
import { addMinutesToDate, calcRepeatIntervalInMinutes, minutesBetweenDates } from './dateUtils';
import { addDays } from 'date-fns';

// Can only calculate for tasks that had their first session already scheduled
export const getIdealReps = (task: Task, timespan: [Date, Date], idealFirstRepTime?: Date): Date[] => {
    let idealReps = [];
    if (task.repeat && task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespanMultiplier && task.repeatTimespan) {
        const repInterval = calcRepeatIntervalInMinutes(task);
        // If task has already been repeating, determine the ideal time for the next session
        if (task.firstSessionStartTime && task.repetitionsDone) {
            let idealRep = new Date(task.firstSessionStartTime.getTime() + (task.repetitionsDone + 1) * repInterval * 60 * 1000);
            while (idealRep > timespan[0] && idealRep < timespan[1]) {
                idealReps.push(idealRep);
                idealRep = new Date(idealRep.getTime() + repInterval * 60 * 1000);
            }
        } else if (idealFirstRepTime) {
            let idealRep = idealFirstRepTime;
            while (timespan[0] <= idealRep && idealRep < timespan[1]) {
                idealReps.push(idealRep);
                idealRep = new Date(idealRep.getTime() + repInterval * 60 * 1000);
            }
        }
    } else {
        console.error(`Task ${task.name} does not have enough repetition data`);
    }
    return idealReps;
}

export const idealRepsXTimespan = (
    task: Task, idealDays: Date[], timespan: [Date, Date]
): Date[] => {
    let newIdealDays: Date[] = [];
    const prefDatesSorted = idealDays.sort();
    // TO DO: move getting ideal reps into main function
    const idealReps = getIdealReps(task, timespan);
    idealReps.forEach(rep => {
        const repDay = new Date(rep.setUTCHours(0,0,0,0));
        if (idealDays.includes(repDay)) {
            newIdealDays.push(repDay);
        } else {
            const repIntervalMinutes = calcRepeatIntervalInMinutes(task);
            const impreciseRepSpan = [
                new Date(repDay.getTime() - (repIntervalMinutes * MAX_REP_OFFSET)),
                new Date(repDay.getTime() + (repIntervalMinutes * MAX_REP_OFFSET))
            ];
            // find the nearest prefDate to our repetitionDay
            for ( let i = 0; i <= idealDays.length; i++) {
                const prefDate = prefDatesSorted[i];
                if ( prefDate > impreciseRepSpan[0] && prefDate < impreciseRepSpan[1]) {
                    newIdealDays.push(prefDate);
                } else {
                    // Find to which imprecise timespan limit the prefDate is closer => use that limit
                    if (Math.abs(prefDate.getTime() - impreciseRepSpan[0].getTime()) < Math.abs(prefDate.getTime() - impreciseRepSpan[1].getTime())) {
                        newIdealDays.push(impreciseRepSpan[0]);
                    } else {
                        newIdealDays.push(impreciseRepSpan[1]);
                    }
                }
            }

        }
    });
    return newIdealDays;
}

export const idealRepsXIdealDays = (
    task: Task, idealDays: Date[], timespan: [Date, Date]
): Date[] => {
    let newIdealDays: Date[] = [];
    idealDays.sort();
    // TO DO: move getting ideal reps into main function
    const idealReps = getIdealReps(task, timespan); // Get ideal repetition time for tasks that have already had events scheduled
    console.log(task.name, '> idealReps >', idealReps);
    idealReps.forEach(rep => {
        const repDay = new Date(rep.setUTCHours(0,0,0,0));
        if (idealDays.includes(repDay)) {
            // if repDay is among idealDays
            newIdealDays.push(repDay);
        } else if (timespan[0].getTime() < repDay.getTime() && repDay.getTime() < timespan[1].getTime()) {
            // if repDay is in timespan
            newIdealDays.push(repDay);
        } else {
            const repIntervalMinutes = calcRepeatIntervalInMinutes(task);
            const impreciseRepSpan = [
                new Date(repDay.getTime() - (repIntervalMinutes * MAX_REP_OFFSET)),
                new Date(repDay.getTime() + (repIntervalMinutes * MAX_REP_OFFSET))
            ];
            // find the nearest prefDate to our repetitionDay
            for ( let i = 0; i <= idealDays.length; i++) {
                const prefDate = idealDays[i];
                if ( prefDate > impreciseRepSpan[0] && prefDate < impreciseRepSpan[1]) {
                    newIdealDays.push(prefDate);
                } else {
                    // Find to which imprecise timespan limit the prefDate is closer => use that limit
                    if (Math.abs(prefDate.getTime() - impreciseRepSpan[0].getTime()) < Math.abs(prefDate.getTime() - impreciseRepSpan[1].getTime())) {
                        newIdealDays.push(impreciseRepSpan[0]);
                    } else {
                        newIdealDays.push(impreciseRepSpan[1]);
                    }
                }
            }
        }
    });
    return newIdealDays;
}

export const idealTimesOfDayXIdealReps = (
    task: Task, idealTimesOfDay: [Date, Date][], idealReps: Date[]
): [Date, Date][] => {
    const idealTimesSorted = idealTimesOfDay.sort((a, b) => (a[0].getTime() - b[0].getTime()));
    // console.log('idealReps:', idealReps);
    let newIdealTimes: [Date, Date][] = [];
    let idealTimeIdx = 0;
    idealReps.forEach(rep => {

        // Calculate max repetition offset
        const repIntervalMinutes = calcRepeatIntervalInMinutes(task);
        const impreciseRepSpan = [
            new Date(rep.getTime() - (repIntervalMinutes * 60 * 1000 * MAX_REP_OFFSET)),
            new Date(rep.getTime() + (repIntervalMinutes * 60 * 1000 * MAX_REP_OFFSET))
        ];
        for ( let i = idealTimeIdx; i < idealTimesSorted.length; i++) {
            const idealTimeOfDay = idealTimesSorted[i];
            // console.log('idealRep vs idealTime', rep, idealTimeOfDay);
            if ( idealTimeOfDay[0] <= rep && rep <= idealTimeOfDay[1] ) {
                newIdealTimes.push(idealTimeOfDay);
                idealTimeIdx += 1;
                break;
            } else if ( impreciseRepSpan[0] < idealTimeOfDay[0] && idealTimeOfDay[0] < impreciseRepSpan[1]) {
                newIdealTimes.push(idealTimeOfDay);
                idealTimeIdx += 1;
                break;
            } else {
                // Find to which imprecise timespan limit the prefDate is closer => use that limit
                const idealTimeDuration = (idealTimeOfDay[1].getTime() - idealTimeOfDay[0].getTime()) / 1000 / 60;
                if (Math.abs(idealTimeOfDay[0].getTime() - impreciseRepSpan[0].getTime()) < Math.abs(idealTimeOfDay[0].getTime() - impreciseRepSpan[1].getTime())) {
                    newIdealTimes.push([impreciseRepSpan[0], addMinutesToDate(impreciseRepSpan[0], idealTimeDuration)]);
                } else {
                    newIdealTimes.push([addMinutesToDate(impreciseRepSpan[1], -1 * idealTimeDuration), impreciseRepSpan[1]]);
                }
                idealTimeIdx += 1;
                break;
            }
        }
        if (idealTimesOfDay.length === 0) {
            // If idealTimes are solely based on repetition, use idealReps as idealTimes
            newIdealTimes.push([rep, addMinutesToDate(rep, calcRepeatIntervalInMinutes(task) * MAX_REP_OFFSET)]); // the length of the ideal time is the maximum offset of a repeating task
        }
        
    });
    return newIdealTimes;
}

export const findMatchingDaysOfWeekInTimespan = (dayNames: DayOfWeek[], timespan: [Date, Date]) => {
    const matchingDates: Date[] = [];
    for (let i = 0; i < dayNames.length; i++) {
        const dayName = String(dayNames[i]);
        const dateCursor = new Date(timespan[0]);
        while (dateCursor <= timespan[1]) {
            if (dateCursor.getDay() === DAYS_OF_WEEK_DICT[dayName]) {
                matchingDates.push(new Date(dateCursor.setUTCHours(0,0,0,0)));
            }
            dateCursor.setDate(dateCursor.getDate() + 1);
        }
    }
    return matchingDates;
}

export function checkGapIsFree(events: Event[], start: Date, end: Date) {
    const eventsInGap = events.filter(el => {
        if (el.startTime <= start && start < el.endTime) return true;
        if (el.startTime <= end && end < el.endTime) return true;
        if (start <= el.startTime && el.endTime <= end) return true;
        return false;
    });
    if (eventsInGap.length) return false;
    return true;
}

export function findEventsInTimespan(timespan: [Date, Date], events: (Event[] | BasicEvent[])) {
    const eventsInTimespan = events.filter(el => {
        if (el.startTime <= timespan[0] && timespan[0] < el.endTime) return true;
        if (el.startTime <= timespan[1] && timespan[1] < el.endTime) return true;
        if (timespan[0] <= el.startTime && el.endTime <= timespan[1]) return true;
        return false;
    });
    return eventsInTimespan;
}

// export function findGapsInTimespan(start: Date, end: Date, events: Event[]) {
//     const eventsInTimespan = events.filter(el => {
//         if (el.startTime <= start && start < el.endTime) return true;
//         if (el.startTime <= end && end < el.endTime) return true;
//         if (start <= el.startTime && el.startTime <= end) return true;
//         return false;
//     });
//     const gapsInTimespan: Date[] = [];
//     for (let i = 1; i < eventsInTimespan.length; i++) {
//         eventsInTimespan[i] <= 
//     }
// }

export type BasicEvent = {
    startTime: Date,
    endTime: Date,
}

export function findGapsInTimespan(timespan: [Date, Date], events: (BasicEvent[] | Event[]), minDuration?: number) {
    // Find existing events in the timespan
    const eventsInTimespan = findEventsInTimespan(timespan, events);
    const eventTimes = eventsInTimespan.map(event => [event.startTime, event.endTime]).sort((a, b) => a[0].getTime() - b[0].getTime());
    console.log('eventTimes', eventTimes);

    // Get the timegaps between the events
    let timeGaps : [Date, Date][] = [];
    // If there are no events, set timespan as the only timeGap
    if(!eventTimes.length) {
        timeGaps.push([timespan[0], timespan[1]]);
    } else {
        for ( let idx = 0; idx < eventTimes.length; idx++) {
            // const eventStartEnd = eventTimes[idx];
            if ( idx === 0 ) {
                if (minutesBetweenDates(timespan[0], eventTimes[idx][0]) >= (minDuration || 10) ) {
                    timeGaps.push([timespan[0], eventTimes[idx][0]]);
                }
            } else if (idx === eventTimes.length - 1) {
                if (minutesBetweenDates(eventTimes[idx][1], timespan[1]) > (minDuration || 10)) {
                    timeGaps.push([eventTimes[idx][1], timespan[1]]);
                }
            } else if (minutesBetweenDates(eventTimes[idx - 1][1], eventTimes[idx][0]) > (minDuration || 10)) {
                timeGaps.push([eventTimes[idx - 1][1], eventTimes[idx][0]]);
            }
        }
        timeGaps = timeGaps.sort((a, b) => (
            a[0].getTime() - b[0].getTime()
        ));
    }

    // Filter time gaps that can fir our minimum duration
    // if (minDuration) {
    //     const timeGapsWithMinDuration = timeGaps.filter(gap => minutesBetweenDates(gap[0], gap[1]) >= minDuration);
    //     console.log('timeGaps with minDuration', timeGapsWithMinDuration);
    //     return timeGapsWithMinDuration;
    // }
    return timeGaps;
}

export function findGapsThatStartInTimespan(timespan: [Date, Date], events: (BasicEvent[] | Event[]), taskDuration?: number) {
    // Find existing events in the timespan
    const eventsInTimespan = findEventsInTimespan(timespan, events);
    const eventAfterTimespan = events.filter(el => timespan[1] <= el.startTime)[0];
    if (eventAfterTimespan) {
        eventsInTimespan.push(eventAfterTimespan);
    }
    const eventspans = eventsInTimespan.map(event => [event.startTime, event.endTime]);
    // Sort eventspans
    eventspans.sort((a, b) => a[0].getTime() - b[0].getTime());
    console.log('eventspans >', eventspans);

    // Find gaps between the eventspans
    let timeGaps : [Date, Date][] = [];
    // If there are no events, set timespan as the only timeGap
    if(!eventspans.length) {
        timeGaps.push([timespan[0], timespan[1]]);
    } else {
        for ( let i = 0; i <= eventspans.length; i++) {
            if ( i === 0 ) {
                if (minutesBetweenDates(timespan[0], eventspans[i][0]) >= (taskDuration || 10) ) {
                    timeGaps.push([timespan[0], eventspans[i][0]]);
                }
            } else if (i === eventspans.length) {
                if (!eventAfterTimespan && taskDuration) {
                    timeGaps.push([eventspans[i - 1][1], addMinutesToDate(eventspans[i - 1][1], taskDuration)]);
                }
            } else if (minutesBetweenDates(eventspans[i - 1][1], eventspans[i][0]) >= (taskDuration || 10)) {
                timeGaps.push([eventspans[i - 1][1], eventspans[i][0]]);
            }
        }
        timeGaps = timeGaps.sort((a, b) => (
            a[0].getTime() - b[0].getTime()
        ));
    }
    if (taskDuration) {
        const timeGapsWithMinDuration = timeGaps.filter(gap => minutesBetweenDates(gap[0], gap[1]) >= taskDuration);
        return timeGapsWithMinDuration
    }
    return timeGaps;
}

// export function createEventObj(task: Task, startTime: Date, duration?: number) {

//     const endTime = new Date(startTime.getTime() + (duration || task.duration) * 60 * 1000);
  
//     const newEvent: Event = {
//       id: uuidv4(),
//       name: task.name,
//       status: task.status,
//       fixed: task.fixed,
//       taskId: task.id,
//       startTime: startTime,
//       endTime: endTime,
//       userStartTime: null,
//       userEndTime: null,
//       notes: null,
//       createdAt: new Date()
//     }

//     return newEvent;
// }

export const timespanToDatesArray = (timespan: [Date, Date]): Date[] => {
    const datesInTimespan: Date[] = [];
    const dateCursor = new Date(new Date(timespan[0]).setUTCHours(0,0,0,0));
    while (dateCursor <= timespan[1]) {
        datesInTimespan.push(new Date(dateCursor));
        dateCursor.setDate(dateCursor.getDate() + 1);
    }
    return datesInTimespan;
}

/**
 * Finds the intersection of two time spans.
 * @param span1 - The first time span as a [Date, Date] array.
 * @param span2 - The second time span as a [Date, Date] array.
 * @returns The intersection of the time spans as a [Date, Date] array, or null if there is no intersection.
 */
export function intersectTimespans(span1: [Date, Date], span2: [Date, Date]): [Date, Date] | null {
    const [start1, end1] = span1;
    const [start2, end2] = span2;
  
    // Ensure the spans are valid
    if (start1 >= end1 || start2 >= end2) {
      throw new Error("Invalid time span");
    }
  
    // Calculate the intersection
    const intersectStart = new Date(Math.max(start1.getTime(), start2.getTime()));
    const intersectEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
  
    // Check if there is an intersection
    if (intersectStart < intersectEnd) {
      return [intersectStart, intersectEnd];
    } else {
      return null; // No intersection
    }
}

export const dayXHourInterval = (day: Date, hourInterval: [number, number]): [Date, Date] => {
    let dayXTimeOfDay: [Date, Date] = [
        new Date(new Date(day).setHours(hourInterval[0], 0, 0, 0)), 
        new Date(new Date(
            hourInterval[0] < hourInterval[1] ? day : addDays(day, 1) // For night and other hour intervals with cross midnight
        ).setHours(hourInterval[1], 0, 0, 0))
    ];
    return dayXTimeOfDay;
}