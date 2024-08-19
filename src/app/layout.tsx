import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import { getEventsWithRelations, getMindsetsWithRelations, getTasksWithRelations } from '@/lib/data';

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

  return (
    <html lang='en' suppressHydrationWarning={true}  >
      <body className={inter.className}>
        <StoreProvider tasks={tasks} events={events} mindsets={mindsets} timespans={[]} >
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
