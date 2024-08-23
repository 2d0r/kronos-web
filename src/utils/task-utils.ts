import { fetchEventsOfTask } from '@/lib/data';
import { Event, Mindset, Task } from '@prisma/client';
import { calcRepeatIntervalInMinutes, minutesBetweenDates } from './date-utils';
import { TaskWithRelations } from '@/lib/types';

interface Sortable {
    [key: string]: any;
}
  
export const sortByCustomOrder = <T extends Sortable> (
    list: T[], 
    property: keyof T, 
    enumValues: string[]
) => {
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

export const sortTasksByPriority = (
    list: Task[], 
    property: keyof Task, 
    enumValues: string[]
) => {
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

export const getTaskColour = (task: Task, mindsets: Mindset[]) => {
    return mindsets.filter(el => el.id === task.mindsetId)[0].colour;
}

export const createNewDateObjectsForProps = (object: any) => {
    for (let prop in object) {
        // Check if property is a date object, or a string that can be converted into Date
        if (Object.prototype.toString.call(new Date(object[prop])) === '[object Date]' && !isNaN(new Date(object[prop]).getMonth())) {
            object[prop] = new Date(object[prop]);
        }
    }
    return object;
}

export const getTaskRepeatPhase = (task: TaskWithRelations, organiseFrom?: Date,) => {
    const taskRepeatIntervalInMinutes = calcRepeatIntervalInMinutes(task);
    if (task.firstSessionStartTime) {
        return minutesBetweenDates(task.firstSessionStartTime, organiseFrom || new Date()) % taskRepeatIntervalInMinutes;
    }
    return 0;
} 