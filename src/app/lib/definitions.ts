import { Status, TimeSpan, Priority, TimeOfDay, DayOfWeek } from '@prisma/client';

export const DEFAULT_AVERAGE_SLEEP = 8 * 60; // 8 hours, expressed in minutes
export const DEFAULT_AVERAGE_MEALS = 3 * 60; // 3 hours, expressed in minutes
export const DEFAULT_MINDSET = 'maintain';
export const CLOSEST_MINDSET = 1;
export const FURTHEST_MINDSET = 6;
export const MINIMUM_TRANSITION = 0;
export const MIN_TASK_DURATION = 10;

export const DEFAULT_TIMES_OF_DAY = {
    'morning': [6, 12],
    'afternoon': [12, 18],
    'evening': [18, 22],
    'night': [22, 6]
    // add late night and noon ?
}

export const dayOfWeekToNumber = {
    'Sunday' : 0,
    'Monday' : 1,
    'Tuesday' : 2,
    'Wednesday' : 3,
    'Thursday' : 4,
    'Friday' : 5,
    'Saturday' : 6
}

export type Frequency = {
    times: number,
    timeRange: string, 
}

export type Task = {
    id: string;
    name: string;
    mindset: string;
    status: string;
}

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
  };

export type TaskChain = {
    prevTask: string[],
    nextTask: string[],
    prevTaskCausal: string[],
    nextTaskCausal: string[],
    // causal links act like blocked by in Jira: task B can only be done if task A was done
    // TO DO: 
}

export type MindsetField = {
    id: string;
    name: string;
}

export type StatusField = {
    id: string;
    name: string;
}

const getEnumValues = (enumType: Record<string, string>) => {
    return enumType ? Object.values(enumType) : [];
}
export const statusList = getEnumValues(Status);
export const priorityList = getEnumValues(Priority);
export const timeSpanList = getEnumValues(TimeSpan);
export const preferredTimeOfDayList = getEnumValues(TimeOfDay);
export const preferredDayOfWeekList = getEnumValues(DayOfWeek);

export let prismaEnums = {
    status: getEnumValues(Status),
    priority: getEnumValues(Priority),
    timeSpan: getEnumValues(TimeSpan),
    preferredTimeOfDay: getEnumValues(TimeOfDay),
    preferredDayOfWeek: getEnumValues(DayOfWeek),
};

