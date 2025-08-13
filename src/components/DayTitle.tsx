


import { format} from "date-fns";


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


// ----- DayTile -----
export default function DayTile({ date, isOtherMonth, onPointerDown } : { date: Date; isOtherMonth: boolean; onPointerDown: (isoDate: string, ev: React.PointerEvent)=>void }){
  const isoDate = iso(date);
  return (
    <div
      onPointerDown={(ev)=>onPointerDown(isoDate, ev)}
      className={`h-20 border p-1 relative select-none ${isOtherMonth? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
      <div className="text-xs absolute top-1 right-1">{format(date, 'd')}</div>
    </div>
  );
}