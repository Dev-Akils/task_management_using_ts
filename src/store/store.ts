import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./taskSlice.ts";

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});

export default store;

// Export types separately
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
