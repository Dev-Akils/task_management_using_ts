import React, { useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts"; // adjust paths
import { addTask, resizeTask, selectAllTasks } from "../store/taskSlice.ts"; // adjust paths
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, differenceInCalendarDays, parseISO } from "date-fns";
import TaskModal from "./TaskModel.tsx";
import TaskBar from "./TaskBar.tsx";
import { Link } from "react-router-dom";
import bgImage from '../assets/bgImage.png'
import { isValid } from "date-fns";
// NOTE: This file is a single-file demo component. In a real app, split into smaller files.

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



export default function CalendarTaskPlanner() {
  const dispatch = useAppDispatch();
  const tasksFromStore = useAppSelector(selectAllTasks) as TaskLocal[];

  // month view state
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  // selection drag-create state
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // resizing state
  const resizingRef = useRef<{ id: string; edge: 'left' | 'right' } | null>(null);

  // compute grid days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const dayWidth = 120; // px per column (you can make responsive)

  // --- handlers ---
  const handlePointerDownOnTile = (isoDate: string, ev: React.PointerEvent) => {
    // start selection
    setDragStart(isoDate);
    setDragEnd(isoDate);
    // attach move/up listeners on window to cover pointer leaving tiles
    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const tile = target?.closest?.('[data-day]') as HTMLElement | null;
      if (tile) { const d = tile.dataset.day; if (d) setDragEnd(d); }
    };
    const onUp = (e: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      // open modal
      setModalOpen(true);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };



  const createTask = (name: string, category: Category) => {
    if (!dragStart || !dragEnd) return;

    const startObj = typeof dragStart === "string" ? parseISO(dragStart) : dragStart;
    const endObj = typeof dragEnd === "string" ? parseISO(dragEnd) : dragEnd;

    if (!isValid(startObj) || !isValid(endObj)) return;

    const start = startObj < endObj ? startObj : endObj;
    const end = startObj < endObj ? endObj : startObj;

    dispatch(addTask({
      name,
      category,
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    }));

    setModalOpen(false);
    setDragStart(null);
    setDragEnd(null);
  };



  const onResizeStart = (taskId: string, edge: 'left' | 'right') => {
    resizingRef.current = { id: taskId, edge };
    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const tile = target?.closest?.('[data-day]') as HTMLElement | null;
      if (tile) {
        const d = tile.dataset.day; if (d && resizingRef.current) {
          const { id, edge } = resizingRef.current;
          // dispatch optimistic resize or store local preview — for simplicity we'll dispatch on pointerup
          // store preview in state? skipping for brevity
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      // find tile under pointer
      const el = document.elementFromPoint((e as any).clientX, (e as any).clientY) as HTMLElement | null;
      const tile = el?.closest?.('[data-day]') as HTMLElement | null;
      if (tile && resizingRef.current) {
        const d = tile.dataset.day;
        if (d) {
          const { id, edge } = resizingRef.current;
          const t = tasksFromStore.find(x => x.id === id);
          if (t) {
            if (edge === 'left') {
              // new start can't be after end
              const newStart = d <= t.endDate ? d : t.startDate;
              dispatch(resizeTask({ id, newStartDate: newStart }));
            } else {
              const newEnd = d >= t.startDate ? d : t.endDate;
              dispatch(resizeTask({ id, newEndDate: newEnd }));
            }
          }
        }
      }
      resizingRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };


  // quick layout: compute tasks per week row and absolute positioning
  const tasksWithLayout = useMemo(() => {
    const gridStartDate = iso(gridStart);

    const getIndex = (isoStr?: string) => {
      if (!isoStr) return 0; // fallback to 0 or skip
      return differenceInCalendarDays(parseISO(isoStr), parseISO(gridStartDate));
    };

    const mapped = (tasksFromStore || [])
      .filter(t => t.startDate && t.endDate) // ensure valid dates
      .map(t => ({
        ...t,
        startIndex: getIndex(t.startDate),
        length: daysBetween(t.startDate, t.endDate) + 1
      }));

    // row assignment logic stays the same...
    mapped.sort((a, b) => a.startIndex - b.startIndex);

    const rows: number[][] = [];
    for (const task of mapped) {
      let placed = false;
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const conflict = row.some(i => {
          const existing = mapped.find(x => x.startIndex === i);
          if (!existing) return false;
          return !(
            task.startIndex + task.length - 1 < existing.startIndex ||
            task.startIndex > existing.startIndex + existing.length - 1
          );
        });
        if (!conflict) {
          row.push(task.startIndex);
          (task as any).row = r;
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([task.startIndex]);
        (task as any).row = rows.length - 1;
      }
    }

    return mapped;
  }, [tasksFromStore, gridStart]);


  return (<>
    <div
      className="min-h-screen w-full overflow-x-hidden flex items-center justify-center  relative p-3 "
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute bg-black/20 inset-0 opacity-50"></div>


      <div className=' absolute lg:max-w-[930px] lg:h-[700px]  md:max-w-[650px] md:h-[500px] w-full h-screen   mx-auto p-4 shadow rounded-md ' >
        <div className='flex  justify-between items-center bg-white p-5  mb-4 gap-4 md:gap-2 lg:gap-2'>

          {/* <button
          onClick={createTask}
            className='md:px-3 lg:px-5 px-2 md:py-2 lg:py-2 bg-[#CCA69A] rounded text-white hover:text-orange-700 text-[10px] md:text-lg lg:text-lg font-bold duration-300 ease-in-out transform hover:bg-gray-200'>
            Add Task</button> */}
          <div>
            <h2
              className="text-[15px] md:text-xl lg:text-2xl font-bold text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2></div>
          <div className="gap-3 flex">
            < Link to="/viewtask" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className='md:px-3 lg:px-5 px-2 md:py-2 lg:py-2 bg-[#CCA69A] rounded text-white hover:text-orange-700 text-[10px] md:text-lg lg:text-lg font-bold duration-300 ease-in-out transform hover:bg-gray-200'>View Task</Link>

            <button
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))} className="md:px-3 lg:px-3 px-2 py-1 bg-[#A23B14] duration-300 ease-in-out transform text-white hover:text-orange-800 rounded text-xl md:text-4xl lg:text-4xl hover:bg-gray-200">  ←</button>
            <button
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className="md:px-3 lg:px-3 px-2 py-1 bg-[#A23B14] duration-300 ease-in-out transform text-white hover:text-orange-800 rounded text-xl md:text-4xl lg:text-4xl hover:bg-gray-200">
              →</button>
          </div>
        </div>
        <div className="grid grid-cols-7  md:w-[600px] md:h-[50px] lg:w-[900px] lg:h-auto w-full items-center border-white text-sm md:text-lg lg:text-xl
         text-center font-bold border-b pb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center font-medium bg-gray-100 p-2">{d}</div>
          ))}
   {days.map((d, idx) => {
  const isOther = d.getMonth() !== currentMonth.getMonth();
  const isoDay = iso(d);
  const selectionActive = dragStart && dragEnd;
  const inSelection =
    selectionActive &&
    ((isoDay >= (dragStart || '') && isoDay <= (dragEnd || '')) ||
      (isoDay >= (dragEnd || '') && isoDay <= (dragStart || '')));

  // --- compute preview bar width ---
  let previewWidth = 0;
  if (selectionActive && dragStart && dragEnd) {
    const startDate = parseISO(dragStart);
    const endDate = parseISO(dragEnd);
    const start = startDate < endDate ? startDate : endDate;
    const end = startDate < endDate ? endDate : startDate;
    previewWidth = (differenceInCalendarDays(end, start) + 1) * dayWidth;
  }

  return (
    <div key={isoDay} data-day={isoDay} className="relative">
      <div
        onPointerDown={(ev) => handlePointerDownOnTile(isoDay, ev)}
        className={`h-20 border p-1 relative select-none ${isOther ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}
      >
        <div className="text-xs absolute top-1 right-1">{format(d, 'd')}</div>

        {/* --- preview TaskBar for selection --- */}
        {inSelection && (
          <div
            className="absolute top-6 left-0 h-8 bg-orange-700/50 rounded pointer-events-none"
            style={{ width: `${previewWidth}px` }}
          />
        )}

        {/* --- render actual TaskBars --- */}
        <div className="absolute left-0 top-6 right-0 pointer-events-none">
          {tasksWithLayout
            .filter(t => t.startIndex === idx)
            .map(t => (
              <div key={t.id} style={{ position: 'relative', height: 40 }} className="pointer-events-auto">
                <div style={{ position: 'absolute', left: 0, width: `${t.length * dayWidth}px` }}>
                  <div className="m-1">
                    <TaskBar task={t} dayWidth={dayWidth} onResizeStart={onResizeStart} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
})}
</div>

        <TaskModal open={modalOpen} onClose={() => { setModalOpen(false); setDragStart(null); setDragEnd(null); }} initialStart={dragStart || ''} initialEnd={dragEnd || ''} onCreate={createTask} />
      </div>
    </div>
  </>);
}