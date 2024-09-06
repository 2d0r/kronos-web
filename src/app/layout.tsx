import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import { getCurrentMindsetColour, getEventsWithRelations, getMindsetsWithRelations, getTasksWithRelations } from '@/lib/data';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import TaskCard from '@/components/tasks/task-card';
import Background from '@/components/ui/background';
import { adjustLightness } from '@/utils/colour-utils';
import Doing from '@/components/doing';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kronos Web App',
  description: 'Created by TWDOR',
}

export default async function RootLayout({
  children, 
}: {
  children: React.ReactNode
}) {

  const tasks = await getTasksWithRelations();
  const events = await getEventsWithRelations();
  const mindsets = await getMindsetsWithRelations();
  let mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
  let mindsetColourLight = adjustLightness(mindsetColour, 0.5);

  setInterval(async () => {
    mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
    mindsetColourLight = adjustLightness(mindsetColour, 0.5);
  }, 1000 * 60);

  return (
    <html lang='en' suppressHydrationWarning={true}  >
      <head>
        <meta name="theme-color" content={mindsetColourLight}/>
      </head>
      <body className={`${inter.className} overscroll-none`} suppressHydrationWarning={true} style={{ backgroundColor: mindsetColourLight }}>
        <StoreProvider tasks={tasks} events={events} mindsets={mindsets} mindsetColour={mindsetColour} timespans={[]} searchQuery='' >
          <Doing />
          {children}
          <TaskCard />
          <Background />
        </StoreProvider>
      </body>
    </html>
  )
}
