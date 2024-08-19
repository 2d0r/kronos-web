import { EventWithRelations, MindsetWithRelations, TaskWithRelations } from '@/lib/definitions';
import { convertDatePropsToLocaleString, convertPropsToDate } from '@/utils/date-utils';
import { Timespan } from '@prisma/client';
import { configureStore, createSlice, PayloadAction, } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import dateMiddleware from './date-middleware';

const initialTasks: { tasks: TaskWithRelations[] } = { tasks: [] };
export const tasksSlice = createSlice({
    name: "tasks",
    initialState: initialTasks,
    reducers: {
      setTasks: (state, action: PayloadAction<TaskWithRelations[]>) => {
        state.tasks = action.payload.map(obj => convertDatePropsToLocaleString(obj));
      },
    },
});

const initialEventsState: { events: EventWithRelations[] } = { events: [] };
export const eventsSlice = createSlice({
    name: 'events',
    initialState: initialEventsState,
    reducers: {
        setEvents: (state, action: PayloadAction<EventWithRelations[]>) => {
            state.events = action.payload.map(obj => convertDatePropsToLocaleString(obj));
        }
    }
});

const initialMindsetsState: { mindsets: MindsetWithRelations[] } = { mindsets: [] };
export const mindsetsSlice = createSlice({
    name: 'mindsets',
    initialState: initialMindsetsState,
    reducers: {
        setMindsets: (state, action: PayloadAction<MindsetWithRelations[]>) => {
            state.mindsets = action.payload.map(obj => convertDatePropsToLocaleString(obj));
        }
    }
});

const initialTimespansState: { timespans: Timespan[] } = { timespans: [] };
export const timespansSlice = createSlice({
    name: 'timespans',
    initialState: initialTimespansState,
    reducers: {
        setTimespans: (state, action: PayloadAction<Timespan[]>) => {
            state.timespans = action.payload.map(obj => convertDatePropsToLocaleString(obj));
        }
    }
});


export const createStore = () => 
    configureStore({
        reducer: {
            tasks: tasksSlice.reducer,
            events: eventsSlice.reducer,
            mindsets: mindsetsSlice.reducer,
            timespans: timespansSlice.reducer,
        },
        middleware: (getDefaultMiddleware) => 
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ['tasks/setTasks', 'events/setEvents', 'timespans/setTimespans', 'mindsets/setMindsets'],
                }
            }).concat(dateMiddleware),
    });

export const { setTasks } = tasksSlice.actions;
export const { setEvents } = eventsSlice.actions;
export const { setMindsets } = mindsetsSlice.actions;
export const { setTimespans } = timespansSlice.actions;

export type StoreType = ReturnType<typeof createStore>;
export type RootState = ReturnType<StoreType['getState']>;
export type AppDispatch = StoreType['dispatch'];

export const useTasks = () => useSelector((state: RootState) => state.tasks.tasks);
export const useEvents = () => useSelector((state: RootState) => state.events.events);
export const useMindsets = () => useSelector((state: RootState) => state.mindsets.mindsets);
export const useTimespans = () => useSelector((state: RootState) => state.timespans.timespans);
//.map(obj => convertPropsToDate(obj))