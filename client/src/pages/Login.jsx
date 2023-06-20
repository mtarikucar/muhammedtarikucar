import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/AuthSlice";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Kullanıcı adı zorunludur"),
  password: Yup.string().required("Şifre zorunludur"),
});

const Login = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
const navigate = useNavigate()

  const mutation = useMutation(
    (values) => axios.post("http://localhost:3000/api/auth/login", values),
    {
      onSuccess: (data) => {
        console.log(data.data);
        toast.success("Başarıyla giriş yaptınız");
        queryClient.invalidateQueries("user");
        dispatch(loginSuccess({user: data.data.user,token: data.data.token}));
        navigate("/Blog")
      },
      onError: (err) => {

        toast.error("Bir hata oluştu, lütfen daha sonra tekrar deneyin", err);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        await mutation.mutate(values);
      } catch (err) {
        toast.error("Bir hata oluştu, lütfen daha sonra tekrar deneyin");
      }
    },
  });

  return (
    <>
      <div className="px-4 w-full h-screen flex justify-center items-center bg-login bg-no-repeat bg-cover">
        <form
          onSubmit={formik.handleSubmit}
          className="border rounded-xl bg-white p-6 flex flex-col min-w-[17rem] sm:min-w-[22rem] md:min-w-[25rem]"
        >
          <h1 className="uppercase text-xl mb-4 font-bold">Giriş</h1>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Kullanıcı Adı"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
            className="p-2 mb-4 rounded-xl border-2  focus:outline-none"
          />
          {formik.touched.username && formik.errors.username ? (
            <div className="text-red-500 mb-4">{formik.errors.username}</div>
          ) : null}
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Şifre"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className="p-2 mb-4 border-2  rounded-xl focus:outline-none"
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="text-red-500 mb-4">{formik.errors.password}</div>
          ) : null}
          <button
            type="submit"
            disabled={formik.isSubmitting || mutation.isLoading}
            className="mb-4 bg-rose-500 rounded-xl text-white p-2 disabled:bg-rose-700 disabled:cursor-not-allowed"
          >
            {" "}
            Giriş yap
          </button>
          {mutation.isError && <p>Something went wrong. Please try later...</p>}
          <Link to="/Register" className="capitalize underline mb-4">
            Kayıtlı bir kullanıcı adınız yok mu?
          </Link>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;
