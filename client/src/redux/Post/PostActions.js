import { publicRequest } from "../../utils/requestMethods";

import {addPostStart,addPostFailure,addPostSuccess,getPostFailure,getPostStart,getPostSuccess} from "./postSlice"

export const getPosts = () => {
  return async (dispatch) => {
    dispatch(getPostStart());
    try {
      let url = "/posts";

      const response = await publicRequest.get(url);

      dispatch(getPostSuccess(response.data));
    } catch (err) {
      dispatch(getPostFailure());
      console.log(err);
    }
  };
};




export const addPost = (props) =>{
    return async (dispatch)=>{
        dispatch(addPostStart());
        try{
            const response = await publicRequest.post(`/posts/add`, props);
            dispatch(addPostSuccess(response.data))
            console.log(props);
        }catch(err){
            dispatch(addPostFailure(response.data))
        }
    }
}
