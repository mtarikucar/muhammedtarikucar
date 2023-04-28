import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { FiUpload } from "react-icons/fi";
  import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
  } from "firebase/storage";
  import app from "../../firebase";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RichTextEditor from "../components/RichTextEditor";

function Upload() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [content, setContent] = useState();
  const [voice, setVoice] = useState();
  const titleRef = useRef();
  const [isAll, setIsAll] = useState(null);

  const [prog, setProg] = useState({
    percent: 0,
    state: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const { currentUser, token } = useSelector((store) => store.auth);

  const handleFileUpload = (event) => {
    const newFiles = [...event.target.files].map((file) => {
      const url = URL.createObjectURL(file);
      return { id: uuidv4(), url, file };
    });
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (props) => {

      const response = await axios.post(
        "http://localhost:3000/api/posts",
        props.props,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            id: currentUser._id,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts"); // Invalidate 'posts' query to refetch data and update the UI
        navigate(`/Profile/${currentUser._id}`); // Navigate to the user's profile after a successful post creation
    

      },
      onError: (er) => {
        console.log(er);
      },
    }
  );

  const upload = (file) => {
    const type = file.type.split("/")[0];
    const fileName = type + "/" + new Date().getTime() + file.name;
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        /* console.log("Upload is " + progress + "% done"); */
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            setProg({
              percent: progress,
              state: false,
            });
            break;
          case "running":
            /*  console.log("Upload is running"); */
            setProg({
              percent: progress,
              state: true,
            });
            break;
          default:
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.log("upload error", error);
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          if (type == "audio") {
            setVoice(downloadURL);
          } else {
            setUploadedFiles((uploadedFiles) => [
              ...uploadedFiles,
              { url: downloadURL, type: type },
            ]);
          }
          setIsAll((isAll) => isAll + 1);
        });
      }
    );
  };

  useEffect(() => {
    if (isAll == files.length) {
      setProg({
        percent: 0,
        state: false,
      });
      mutation.mutate({
        props: {
          title: titleRef.current.value,
          content: content,
          materials: uploadedFiles,
          sound: voice,
          category: "uncategorized",
          author: currentUser._id,
        },
      });
      
    }
    isAll && toast(isAll + " files uploaded");
  }, [isAll]);

  const handleClick = async (e) => {
    e.preventDefault();

    setIsAll(0);

    for (const file of files) {
      toast(file.file.name + "yükleniyor");
      await upload(file.file);
    }

    
  };

  return (
    <>
      {currentUser ? (
        <div className="container p-4 w-3/4 h-screen flex justify-center items-center md:w-full md:px-24 sm:px-12">
          <div className="container mx-auto mt-8 ">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 ">
              <div className="col-span-1 border-2 rounded-lg p-4">
                <div className="flex justify-center mb-4">
                  <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-md tracking-wide border border-blue cursor-pointer hover:bg-gray-200">
                    {prog && prog.state == true ? (
                      prog.percent
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 mb-2" />
                        <span className="text-base leading-normal">
                          Choose files
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          multiple
                        />
                      </>
                    )}
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-transparent">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="relative rounded-xl bg-transparent"
                    >
                      <img
                        src={file.url}
                        alt={file.file.name}
                        className="w-full h-auto  rounded-xl bg-transparent"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
                        <span className="text-white">{file.file.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-1 border-2 rounded-lg p-4">
                <div className="flex flex-row items-center justify-center">
                  <input
                    className="border-2 p-2 m-4 rounded-md border-gray-300 focus:backdrop-blur-xl "
                    type="text"
                    name="title"
                    id="title"
                    ref={titleRef}
                    placeholder={"başlık buraya"}
                  />
                </div>
                <RichTextEditor setContent={setContent} />
                <div className="flex flex-row justify-end md:justify-center ">
                  <button
                    className=" border-4 rounded-md px-4 border-gray-500 hover:bg-gray-500 hover:text-white ease-in-out duration-300"
                    onClick={handleClick}
                  >
                    share
                  </button>

                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-row justify-center items-center">
            giriş yapmadan bişey paylaşamzsın moruk hadi ikile
          </div>
        </>
      )}
    </>
  );
}

export default Upload;
