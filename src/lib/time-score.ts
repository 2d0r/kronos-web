import { Task } from '@prisma/client';
import { calcRepeatIntervalInMinutes, hoursBetweenDates } from '@/utils/dateUtils';
import { HOURS_IN_A_WEEK } from '@/lib/definitions';

// A score relative to a week - how much time in a week this task takes up

export const calculateTimeScore = (task: Task) => {
    const now = new Date();
    const duration = task.duration / 60; // Task duration in hours

    if ( !task.repeat ) {
        if ( task.deadline ) {
            if ( task.completion ) {
                return (duration - task.completion / 60) * HOURS_IN_A_WEEK / hoursBetweenDates(now, task.deadline);
            }
            return duration * HOURS_IN_A_WEEK / hoursBetweenDates(now, task.deadline);
        }
        return duration;
    } else if (task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespanMultiplier && task.repeatTimespan) {
        const repeatInterval = calcRepeatIntervalInMinutes(task) / 60; // in hours
        if ( task.deadline ) {
            if ( task.completion ) {
                return (duration * task.repetitionsDone * (1 - task.completion)) * HOURS_IN_A_WEEK / hoursBetweenDates(now, task.deadline);
            }
        }
        return duration * HOURS_IN_A_WEEK / repeatInterval;
    }
}