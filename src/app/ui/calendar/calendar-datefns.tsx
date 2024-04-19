import { FC, useState } from 'react'
import { Calendar, dateFnsLocalizer, Event, CalendarProps, View } from 'react-big-calendar'
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay, addHours, startOfHour} from 'date-fns';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { v4 as uuidv4 } from 'uuid';

const App: FC = () => {
    const [view, setView] = useState<View>('week');
    const [events, setEvents] = useState<Event[]>([
        {
        title: 'Learn cool stuff',
        start,
        end,
        },
    ])

    const onEventResize: withDragAndDropProps['onEventResize'] = data => {
        const { start, end } = data;
        const { title } = data.event;
        const eventIdx = events.findIndex(event => event.title === title);

        setEvents(currentEvents => currentEvents.map((event, idx) => {
            return idx === eventIdx ? {...event, start: new Date(start), end: new Date(end)} : event;
        }));
    }

    const onEventDrop: withDragAndDropProps['onEventDrop'] = data => {
        const { start, end } = data;
        const { title } = data.event;
        const eventIdx = events.findIndex(event => event.title === title);
        setEvents(currentEvents => currentEvents.map((event, idx) => {
            return idx === eventIdx ? {...event, start: new Date(start), end: new Date(end)} : event;
        }));
    }

    const onView: CalendarProps['onView'] = data => {
        console.log(data);
        setView(data);
    }

    return (
        <DnDCalendar
            defaultView={view}
            events={events}
            localizer={localizer}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            onView={onView}
            resizable
        />
    )
}

const locales = {
  'en-US': enUS,
}
const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1)
const now = new Date()
const start = endOfHour(now)
const end = addHours(start, 2)
// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})
//@ts-ignore
const DnDCalendar = withDragAndDrop(Calendar)

export default App