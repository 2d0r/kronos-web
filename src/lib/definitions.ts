import { Status, TimeUnit, Priority, TimeOfDay, DayOfWeek, RepeatUnit, TimespanType } from '@prisma/client';


// CONSTANTS 

export const CARD_SCALES = {
    small: 1,
    medium: 1.5,
    large: 2
}
export const DAYS_OF_WEEK_DICT : { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
}
export const DEFAULT_AVERAGE_SLEEP = 8 * 60; // 8 hours, expressed in minutes
export const DEFAULT_AVERAGE_MEALS = 3 * 60; // 3 hours, expressed in minutes
export const DEFAULT_TIME_ZONE = 'Europe/Bucharest';
export const DEFAULT_TIMES_OF_DAY : { [key: string]: [number, number]} = {
    'morning': [6, 12],
    'afternoon': [12, 18],
    'evening': [18, 22],
    'noon': [12, 13],
    'night': [22, 6]
    // TO DO: add late night and noon ?
};
export const HOURS_IN_A_WEEK = 168;
export const MAX_REP_OFFSET = 1/4;
export const MAX_OFFSET = 120;
export const MINIMUM_TRANSITION = 0;
export const MIN_TASK_DURATION = 10;
export const PRIORITY_ORDER = {
    [Priority['veryHigh']]: 0,
    [Priority['high']]: 1,
    [Priority['medium']]: 2,
    [Priority['low']]: 3
};
export const QUEUE_LENGTH = 10;
export const SMALL_CARD_HEIGHT = 200;
export const TIME_DAY_LIST = Object.keys(DEFAULT_TIMES_OF_DAY) as [string, ...string[]];
export const ORGANISER_TIMESPANS = {
    'Today': 1,
    '3 Days': 3,
    'One Week': 7,
};


// Mindsets 

export const CLOSEST_MINDSET = 1;
export const DEFAULT_MINDSET = 'maintain';
export const DEFAULT_MINDSET_LIST = [ 'Survive', 'Work', 'Chore', 'Free Time', 'Learn', 'Healthy', 'Family & Friends', 'Create', 'Achieve' ] as [string, ...string[]];
// export const DEFAULT_MINDSET_LIST = [ 'restReward', 'survive', 'maintain', 'play', 'socialise', 'learn', 'create', 'selfChallenge', 'selfCare', 'achieve' ] as [string, ...string[]];
export const FURTHEST_MINDSET = 6;
export const NEUTRAL_MINDSET_COLOUR = '#b19870';


// Prisma enums

const getEnumValues = (enumType: Record<string, string>) => {
    return enumType ? Object.values(enumType) : [];
}
export const statusList = getEnumValues(Status);
export const priorityList = getEnumValues(Priority);
export const timeSpanList = getEnumValues(TimeUnit);
export const timeOfDayList = getEnumValues(TimeOfDay);
export const dayOfWeekList = getEnumValues(DayOfWeek);
export const repeatUnitList = getEnumValues(RepeatUnit);
export const timespanTypeList = getEnumValues(TimespanType);

export let prismaEnums = {
    status: getEnumValues(Status),
    priority: getEnumValues(Priority),
    timeSpan: getEnumValues(TimeUnit),
    preferredTimeOfDay: getEnumValues(TimeOfDay),
    preferredDayOfWeek: getEnumValues(DayOfWeek),
};