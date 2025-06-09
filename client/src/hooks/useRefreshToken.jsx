import axios from '../api/axios';
import useAuth from './useAuth';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/AuthSlice";

const useRefreshToken = () => {
    const auth = useAuth();
    const dispatch = useDispatch();
    
    const refresh = async () => {
        try {
            const response = await axios.post('/auth/refresh-token', {
                refreshToken: auth.refreshToken
            });
            dispatch(loginSuccess({...auth, accessToken: response.data.accessToken}));

            return response.data.accessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }
    return refresh;
};

export default useRefreshToken;