import { useQuery } from 'react-query';
import axios from 'axios';

const fetchPost = async (id) => {
  const response = await axios.get(`https://your-api-endpoint.com/posts/${id}`);
  return response.data;
};

export const usePost = (id) => {
  return useQuery(['post', id], () => fetchPost(id), {
    enabled: !!id, // Only run the query if the "id" is available.
  });
};