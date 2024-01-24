import { Frequency } from './definitions';
import { v4 as uuidv4 } from 'uuid';

let now = Date.now();

class Task {
    taskId: String;
    name: String; duration: Number; time: Number[]; startDate: Date;
    frequency: Frequency; totalDuration: Number; repetitions: Number; endRepeat: Date;
    preferredDaysOfWeek: String[]; preferredTimesOfDay: String[]; 
    priority: String; deadline: Date; status: String; 
    project: String; relatedTasks: String[]; blocks: String[]; isBlockedBy: String[];
    mindset: String; 
    notes: String;

    constructor (
        taskId: String,
        name: String, duration: Number, 
        time: Number[], startDate: Date,
        frequency: Frequency, totalDuration: Number, repetitions: Number, endRepeat: Date,
        preferredDaysOfWeek: String[], preferredTimesOfDay: String[], 
        priority: String, deadline: Date, status: String, 
        project: String, relatedTasks: String[], blocks: String[], isBlockedBy: String[],
        mindset: String, 
        notes: String,
    ) {
        this.taskId = uuidv4();
        this.name = name;
        this.duration = duration;
        this.time = time;
        this.startDate = startDate;
        this.frequency = frequency;
        this.totalDuration = totalDuration;
        // TO DO: force total duration input if recurring & deadline
        this.repetitions = repetitions;
        this.endRepeat = endRepeat;
        this.priority = priority || 'Useful';
        this.deadline = deadline;
        this.status = status || 'To do';
        this.project = project;
        this.relatedTasks = relatedTasks;
        this.mindset = mindset;
        this.notes = notes || '';
        this.preferredDaysOfWeek = preferredDaysOfWeek;
        this.preferredTimesOfDay = preferredTimesOfDay;
        this.blocks = blocks;
        this.isBlockedBy = isBlockedBy;
    }
}

class Situation {
    time: Date;
    // prevTask: String;

    constructor (time: Date) {
        this.time = time;
        // this.prevTask = queryForPrevTask(time); 
    }
}


export default function orderPriorityList() {
    return;
}

export function calcPriorityScore (taskId: String, time = Date.now()): Number {
    // TO DO
    // look for task by id
    // calculate score for duration - fits in current period
    // calculate score for frequency
    // calculate score for deadline - 
    // calculate score for mindset - using mindset map, daily routine, weekly routine
    // 
    // create functions that define each
    // 
    return 1;
}