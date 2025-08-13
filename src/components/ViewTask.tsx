import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { deleteTask, setFilters, selectFilteredTasks, selectFilters } from "../store/taskSlice.ts";
import { format, parseISO } from "date-fns";

export default function ViewTask() {
  const dispatch = useAppDispatch();
  const tasksFromStore = useAppSelector(selectFilteredTasks); 
  const filters = useAppSelector(selectFilters); // current filter state

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-[#A06D4D] to-[#E1D8D0] p-6 flex flex-col items-center gap-6">
      <h2 className="text-orange-950 text-5xl font-bold">Your Tasks</h2>

      {/* Search_Input*/}
      <input
        type="text"
        placeholder="Search task by their name"
        value={filters.searchText}
        onChange={(e) => dispatch(setFilters({ searchText: e.target.value }))}
        className="w-full max-w-2xl px-3 py-3 shadow-lg rounded outline-none"
      />

      {tasksFromStore.length > 0 ? (
        tasksFromStore.map((task) => (
          <div
            key={task.id}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3xl flex justify-between items-center hover:shadow-xl transition-all duration-300"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{task.name}</h2>
              <p className="font-bold text-lg text-gray-800">
                Start: {task.startDate ? format(parseISO(task.startDate), "MMM dd, yyyy") : "N/A"} <br />
                End: {task.endDate ? format(parseISO(task.endDate), "MMM dd, yyyy") : "N/A"}
              </p>
            </div>

            <div className="flex gap-3">
              {task.row !== undefined && <p>Row: {task.row}</p>}
              <button
                onClick={() => dispatch(deleteTask({ id: task.id }))}
                className="bg-orange-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-700 text-xl flex justify-center font-bold items-center">
          <p>No matching tasks found...</p>
        </div>
      )}
    </div>
  );
}
