import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import candidateReducer from "./slices/candidateSlice";
import questionReducer from "./slices/questionSlice";
import templateReducer from "./slices/templateSlice";
import sessionReducer from "./slices/sessionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidates: candidateReducer,
    questions: questionReducer,
    templates: templateReducer,
    sessions: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
