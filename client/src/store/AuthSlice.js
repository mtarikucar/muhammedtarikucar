import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  refreshToken: null,
  accessToken: null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.currentUser = action.payload.user;
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken;
    },
    logoutSuccess(state) {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken =null;
      
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;

export default authSlice.reducer;
