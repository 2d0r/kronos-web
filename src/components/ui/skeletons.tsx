// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function TaskCardSkeleton() {
  return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-center justify-center bg-black/20 backdrop-blur-sm py-4'>
    <div className='m-20 z-50 top-1/3 rounded-2xl bg-white shadow-2xl text-sm text-black overflow-hidden'>
      {/* Top bar */}
      <div className={`${shimmer} w-full h-16 flex justify-between items-center p-4 border-b-[0.5px]`}></div>
      <div className='w-full flex overflow-hidden'>
        {/* Settings panel */}
        <div className={`${shimmer} w-[350px] h-[70vh] py-2 border-r-[0.5px] flex flex-col overflow-y-scroll task-input-fields`}></div>
        {/* Notes and checklist panel */}
        <div className={`${shimmer} w-[350px] flex flex-col task-card`}>
          <div className=''></div>
          <div className='h-[25vh] border-b-[0.5px] overflow-y-scroll'></div>
          <div className='h-[25vh]'></div>
        </div>
      </div>
      <div className='flex justify-between items-center gap-4 p-4 h-12 border-t-[0.5px]'>

      </div>
    </div>
  </div>)
}
