import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { EvaluationTemplate } from "../../types";

interface TemplateState {
  templates: EvaluationTemplate[];
  selectedTemplate: EvaluationTemplate | null;
  loading: boolean;
  error: string | null;
}

const initialState: TemplateState = {
  templates: [],
  selectedTemplate: null,
  loading: false,
  error: null,
};

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setTemplates(state, action: PayloadAction<EvaluationTemplate[]>) {
      state.templates = action.payload;
      state.error = null;
    },
    addTemplate(state, action: PayloadAction<EvaluationTemplate>) {
      state.templates.push(action.payload);
    },
    updateTemplate(state, action: PayloadAction<EvaluationTemplate>) {
      const index = state.templates.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    removeTemplate(state, action: PayloadAction<string>) {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
    },
    setSelectedTemplate(state, action: PayloadAction<EvaluationTemplate | null>) {
      state.selectedTemplate = action.payload;
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
  setTemplates,
  addTemplate,
  updateTemplate,
  removeTemplate,
  setSelectedTemplate,
  setLoading,
  setError,
} = templateSlice.actions;
export default templateSlice.reducer;
