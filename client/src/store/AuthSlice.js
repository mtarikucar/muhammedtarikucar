import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  currentUser: null,
  token: null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.currentUser = action.payload.user;
      state.token = action.payload.token
    },
    logoutSuccess(state) {
      state.currentUser = null;
      state.token=null;
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;

export default authSlice.reducer;
