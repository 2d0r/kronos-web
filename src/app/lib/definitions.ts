export type Frequency = {
    times: number,
    timeRange: string, 
}

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

export const MINDSETS = [
    'solve',
    'create',
    'learn',
    'play',
    'socialise',
    'self-care',
    'relax',
    'maintain/survive',
]