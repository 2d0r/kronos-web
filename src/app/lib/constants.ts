export const DEFAULT_AVERAGE_SLEEP = 8 * 60; // 8 hours, expressed in minutes
export const DEFAULT_AVERAGE_MEALS = 3 * 60; // 3 hours, expressed in minutes
export const DEFAULT_MINDSET = 'maintain';
export const CLOSEST_MINDSET = 1;
export const FURTHEST_MINDSET = 4;
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