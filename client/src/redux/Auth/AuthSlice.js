import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  currentUser: null,
  isFetching: false,
  error: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess(state, action) {
      state.isFetching = false;
      state.currentUser = action.payload;
    },
    loginFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
    logoutStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    logoutSuccess(state, action) {
      state.isFetching = false;
      state.currentUser = action.payload;
    },
    logoutFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
    registerStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    registerSuccess(state) {
      state.isFetching = false;
    },
    registerFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
} = authSlice.actions;

export default authSlice.reducer;
