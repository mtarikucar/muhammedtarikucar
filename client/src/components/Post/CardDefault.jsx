import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { CustomRatingIcon } from "../CustomRatingIcon";
import { NavLink } from "react-router-dom";

export function CardDefault({ post }) {
  const date = new Date(post.updatedAt);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  return (
    <Card className="mt-6 w-full hover:-translate-y-2 ease-in-out duration-300 hover:drop-shadow-xl border-dashed border-2 border-gray-300 flex flex-col">
      <CardHeader color="blue-gray" className="relative h-56">
        <img
          src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
          alt="card-image"
        />
      </CardHeader>
      <CardBody className="flex-grow">
        <Typography variant="h5" color="blue-gray" className="mb-2">
          <NavLink to={`/Post/${post._id}`}>{post.title}</NavLink>
        </Typography>
        <Typography>
          <div
            dangerouslySetInnerHTML={{
              __html:
                post &&
                post.content.substring(0, 200) +
                  (post && post.content.length > 200 ? "..." : ""),
            }}
          ></div>
        </Typography>
      </CardBody>
      <CardFooter className="flex justify-between items-center">
        <NavLink to={`/Post/${post._id}`}>
          <Button>incele</Button>
        </NavLink>
        <span className="flex flex-col items-center">
          <CustomRatingIcon />
          <p className="text-xs font-medium flex flex-row justify-end my-1">
            {formattedDate}
          </p>
        </span>
      </CardFooter>
    </Card>
  );
}
