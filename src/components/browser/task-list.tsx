import { Priority, TaskType, Task, Mindset, Status } from '@prisma/client';
import ToDoItem from './to-do-item';
import { DEFAULT_MINDSET_LIST, TaskWithRelations } from '@/lib/definitions';
import { getTaskColour } from '@/utils/taskUtils';
import Checkbox from './checkbox';
import { dateToDDMMYYYY, minutesToDisplayDuration } from '@/utils/dateUtils';

type SortItem = [('Priority' | 'Date' | 'Duration'), ('Ascending' | 'Descending')];

export default function TaskList ({
    mindsetFilter, typeFilter, tableView, sort, logbookFilter, tasksCache, mindsets, onTaskDeleted, onTaskStatusUpdated,
} : {
    mindsetFilter: string, 
    typeFilter: TaskType, 
    tableView: boolean,
    sort?: SortItem, 
    logbookFilter?: boolean,
    tasksCache: TaskWithRelations[],
    mindsets: Mindset[],
    onTaskStatusUpdated: (taskId: string, status: Status) => void,
    onTaskDeleted: (taskId: string) => void,
}) {
    const mindsetList = mindsetFilter === 'All' ? DEFAULT_MINDSET_LIST : [mindsetFilter];
    const tasksFilteredByType = tasksCache.filter(task => task.type === typeFilter);

    // Filter tasks
    let filteredTasks = tasksFilteredByType;
    // Filter by status (for logbook)
    filteredTasks = filteredTasks.filter(task => logbookFilter ? task.status === 'done' : task.status !== 'done');
    // Filter by mindset
    if (mindsetFilter !== 'All') {
        const mindsetId = mindsets.filter(el => el.name === mindsetFilter)[0].id;
        filteredTasks = filteredTasks.filter(task => task.mindsetId === mindsetId);
    }

    // Sort tasks
    const priorityOrder = {
        [Priority['veryHigh']]: 0,
        [Priority['high']]: 1,
        [Priority['medium']]: 2,
        [Priority['low']]: 3
    }
    let sortedTasks = sort ? sort[0] === 'Priority' ? filteredTasks.sort((a, b) => a.timeScore - b.timeScore).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        : sort[0] === 'Duration' ? filteredTasks.sort((a, b) => a.duration - b.duration)
        : sort[0] === 'Date' ? filteredTasks.filter(el => el.startTime !== null).sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)).concat(filteredTasks.filter(task => task.startTime === null))
        : filteredTasks : filteredTasks;
    (sort && sort[1] === 'Descending') && sortedTasks.reverse();

    // HANDLERS
    const handleTaskStatusUpdated = (taskId: string, status: Status) => {
        onTaskStatusUpdated(taskId, status);
    }
    const handleTaskDelete = (taskId: string) => {
        onTaskDeleted(taskId);
    }
    
    if ( tableView === false ) {
        if ( typeFilter === 'task' ) {
            return (<div className='flex flex-col gap-2 w-full max-w-1/2 items-start justify-start py-2'>
                {sortedTasks.map((task: TaskWithRelations) => {
                    // const taskColour = mindsets.filter(el => el.id === task.mindsetId)[0].colour;
                    return(
                        // <div key={task.id} className='flex gap-2 items-center'>
                        //     <Checkbox type={task.type} repeat={task.repeat} taskId={task.id} status={task.status} 
                        //         onTaskStatusUpdated={handleTaskStatusUpdated}
                        //         fill={task.mindset?.colour}
                        //     />
                        //     <span>{task.name}</span>
                        // </div>
                        <ToDoItem key={task.id} task={task} onTaskStatusUpdated={handleTaskStatusUpdated} onTaskDelete={handleTaskDelete}/>
                    );
                })}
                { sortedTasks.length === 0 &&
                    <div className='w-full flex justify-center text-gray-400 p-2'>No tasks to display</div>
                }
            </div>);
        } else if ( typeFilter === 'project' || typeFilter === 'goal') {
            return (
                <div className='flex gap-2 w-full items-start justify-center'>
                    {sortedTasks.map((task, idx) => {
                        const taskColour = getTaskColour(task, mindsets);
                        return(
                            <div key={task.id} 
                                className='flex flex-col items-center justify-start gap-2 w-[200px] p-4 rounded-lg text-white'
                                style={{ background: taskColour }}
                            >
                                <Checkbox type={task.type} status={task.status} taskId={task.id} fill='white' width='36' height='36'
                                    onTaskStatusUpdated={handleTaskStatusUpdated}
                                />
                                <span className='text-lg'>{task.name}</span>
                                <span className='text-sm'>{task.notes}</span>
                                <div className='w-full flex flex-col gap-2 items-start'>
                                    { tasksCache.filter(subtask => subtask.tasksParent?.some((parentTask: Task) => parentTask.id === task.id)).map(innerTask => {
                                        return(<div className={'flex gap-2 items-center text-sm'} key={innerTask.id}>
                                            <Checkbox taskId={innerTask.id} status={innerTask.status} type={innerTask.type}
                                                height='20' width='20' fill='white'
                                                onTaskStatusUpdated={handleTaskStatusUpdated}
                                            />
                                            <span>{innerTask.name}</span>
                                        </div>);
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    { sortedTasks.length === 0 &&
                        <div className='w-full flex justify-center text-gray-400 p-2'>{`No ${typeFilter}s to display`}</div>
                    }
                </div>
            )
        }
    } else if ( tableView === true ) {
        const newTaskDisplayRows = sortedTasks.map(task => {
            const taskColour = getTaskColour(task, mindsets);
            return (
                <tr className='mb-4 rounded-lg' style={{background: taskColour}} key={task.id}>
                    <td>{task.name}</td>
                    <td>{task.priority}</td>
                    <td>{minutesToDisplayDuration(task.duration)}</td>
                    <td>{task.repeat === true ? `${task.repeatFrequency} / ${task.repeatTimespan}`: 'one time'}</td>
                    <td>{task.deadline ? `on ${dateToDDMMYYYY(task.deadline)}` 
                        : task.totalDuration ? `after ${minutesToDisplayDuration(task.totalDuration)} hrs` 
                        : task.totalRepetitions ? `after ${task.totalRepetitions} reps`
                        : task.deadline ? `on ${dateToDDMMYYYY(task.deadline)}`
                        : '' }</td>
                </tr>
            );
        });
        return (<table className='task-table'>
            <thead><tr className=''>
                <th>Name</th>
                <th>Priority</th>
                <th>Duration</th>
                <th>Frequency</th>
                <th>End</th>
            </tr></thead>
            <tbody>
                {newTaskDisplayRows}
            </tbody>
        </table>);
    }
}