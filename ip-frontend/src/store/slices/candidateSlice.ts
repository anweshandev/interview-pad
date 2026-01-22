import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Candidate } from "../../types";

interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  loading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  selectedCandidate: null,
  loading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setCandidates(state, action: PayloadAction<Candidate[]>) {
      state.candidates = action.payload;
      state.error = null;
    },
    addCandidate(state, action: PayloadAction<Candidate>) {
      state.candidates.push(action.payload);
    },
    updateCandidate(state, action: PayloadAction<Candidate>) {
      const index = state.candidates.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = action.payload;
      }
    },
    removeCandidate(state, action: PayloadAction<string>) {
      state.candidates = state.candidates.filter((c) => c.id !== action.payload);
    },
    setSelectedCandidate(state, action: PayloadAction<Candidate | null>) {
      state.selectedCandidate = action.payload;
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
  setCandidates,
  addCandidate,
  updateCandidate,
  removeCandidate,
  setSelectedCandidate,
  setLoading,
  setError,
} = candidateSlice.actions;
export default candidateSlice.reducer;
