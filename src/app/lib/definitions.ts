import { Status, TimeSpan, Priority, TimeOfDay, DayOfWeek, MindsetEnum } from '@prisma/client';

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
export const mindsetList = getEnumValues(MindsetEnum);
export const statusList = getEnumValues(Status);
export const priorityList = getEnumValues(Priority);
export const timeSpanList = getEnumValues(TimeSpan);
export const preferredTimeOfDayList = getEnumValues(TimeOfDay);
export const preferredDayOfWeekList = getEnumValues(DayOfWeek);

export let prismaEnums = {
    status: getEnumValues(Status),
    priority: getEnumValues(Priority),
    mindset: getEnumValues(MindsetEnum),
    timeSpan: getEnumValues(TimeSpan),
    preferredTimeOfDay: getEnumValues(TimeOfDay),
    preferredDayOfWeek: getEnumValues(DayOfWeek),
};