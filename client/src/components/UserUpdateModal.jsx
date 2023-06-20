import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../../firebase";

function UserUpdateModal({ isOpen, setIsOpen }) {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  const userId = id;

  const updateUser = async (userData) => {
    const response = await axios.put(
      `http://localhost:3000/api/users/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };
  const { mutate } = useMutation(updateUser);

  const { data: user, isLoading } = useQuery(
    ["user", userId],
    async () => {
      const response = await axios.get(
        `http://localhost:3000/api/users/${userId}`
      );
      const data = response.data;
      return data[0];
    },
    {
      onSuccess: (data) => {
        formik.setFieldValue("name", data?.name),
          formik.setFieldValue("email", data?.email);
      },
    }
  );

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    image: Yup.mixed().test("fileSize", "File size is too large", (value) => {
      if (!value) {
        return true;
      }
      return value.size <= 5000000;
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      image: user?.image ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      handleClick(values);
    },
  });

  const handleClick = async (values) => {
    const imageName = "pp/" + values.image.name + new Date().getTime();
    const storage = getStorage(app);
    const storageRef = ref(storage, imageName);
    const uploadTask = uploadBytesResumable(storageRef, values.image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
        }
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const userData = { ...formik.values, image: downloadURL };
          mutate(userData, {
            onSuccess: () => {
              console.log("Form submitted successfully");
              setIsOpen(false);
            },
            onError: (response) => {
              alert("An error occured while submiting the form");
              console.log(userData);
              console.log(response);
            },
            onSettled: (response) => {
              console.log(response);
            },
          });
        });
      }
    );
  };

  // Define the mutation
  const mutation = useMutation(updateUser, {
    onSuccess: () => {
      formik.resetForm();
      alert("User updated successfully");
    },
    onError: (error) => {
      alert("Error updating user: " + error.message);
    },
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const handleTransitionEnd = () => {
    setIsAnimating(false);
  };

  return (
    <>
      
      {isOpen && (
        <div
          className={`fixed top-0 left-0 z-10 w-screen h-screen bg-gray-900 bg-opacity-50 ${
            isAnimating ? "animate-fade-in" : "animate-fade-out"
          }`}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationEnd={handleTransitionEnd}
        />
      )}

     
      {isOpen && (
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
              onClick={() => setIsOpen(false)}
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
                  Name
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
                  placeholder="Enter your name"
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
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your email"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {formik.errors.email}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Image
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(event) => {
                    formik.setFieldValue("image", event.currentTarget.files[0]);
                    
                  }}
                  className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {formik.touched?.image && formik.errors?.image && (
                                    <p className="mt-2 text-sm text-red-600">{formik.errors?.image}</p>
                                )}
              </div>
              <div>
                <button
                  type="submit"
                   disabled={!formik.dirty || !formik.isValid || mutation.isLoading}
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {mutation.isLoading ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserUpdateModal;
