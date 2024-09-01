import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import { getCurrentMindsetColour, getEventsWithRelations, getMindsetsWithRelations, getTasksWithRelations } from '@/lib/data';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import TaskCard from '@/components/tasks/task-card';
import Background from '@/components/ui/background';
import { adjustLightness } from '@/utils/colour-utils';

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

  setInterval(async () => {
    mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
  }, 1000 * 60);

  return (
    <html lang='en' suppressHydrationWarning={true}  >
      <head>
        <meta name="theme-color" content={mindsetColour}/>
      </head>
      <body className={inter.className} suppressHydrationWarning={true} style={{ backgroundColor: adjustLightness(mindsetColour, 0.5) }}>
        <StoreProvider tasks={tasks} events={events} mindsets={mindsets} mindsetColour={mindsetColour} timespans={[]} searchQuery='' >
          {children}
          <TaskCard />
          <Background />
        </StoreProvider>
      </body>
    </html>
  )
}
