import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { NavLink } from "react-router-dom";

export function CardWithLink({ post }) {
  return (
    <Card className="mt-6 w-full hover:-translate-y-2 ease-in-out duration-300 hover:drop-shadow-xl border-dashed border-2 border-gray-300">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {post.title}
        </Typography>
        <Typography>{post.content}</Typography>
      </CardBody>
      <CardFooter className="pt-0 w-full">
        <NavLink to={"Category/" + post._id}>
          <Button size="sm" variant="text" className="flex items-center justify-end gap-2 border rounded-md">
            incele
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </Button>
        </NavLink>
      </CardFooter>
    </Card>
  );
}
