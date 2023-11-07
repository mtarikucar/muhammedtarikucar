import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../../firebase";


import axios from "../api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";

import RichTextEditor from "../components/RichTextEditor";

import { Select, Option } from "@material-tailwind/react";

function Upload() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [content, setContent] = useState();
  const [voice, setVoice] = useState();
  const titleRef = useRef();
  const [isAll, setIsAll] = useState(null);
  const [categories, setCategories] = useState([]);

  const [prog, setProg] = useState({
    percent: 0,
    state: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const { currentUser } = useSelector((store) => store.auth);


  const [category, setCategory] = useState("");


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
        "/posts",
        props.props,
        {
          params: {
            id: "6465e59b33004b97c3639542",
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts"); // Invalidate 'posts' query to refetch data and update the UI
        navigate(`/`); // Navigate to the user's profile after a successful post creation
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

        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;


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
        console.log("upload error", error);
      },
      () => {
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
      console.log(category);
      mutation.mutate({
        props: {
          title: titleRef.current.value,
          content: content,
          materials: uploadedFiles,
          sound: voice,
          category: category,
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/event'); 
        setCategories(response.data); 
      } catch (error) {
        console.error('Error fetching categories:', error);
        
      }
    };

    
    fetchCategories();
  }, []); 


  return (
    <>
      <div className="container p-4 w-3/4 flex justify-center items-center md:w-full ">
        <div className="container mx-auto mt-8 ">
          <div className="grid grid-cols-1 gap-4  ">
            <div className="col-span-1 border-2 rounded-lg p-4 ">
              <div className="flex justify-center mb-4 ">
                <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-md tracking-wide border border-blue cursor-pointer hover:bg-gray-200">
                  {prog && prog.state == true ? (
                    prog.percent
                  ) : (
                    <>
                      <ArrowUpIcon className="w-8 h-8 mb-2" />
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
              <div className="flex flex-row items-center justify-center p-2 m-4 ">
                <Select
                  label="Select Category"
                  onChange={(value) => setCategory(value)}

                  variant="outlined"
                >
                  {categories.map((cat, index) => (
                    <Option key={index} value={cat._id}>
                      {cat.title}
                    </Option>
                  ))}
                </Select>
                {/* <div className="relative flex w-full max-w-[24rem] mt-3">
                  <Input
                    type="email"
                    label="kategori ekle"
                    value={category}
                    onChange={onChange}
                    className="pr-20"
                    containerProps={{
                      className: "min-w-0",
                    }}
                  />
                  <Button
                    size="sm"
                    color={category ? "gray" : "blue-gray"}
                    disabled={!category}
                    className="!absolute right-1 top-1 rounded"
                  >
                    Ekle
                  </Button>
                </div> */}
                <input
                  className="border-2 p-2 m-2 rounded-md border-gray-300 focus:backdrop-blur-xl "
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Upload;
