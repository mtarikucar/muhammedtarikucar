import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
} from "./AuthSlice";
import { Link } from "react-router-dom";
import { publicRequest } from "../../utils/requestMethods";

export const login = (user) => {
  return async (dispatch) => {
    dispatch(loginStart());
    try {
      const response = await publicRequest.post("/auth/login", user);
      dispatch(loginSuccess(response.data.data));
    } catch (err) {
      dispatch(loginFailure());
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    dispatch(logoutStart());
    try {
      // çıkış yaparken işlemleri test etmek için bu kısmı ilerde kullancan
      dispatch(logoutSuccess());
    } catch (err) {
      dispatch(logoutFailure());
    }
  };
};

export const register = (user) => {
  return async (dispatch) => {
    dispatch(registerStart());
    try {
      const response = await publicRequest.post("/auth/register", user);
      dispatch(registerSuccess());
    } catch (err) {
      dispatch(registerFailure());
    }
  };
};
