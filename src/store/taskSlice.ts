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

export const ALL_CATEGORIES: Category[] = ["To Do", "In Progress", "Review", "Completed"];

export const defaultFilters: FiltersState = {
  categories: ALL_CATEGORIES,
  timeWindowWeeks: null ,
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

  let timeLimit: { start: Date; end: Date } | null = null;
  if (filters.timeWindowWeeks) {
    const now = new Date();
    timeLimit = {
      start: subDays(now, filters.timeWindowWeeks * 7), // X weeks ago
      end: now,
    };
  }

  return tasks.filter(t => {
    // Filter by category
    if (!categoriesSet.has(t.category)) return false;

    // Filter by search text
    if (search && !t.name.toLowerCase().includes(search)) return false;

    // Filter by time window
    if (timeLimit) {
      const start = new Date(t.startDate);
      if (start < timeLimit.start || start > timeLimit.end) return false;
    }

    return true;
  });
};
