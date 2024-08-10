import { Mindset, Task } from '@prisma/client';
import { addMinutesToDate } from './dateUtils';
import { scheduleEventForTask } from '@/app/lib/actions';

interface Sortable {
    [key: string]: any;
}
  
export function sortByCustomOrder<T extends Sortable> (
    list: T[], 
    property: keyof T, 
    enumValues: string[]
): T[] {
    const orderMap = enumValues.reduce((map, value, index) => {
        map[value] = index;
        return map;
    }, {} as Record<string, number>);

    return list.sort((a, b) => {
        const orderA = orderMap[a[property] as string];
        const orderB = orderMap[b[property] as string];
        return orderA - orderB;
    });
}

export function sortTasksByPriority (
    list: Task[], 
    property: keyof Task, 
    enumValues: string[]
): Task[] {
    const orderMap = enumValues.reduce((map, value, index) => {
        map[value] = index;
        return map;
    }, {} as Record<string, number>);

    return list.sort((a, b) => {
        const orderA = orderMap[a[property] as string];
        const orderB = orderMap[b[property] as string];
        return orderA - orderB;
    });
}

export function getTaskColour(task: Task, mindsets: Mindset[]): string {
    return mindsets.filter(el => el.id === task.mindsetId)[0].colour;
}