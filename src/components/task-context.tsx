import { fetchTaskWithRelations, fetchTasksWithRelations } from '@/app/lib/data';
import { TaskWithRelations } from '@/app/lib/definitions';
import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define the shape of the context state
interface TaskContextType {
    tasksCache: TaskWithRelations[];
    setTasksCache: React.Dispatch<React.SetStateAction<TaskWithRelations[]>>;
}

// Create a Context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => useContext(TaskContext);

// Provider component to wrap the parent and pass down the context values
export const TaskCacheProvider = ({ children, tasks } : { children: ReactNode, tasks: TaskWithRelations[] }) => {
    // const tasks = await fetchTasks();
    const [ tasksCache, setTasksCache ] = useState<TaskWithRelations[]>(tasks);
  
    return (
      <TaskContext.Provider value={{ tasksCache, setTasksCache }}>
        {children}
      </TaskContext.Provider>
    );
  };