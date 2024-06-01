// If repeating: Go to its next occurrence -> go to a time that divides perfectly by timespan

import { Task } from '@prisma/client';
import { MAX_REP_OFFSET } from '../lib/definitions';
import { addMinutesToDate, calcRepeatIntervalInMinutes } from './dateUtils';

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

export const idealDaysXIdealReps = (
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

export const idealTimesOfDayXIdealReps = (
    task: Task, idealTimesOfDay: [Date, Date][], idealReps: Date[]
): [Date, Date][] => {
    const idealTimesSorted = idealTimesOfDay.sort((a, b) => (a[0].getTime() - b[0].getTime()));
    console.log('idealReps:', idealReps);
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
            console.log('idealRep vs idealTime', rep, idealTimeOfDay)
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