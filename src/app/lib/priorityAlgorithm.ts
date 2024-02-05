import { Frequency, TaskChain } from './definitions';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from './placeholder-data.js';

let now = Date.now();

class Task {
    taskId: String; name: String; 
    status: String; // Done, To do, In Progress
    mindset: String; 
    // scheduled
    startTime: [Number, Number]; startDate: Date;
    endTime: [Number, Number]; endDate: Date;
    // non-scheduled
    preferredDaysOfWeek: String[]; preferredTimesOfDay: String[]; 
    priority: String; deadline: Date; 
    // recurring
    duration: Number; frequency: [Number, String]; 
    totalDuration: Number; repetitions: Number; endRepeat: Date;
    // causal links
    project: String; taskChain: TaskChain; 
    // details
    relatedTasks: String[]; notes: String; 

    // TO DO: handle empty input
    constructor (
        taskId: String, name: String, status: String,
        duration: Number, 
        startTime: [Number, Number], startDate: Date,
        endTime: [Number, Number], endDate: Date,
        frequency: [Number, String], 
        totalDuration: Number, repetitions: Number, endRepeat: Date,
        preferredDaysOfWeek: String[], preferredTimesOfDay: String[], 
        priority: String, deadline: Date, 
        project: String, relatedTasks: String[], taskChain: TaskChain,
        mindset: String, 
        notes: String,
    ) {
        this.taskId = uuidv4();
        this.name = name;
        this.status = status || 'To do';
        this.duration = duration;
        this.startTime = startTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.endTime = endTime;
        this.frequency = frequency;
        this.totalDuration = totalDuration;
        // TO DO: force total duration input if recurring & deadline
        this.repetitions = repetitions;
        this.endRepeat = endRepeat;
        this.priority = priority || 'Useful';
        this.deadline = deadline;
        this.project = project;
        this.relatedTasks = relatedTasks;
        this.mindset = mindset;
        this.notes = notes || '';
        this.preferredDaysOfWeek = preferredDaysOfWeek;
        this.preferredTimesOfDay = preferredTimesOfDay;
        this.taskChain = taskChain;
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
    const taskObj = tasks.filter((x : any) => x.taskId === taskId);
    // TO DO: calculate score for duration - fits in current period
    // TO DO: calculate score for frequency
    // TO DO: calculate score for deadline - 
    // TO DO: calculate score for mindset - using mindset map, daily routine, weekly routine
    // 
    // create functions that define each
    // 
    return 1;
}