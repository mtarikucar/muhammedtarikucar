import { NavLink } from "react-router-dom";


function Post({ post }) {


  
  const date = new Date(post.updatedAt);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;



  return (
    <>
      
      <div className="rounded-xl bg-white p-4 ring ring-indigo-50 mb-4 w-full flex flex-col ">
        
        <div className="flex flex-col flex-grow">
          <div className="flex flex-row justify-between items-center">
            <h3 className="text-lg font-medium sm:text-xl">
              <NavLink to={`/Blog/${post._id}`}>{post.title}</NavLink>
            </h3>
          
          </div>
          <p className="mt-1 text-sm text-gray-700 overflow-hidden">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  post &&
                  post.content.substring(0, 200) +
                  (post && post.content.length > 200 ? "..." : ""),
              }}
            ></div>
          </p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              
              
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;
