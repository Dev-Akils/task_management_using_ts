
import { format,  differenceInCalendarDays, parseISO } from "date-fns";


type Category = "To Do" | "In Progress" | "Review" | "Completed";

interface TaskLocal {
  id: string;
  name: string;
  category: Category;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // inclusive
  row?: number; // computed layout row
}

// ----- Helpers -----
const iso = (d: Date) => format(d, "yyyy-MM-dd");
const daysBetween = (aIso: string, bIso: string) => differenceInCalendarDays(parseISO(bIso), parseISO(aIso));
// ----- TaskBar visual + draggable -----
export default function TaskBar({ task, dayWidth, onResizeStart } : { task: TaskLocal; dayWidth: number; onResizeStart: (taskId: string, edge: 'left'|'right')=>void; }){
  // compute style
  const len = daysBetween(task.startDate, task.endDate) + 1;
  const leftDays = daysBetween(task.startDate, task.startDate); // 0
  const widthPx = Math.max(40, len * dayWidth - 8);
  console.log(task.name, task.startDate, task.endDate, len);


  return (
    <div className="absolute top-1 left-1 h-8 flex items-center" style={{ transform: `translateX(${leftDays * dayWidth}px)`, width: `${widthPx}px` }}>
      <div className="h-full w-[200px] rounded bg-orange-700 text-white px-2 flex items-center overflow-hidden text-sm">
        <div className="truncate">{task.name} ({task.category})</div>
        <div className="ml-auto flex gap-1">
          <div onPointerDown={(e)=>{ e.stopPropagation(); onResizeStart(task.id, 'left'); }} className="w-3 cursor-ew-resize" />
          <div onPointerDown={(e)=>{ e.stopPropagation(); onResizeStart(task.id, 'right'); }} className="w-3 cursor-ew-resize" />
        </div>
      </div>
    </div>
  );
}