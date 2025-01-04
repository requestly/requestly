// app/src/store/slices/features/graphify/slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentStep: 0,
  apiConfig: null,
  analyzedEndpoints: null,
  selectedEndpoints: [],
  generatedSchema: null,
  error: null,
};

const graphifySlice = createSlice({
  name: "graphify",
  initialState,
  reducers: {
    setApiConfig: (state, action) => {
      state.apiConfig = action.payload;
      state.currentStep = 1; // Move to endpoint analysis
    },
    setAnalyzedEndpoints: (state, action) => {
      state.analyzedEndpoints = action.payload;
    },
    updateSelectedEndpoints: (state, action) => {
      state.selectedEndpoints = action.payload;
    },
    setGeneratedSchema: (state, action) => {
      state.generatedSchema = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetTranslation: (state) => {
      return initialState;
    },
  },
});

export const graphifyActions = graphifySlice.actions;
export default graphifySlice.reducer;
