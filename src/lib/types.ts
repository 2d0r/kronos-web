// TYPES

import { Prisma, Status, TaskType } from '@prisma/client';
import { ReactElement } from 'react';

export type ActionType = ('edit' | 'create' | 'delete');
export type CheckboxStatus = ('checked' | 'blank');
export type eventsToSchedule = {
    taskId: string,
    count: number,
}[];
export type EventWithRelations = Prisma.EventGetPayload<{
    include: { 
        task: true,
    }
}>;
export type Frequency = {
    times: number,
    timeRange: string,
};
export type MindsetField = {
    id: string;
    name: string;
};
export type MindsetWithRelations = Prisma.MindsetGetPayload<{
    include: {
        tasks: true
    }
}>;
export type SortItem = [('Priority' | 'Date' | 'Duration'), ('Ascending' | 'Descending')];
export type StatusField = {
    id: string;
    name: string;
}
export type TaskChain = {
    prevTask: string[],
    nextTask: string[],
    prevTaskCausal: string[],
    nextTaskCausal: string[],
    // causal links act like blocked by in Jira: task B can only be done if task A was done
    // TO DO: 
};
export type TaskWithRelations = Prisma.TaskGetPayload<{
    include: { 
        tasksBefore: true,
        tasksAfter: true,
        tasksRightBefore: true,
        tasksRightAfter: true,
        tasksParent: true,
        tasksChild: true,
        mindset: true,
        events: true,
    }
}>;
export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
};


// Interfaces

export interface ContainerProps {
    children: ReactElement | ReactElement[] | null; // Accepts single or multiple children
};
export interface DatePickerEventFormData {
    description: string
    todoId?: string
    allDay: boolean
    start?: Date
    end?: Date
};
export interface EventFormData {
    description: string
    todoId?: string
};
export interface Filters {
    type: TaskType; mindset: string; tableView: boolean; logbookView: boolean; sort: SortItem;
};
export interface ITodo {
    _id: string
    title: string
    color?: string
};
export interface IEventInfo extends Event {
    _id: string
    description: string
    todoId?: string
    start: Date | undefined
    end: Date | undefined
};
export type SearchParamProps = {
    searchParams: Record<string, string>;
};
export interface URLSearchParamsKronos extends URLSearchParams {
    menu: boolean
    event: string
    logbook: boolean
    task: string
    status: Status | 'edit'
};