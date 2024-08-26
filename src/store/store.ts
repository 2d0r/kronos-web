import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { EventWithRelations, MindsetWithRelations, TaskWithRelations } from '@/lib/types';
import { convertDatePropsToLocaleString } from '@/utils/date-utils';
import { Timespan } from '@prisma/client';
import { configureStore, createSlice, PayloadAction, } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import dateMiddleware, { convertEmptyObjectsToNull, deserializeDates } from './date-middleware';

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

const initialMindsetsState: { mindsets: MindsetWithRelations[], mindsetColour: string } = { 
    mindsets: [], mindsetColour: NEUTRAL_MINDSET_COLOUR 
};
export const mindsetsSlice = createSlice({
    name: 'mindsets',
    initialState: initialMindsetsState,
    reducers: {
        setMindsets: (state, action: PayloadAction<MindsetWithRelations[]>) => {
            state.mindsets = action.payload.map(obj => convertDatePropsToLocaleString(obj));
        },
        setMindsetColour: (state, action: PayloadAction<string>) => {
            state.mindsetColour = action.payload;
        },
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

const initialSearchState: { searchQuery: string } = { searchQuery: '' };
export const searchSlice = createSlice({
    name: 'search',
    initialState: initialSearchState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
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
            search: searchSlice.reducer,
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
export const { setMindsetColour } = mindsetsSlice.actions;
export const { setTimespans } = timespansSlice.actions;
export const { setSearchQuery } = searchSlice.actions;

export type StoreType = ReturnType<typeof createStore>;
export type RootState = ReturnType<StoreType['getState']>;
export type AppDispatch = StoreType['dispatch'];

export const useTasks = () => useSelector((state: RootState) => state.tasks.tasks);
export const useEvents = () => useSelector((state: RootState) => state.events.events);
export const useMindsets = () => useSelector((state: RootState) => state.mindsets.mindsets);
export const useMindsetColour = () => useSelector((state: RootState) => state.mindsets.mindsetColour);
export const useTimespans = () => useSelector((state: RootState) => state.timespans.timespans);
export const useSearchQuery = () => useSelector((state: RootState) => state.search.searchQuery);