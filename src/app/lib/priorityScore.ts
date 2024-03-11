'use server';

import { revalidatePath } from "next/cache";
import {
    fetchTasksPrisma,
    fetchMindsets,
    updateTaskField
} from "./data";
import {
    getCurrentTimeOfDay,
    dayOfWeekToNumber,
    DEFAULT_AVERAGE_SLEEP, DEFAULT_AVERAGE_MEALS, DEFAULT_MINDSET,
    FURTHEST_MINDSET, CLOSEST_MINDSET,
} from "./definitions";

export default async function calculatePriorityScores() {
    const tasks = await fetchTasksPrisma();
    const mindsets = await fetchMindsets();

    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // All durations should be in minutes, unless specified

    tasks
        .filter((task) => (
            ['toDo', 'inProgress'].includes(String(task.status)) &&
                ((task.endRepeat && task.endRepeatDate && task.endRepeatDate > currentTime) || !task.endRepeat) &&
                (task.scheduled === false)
        ))
        .forEach((task) => {

            let score = {
                'overall': 0,
                'statusScore': -1,
                'timeScore': -1,
                'mindsetScore': -1,
                'priorityScore': -1,
                'frequencyScore': -1,
                'deadlineScore': -1,
                'preferredTimeScore': -1,
                'preferredDayScore': -1
            };

            // Time Score
            // const BUFFER_TIME_MINUTES = 15;
            if (!task.scheduled && task.startTime) {
                const minutesToTask = Math.abs(task.startTime.getMinutes() - currentTime.getMinutes())
                switch (true) {
                    case minutesToTask <= 15:
                        score.timeScore = 100;
                        break;
                    case minutesToTask <= 30:
                        score.timeScore = 80;
                        break;
                    case minutesToTask <= 60:
                        score.timeScore = 60;
                        break;
                    case minutesToTask <= 120:
                        score.timeScore = 40;
                        break;
                    default:
                        score.timeScore = 0;

                }
            }

            (!task.scheduled && task.startTime) &&
                score.timeScore

            // Status Score
            score.statusScore = String(task.status) === 'inProgress' ? 100 :
                String(task.status) === 'toDo' ? 50 :
                    0;

            // Frequency Score
            if (task.repeat && task.repeatFrequency && task.repeatTimespan) {
                if (!task.firstSessionStartTime) {
                    score.frequencyScore = 100;
                } else {
                    const timespanTypeMultiplier =
                        task.repeatTimespan === 'hour' ? 60 * 60 :
                            task.repeatTimespan === 'day' ? 60 * 60 * 24 :
                                task.repeatTimespan === 'week' ? 60 * 60 * 24 * 7 :
                                    task.repeatTimespan === 'month' ? 60 * 60 * 24 * 7 * 30.437 :
                                        60 * 60 * 24 * 7 * 365.25; // for 'yearly'
                    const repeatTimespan = task.repeatFrequency * 1000 * timespanTypeMultiplier; // in milliseconds
                    // calculate the timespan, and if you divide time difference from first repeat by it, it should return an int
                    const timeSinceFirstSession = currentTime.getTime() - task.firstSessionStartTime.getTime() / 1000 / timespanTypeMultiplier;
                    const phaseShift = timeSinceFirstSession / repeatTimespan % 1;
                    score.frequencyScore = phaseShift === 0 ? 100 :
                        phaseShift <= 0.1 && phaseShift >= 0.9 ? 50 :
                            0;
                }
            } else {
                score.frequencyScore = 0;
            }


            // deadlineScore
            if (task.deadline && task.completion) {
                const timeLeftToFinish = task.timeSpent * (100 - task.completion) / task.completion;
                const timeToDeadline = task.deadline.getTime() - currentTime.getTime() / 1000 / 60;
                const daysToDeadline = timeToDeadline / 60 / 24;
                const averageSleep = DEFAULT_AVERAGE_SLEEP;
                const averageMeals = DEFAULT_AVERAGE_MEALS;
                const timeAvailableUntilDeadline = timeToDeadline - daysToDeadline * (averageSleep + averageMeals); // + durationOfHigherPriorityActivties + totalBreaks);
                score.deadlineScore = timeLeftToFinish / timeAvailableUntilDeadline > 1 ? 100 : timeLeftToFinish / timeAvailableUntilDeadline * 100;
            }

            // mindset score
            const currentMindset = DEFAULT_MINDSET; // prevTaskMindset || DEFAULT_MINDSET;
            // get the number in the matrix between the currentMindset and task.mindset
            // filter array of objects by object with name task.Mindset
            const proximityToCurrMindset = mindsets.filter(mindset => mindset.name === task.mindset)[0][currentMindset];
            score.mindsetScore = 100 / (FURTHEST_MINDSET - CLOSEST_MINDSET) * (FURTHEST_MINDSET - proximityToCurrMindset);
            /**
             * 4 … 0%
             * 3 … 33%
             * 2 … 66%
             * 1 … 100%
            */

            // preferredTimeOfDay
            if (task.preferredTimeOfDay) {
                const currentTimeOfDayAndRange = getCurrentTimeOfDay();
                const [currentTimeOfDay, range] = currentTimeOfDayAndRange ? currentTimeOfDayAndRange : ['', [-1, -1]];
                score.preferredTimeScore = currentTimeOfDay === String(task.preferredTimeOfDay) ? 100 :
                    Number(range[0]) - currentHour <= 2 || currentHour - Number(range[1]) <= 2 ? 50 :
                        0;
            }

            // preferredDayOfWeek
            if (task.preferredDayOfWeek) {
                const currentDayOfWeek = currentTime.getDay();
                score.preferredDayScore = 0;
                task.preferredDayOfWeek.forEach((preferredDay) => {
                    // 100% if it's a day match
                    if (dayOfWeekToNumber[preferredDay] === currentDayOfWeek) {
                        score.preferredDayScore = 100;
                        // 50% if both are weekdays / weekend days
                    } else if (
                        ([0, 6].includes(currentDayOfWeek) && [0, 6].includes(dayOfWeekToNumber[preferredDay])) ||
                        (![0, 6].includes(currentDayOfWeek) && ![0, 6].includes(dayOfWeekToNumber[preferredDay]))
                    ) {
                        score.preferredDayScore = 50;
                    }
                });
            }

            score.overall = (
                score.timeScore +
                score.mindsetScore +
                score.deadlineScore +
                score.frequencyScore +
                score.priorityScore +
                score.preferredTimeScore +
                score.preferredDayScore
            ) / (Object.values(score).filter(value => value !== -1).length);

            updateTaskField(task.id, 'priorityScore', score.overall);
            console.log(score);
        });

    console.log('Calculated priority scores!');
    revalidatePath('/');
}