import axios from '../api/axios';
import useAuth from './useAuth';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/AuthSlice";

const useRefreshToken = () => {
    const auth = useAuth();
    const dispatch = useDispatch();
    
    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });
        dispatch(loginSuccess({...auth, accessToken: response.data.accessToken}));

        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;