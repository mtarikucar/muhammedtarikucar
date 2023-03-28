function PostLoad() {
  return (
    <div className="main">
      <div className="flex flex-col justify-center items-center h-fit rounded ease-in-out duration-500 animate-pulse">
        <div className="relative flex flex-col items-center rounded mx-auto p-4 bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:!shadow-none ">
          <div className="relative flex h-32 w-full justify-center rounded-xl bg-cover bg-gray-300">
            <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white backdrop-blur-lg dark:!border-navy-700"></div>
          </div>
          <div className="mt-16 flex flex-col items-center">
            <div className="h-2 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-300 rounded w-full m-2">
              __________________________________
            </div>
            <div className="h-2 bg-gray-300 rounded w-full m-2"></div>
            <div className="h-2 bg-gray-300 rounded w-full m-2"></div>
            <div className="h-2 bg-gray-300 rounded w-full m-2"></div>
            <div className="h-2 bg-gray-300 rounded w-full m-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostLoad;
