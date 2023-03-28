import { createSlice } from "@reduxjs/toolkit";

export const PostSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    //GET ALL
    getPostStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getPostSuccess: (state, action) => {
      state.isFetching = false;
      state.posts = action.payload;
      state.error = false
    },
    getPostFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    //Post
    addPostStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    addPostSuccess: (state,action) => {
      state.isFetching = false;
      
    },
    addPostFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    }
    
  },
});

export const {
  getPostStart,
  getPostSuccess,
  getPostFailure,
  addPostStart,
  addPostSuccess,
  addPostFailure,
} = PostSlice.actions;

export default PostSlice.reducer;