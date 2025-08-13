import { useAppDispatch, useAppSelector } from "../store/hooks.ts"; // adjust paths
import { addTask, updateTask, deleteTask, resizeTask, selectAllTasks } from "../store/taskSlice.ts"; // adjust paths
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, differenceInCalendarDays, parseISO } from "date-fns";



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
export default function ViewTask() {
  const dispatch = useAppDispatch();
  const tasksFromStore = useAppSelector(selectAllTasks) as TaskLocal[];

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-t from-[#A06D4D] to-[#E1D8D0] p-6 flex flex-col items-center gap-6">
        <h2 className="text-orange-950 text-5xl font-bold ">Your Tasks</h2>
        {tasksFromStore.length > 0 ? (
          tasksFromStore.map((task, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3xl flex justify-between items-center hover:shadow-xl transition-all duration-300"
            >
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{task.name}</h2>
                <p className="font-bold text-lg text-gray-800">
                  Start: {task.startDate ? format(parseISO(task.startDate), "MMM dd, yyyy") : "N/A"} <br />
                  End: {task.endDate ? format(parseISO(task.endDate), "MMM dd, yyyy") : "N/A"}
                </p>

                {/* <p className="text-sm text-gray-500">{data.eventdate}</p> */}
              </div>

              <div className="flex gap-3">
                {/* <button
          onClick={()=>updateEvents(data.id)}
           className="bg-black text-white px-4 py-2 rounded-lg hover:bg-orange-900 transition-colors">
            Update
          </button> */}
                {task.row !== undefined && <p>Row: {task.row}</p>}
                <button
                  onClick={() => dispatch(deleteTask({ id: task.id }))}
                  className="bg-orange-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
                  Delete Task
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-700 text-xl flex justify-center h-screen font-bold items-center">
            <p>Event is Empty...</p>
          </div>
        )}
      </div> </>);
}