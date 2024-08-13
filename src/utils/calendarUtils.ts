import { HfTimegridConfig, utcDateToString, HfEvent } from '@hexaflexa/timegrid';

export const getTimegridConfig = (eventsForHf: HfEvent[], startWeekToday: boolean): HfTimegridConfig => {
    return ({
        daysConfig: {
            daysCount: 7,
            fullWeek: !startWeekToday,
        },
        timeFormat: 'h:mm a',
        firstDayOfWeek: 1,
        resources: [
            { id: '1', title: 'Resource 1' }
        ],
        events: eventsForHf,
        bodyConfig: {
            // enableNewEvents: true,
            switchDragResizeAction: 'none',
            selectAction: 'tap',
            dragResizeStates: ["none","dragResize","none","none"],
            eventConfig: {
            showDescription: true,
            //   useRenderEvent(event: HfEvent, columnResourceId: string): boolean {
            //     return true;
            //   },
            //   renderEvent(event: HfEvent, columnResourceId: string): string {
            //     return `<Link href='?editTaskId=${event.id}' className='cursor-pointer w-full h-full'>${event.title}</Link>`;
            //   }
            },
            timeCellWidth: 30,
        },
        headerDayConfig: {
            showDateFirst: false,
        },
        toolbarConfig: {
            startControls: [],
            centerControls: ['today', 'prev', 'date', 'next'],
            endControls: ['loading'],
        },
        headerResourceConfig: {
            showTitle: false,
            showImage: false
        },
    });
};