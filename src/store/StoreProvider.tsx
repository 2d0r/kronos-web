'use client';

import { Timespan } from '@prisma/client';
import { Provider } from 'react-redux';
import { createStore, setTasks, setEvents, setMindsets, setTimespans, setMindsetColour } from './store';
import { useRef } from 'react';
import { EventWithRelations, MindsetWithRelations, TaskWithRelations } from '@/lib/types';

export default function StoreProvider({
    tasks, events, mindsets, mindsetColour, timespans,
    children,
}: {
    tasks: TaskWithRelations[],
    events: EventWithRelations[],
    mindsets: MindsetWithRelations[],
    mindsetColour: string,
    timespans: Timespan[],
    children: React.ReactNode;
}) {
    const storeRef = useRef<ReturnType<typeof createStore> | null>(null);
    if(!storeRef.current) {
        storeRef.current = createStore();
        storeRef.current.dispatch(setTasks(tasks));
        storeRef.current.dispatch(setEvents(events));
        storeRef.current.dispatch(setMindsets(mindsets));
        storeRef.current.dispatch(setMindsetColour(mindsetColour));
        storeRef.current.dispatch(setTimespans(timespans)); 
        // .map(obj => convertDatePropsToLocaleStrings(obj))
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
