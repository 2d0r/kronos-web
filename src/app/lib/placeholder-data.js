const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

const tasks = [
    {
        id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
        name: 'Brush teeth',
        mindset: 'maintain',
        status: 'to do',
        date: date,
        // time: 0,
        // startDate: '',
        // name: 'Brush teeth',
        // type: 'to-do',
        // duration: '',
        // deadline: '',
        // preferredTimesOfDay: ['morning', 'evening'],
        // preferredDaysOfWeek: [],
        // frequency: [2, 'day'],
        // taskChains: {
        //     prevTask: [],
        //     nextTask: [],
        //     prevTaskBlock: [],
        //     nextTaskBlock: []
        // },
        // notes: '',
    },
];

const users = [
    {
        id: '410544b2-4001-4271-9855-fec4b6a6442a',
        name: 'Tudor',
        email: 'tudor@nextmail.com',
        password: '123456',
    },
];

module.exports = {
    tasks,
    users
}