import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Link,useNavigate } from "react-router-dom";
import {  toast } from "react-toastify";

import axios from "axios";

const Register = () => {
    const navigateTo = useNavigate();

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (userData) =>
      axios.post("http://localhost:3000/api/auth/register", userData),
    {
      onSuccess: () => {
        
        toast.success("Hesap başarıyla oluşturuldu!");
        navigateTo('/Login')
      },
      onError: () => {
        toast.error("Hesap oluşturulurken bir hata oluştu.");
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      mutation.mutate(values);
      console.log(values);
    },
  });

  return (
    <>
      <div className="px-4 w-full h-screen flex justify-center items-center bg-login bg-no-repeat bg-cover">
        
        <form
          onSubmit={formik.handleSubmit}
          className="border bg-white p-6 flex rounded-xl flex-col items-center min-w-[17rem] sm:min-w-[22rem] md:min-w-[35rem] max-w-[25rem]"
        >
          <h1 className="uppercase text-xl mb-4 font-bold">Kayıt ol</h1>

          <div className="grid gap-4 md:grid-cols mb-4">
            <input
              className="block p-2 border-2 rounded-xl focus:outline-none"
              type="text"
              placeholder="Kullanıcı Adı"
              name="username"
              onChange={formik.handleChange}
              value={formik.values.username}
            />
            <input
              className="block p-2 border-2 rounded-xl focus:outline-none"
              type="email"
              placeholder="Email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            <input
              className="block p-2 border-2 rounded-xl focus:outline-none"
              type="password"
              placeholder="Şifre"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />
          </div>

          <p className="mb-4 ">
            Hesap oluşturarak kişisel verilerimin{" "}
            <a href="" className="uppercase font-bold">
              GİZLİLİK POLİTİKASI
            </a>
            'na uygun olarak işlenmesine izin veriyorum.&nbsp;
          </p>
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="uppercase bg-rose-500 mb-4 text-white hover:bg-rose-700 transition ease-out duration-500 shadow rounded-lg p-2"
          >
            {mutation.isLoading ? "Loading..." : "Hesap Oluştur"}
          </button>
          {
            <Link to="/login" className="capitalize underline mb-4">
              Zaten Bir Hesabınız var mı ?
            </Link>
          }
        </form>
      </div>
    </>
  );
};
export default Register;
