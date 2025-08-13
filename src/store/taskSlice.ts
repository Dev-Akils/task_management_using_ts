// store/tasksSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task, Category, FiltersState } from "./types";
import { RootState } from "./store.ts";
import { subDays } from "date-fns";

const TASKS_LS_KEY = "task_planner_tasks_v1";

interface TasksState {
  tasks: Task[];
  filters: FiltersState;
}

const defaultFilters: FiltersState = {
  categories: ["To Do", "In Progress", "Review", "Completed"],
  timeWindowWeeks: null,
  searchText: ""
};

const loadFromLocal = (): Task[] => {
  try {
    const raw = localStorage.getItem(TASKS_LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
};

const saveToLocal = (tasks: Task[]) => {
  try { localStorage.setItem(TASKS_LS_KEY, JSON.stringify(tasks)); } catch {}
};

const initialState: TasksState = {
  tasks: loadFromLocal(),
  filters: defaultFilters
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<{ name: string; category: Category; startDate: string; endDate: string }>) {
  const id = Date.now().toString();
  const newTask: Task = { id, ...action.payload };
  state.tasks.push(newTask);
  saveToLocal(state.tasks);
},

    updateTask(state, action: PayloadAction<{ id: string; patch: Partial<Task> }>) {
      const t = state.tasks.find(x => x.id === action.payload.id);
      if (t) Object.assign(t, action.payload.patch);
      saveToLocal(state.tasks);
    },
    deleteTask(state, action: PayloadAction<{ id: string }>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload.id);
      saveToLocal(state.tasks);
    },
    moveTask(state, action: PayloadAction<{ id: string; newStartDate: string; newEndDate: string }>) {
      const t = state.tasks.find(x => x.id === action.payload.id);
      if (!t) return;
      t.startDate = action.payload.newStartDate;
      t.endDate = action.payload.newEndDate;
      saveToLocal(state.tasks);
    },
    resizeTask(state, action: PayloadAction<{ id: string; newStartDate?: string; newEndDate?: string }>) {
      const t = state.tasks.find(x => x.id === action.payload.id);
      if (!t) return;
      if (action.payload.newStartDate) t.startDate = action.payload.newStartDate;
      if (action.payload.newEndDate) t.endDate = action.payload.newEndDate;
      saveToLocal(state.tasks);
    },
    setFilters(state, action: PayloadAction<Partial<FiltersState>>) {
      state.filters = { ...state.filters, ...action.payload };
      // no local save for filters by default, but you can if you want
    },
    clearAllTasks(state) {
      state.tasks = [];
      saveToLocal(state.tasks);
    }
  }
});

export const { addTask, updateTask, deleteTask, moveTask, resizeTask, setFilters, clearAllTasks } = taskSlice.actions;
export default taskSlice.reducer;

// selectors
export const selectAllTasks = (s: RootState) => s.tasks.tasks;
export const selectFilters = (s: RootState) => s.tasks.filters;
export const selectFilteredTasks = (s: RootState) => {
  const { tasks, filters } = s.tasks;
  const search = (filters.searchText || "").toLowerCase().trim();
  const categoriesSet = new Set(filters.categories || []);
  // time window filter (optional)
  let timeLimit: Date | null = null;
  if (filters.timeWindowWeeks) {
    timeLimit = subDays(new Date(), -(7 * filters.timeWindowWeeks)); // future window - adjust logic as needed
  }
  return tasks.filter(t => {
    if (!categoriesSet.has(t.category)) return false;
    if (search && !t.name.toLowerCase().includes(search)) return false;
    if (timeLimit) {
      // keep tasks that start within the time window (customize per your definition)
      const start = new Date(t.startDate);
      if (start > timeLimit) return false;
    }
    return true;
  });
};
