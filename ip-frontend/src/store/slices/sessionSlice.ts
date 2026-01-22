import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type EvaluationSession } from "../../types";

interface SessionState {
  sessions: EvaluationSession[];
  selectedSession: EvaluationSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  sessions: [],
  selectedSession: null,
  loading: false,
  error: null,
};

const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setSessions(state, action: PayloadAction<EvaluationSession[]>) {
      state.sessions = action.payload;
      state.error = null;
    },
    addSession(state, action: PayloadAction<EvaluationSession>) {
      state.sessions.push(action.payload);
    },
    updateSession(state, action: PayloadAction<EvaluationSession>) {
      const index = state.sessions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    },
    removeSession(state, action: PayloadAction<string>) {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
    },
    setSelectedSession(state, action: PayloadAction<EvaluationSession | null>) {
      state.selectedSession = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setSessions,
  addSession,
  updateSession,
  removeSession,
  setSelectedSession,
  setLoading,
  setError,
} = sessionSlice.actions;
export default sessionSlice.reducer;
