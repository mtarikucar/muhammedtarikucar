import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../../store/AuthSlice";

const createCommunity = async (values, token) => {
  const response = await axios.post(
    "http://localhost:3000/api/community/create",
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

function CommunityCreateModal({ setIsCommunityOpen, isCommunityOpen }) {
  const dispatch = useDispatch();
  const { token, currentUser } = useSelector((state) => state.auth);

  const useCreateCommunity = () => {
    return useMutation((values) => createCommunity(values, token), {
      onSuccess: (data) => {
        console.log("community oluşturuldu");
        console.log(data)
        dispatch(
          loginSuccess({
            user: { ...currentUser, community: `${data._id}`, },
            token: token
          })
        );
        console.log(currentUser, "değişti");
        setIsCommunityOpen(!isCommunityOpen)
      },
    });
  };

  const { mutate } = useCreateCommunity();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    onSubmit: async (values) => {
      mutate(values);
      console.log(values);
    },
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const handleTransitionEnd = () => {
    setIsAnimating(false);
  };

  return (
    <>
      {/* Modal */}
      {isCommunityOpen && (
        <>
          <div
            className={`fixed top-0 left-0 z-10 w-screen h-screen bg-gray-900 bg-opacity-50 ${
              isAnimating ? "animate-fade-in" : "animate-fade-out"
            }`}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationEnd={handleTransitionEnd}
          />
          <div
            className={`fixed top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-white rounded-lg shadow-lg ${
              isAnimating ? "animate-slide-up" : "animate-slide-down"
            }`}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationEnd={handleTransitionEnd}
          >
            <div className="relative">
              <button
                type="button"
                className="absolute -top-10 -right-6 p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setIsCommunityOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <form
                onSubmit={formik.handleSubmit}
                className="max-w-md mx-auto mt-4"
              >
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    topluluk ismi
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    } appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="topluluk ismi"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    açıklama
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${
                      formik.touched.description && formik.errors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    } appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="açıklama"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!formik.dirty || !formik.isValid}
                    className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    kendi topluluğunu oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CommunityCreateModal;
