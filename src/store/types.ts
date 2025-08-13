// types.ts
export type Category = "To Do" | "In Progress" | "Review" | "Completed";

export interface Task {
  id: string;
  name: string;
  category: Category;
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string;   // inclusive, ISO date
  // optional visual layer info (row index, color etc.)
  row?: number;
}

export interface FiltersState {
  categories: Category[]; // multi-select
  timeWindowWeeks?: 1 | 2 | 3 | null; // single select (1,2,3)
  searchText?: string;
}
