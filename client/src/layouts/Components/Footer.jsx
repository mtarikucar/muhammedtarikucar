import { Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className=" fixed  bottom-0 flex w-full flex-col  items-start justify-center  gap-x-12 m-4 text-center">
      <Typography color="blue-gray" className="font-normal">
        &copy; Muhammed Tarık Uçar
      </Typography>
      <ul className="flex flex-row items-center  gap-x-8">
        <li>
          <Link to={"https://www.instagram.com/tarikucr"}>
            <Typography
              color="blue-gray"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              Instagram
            </Typography>
          </Link>
        </li>
        |
        <li>
          <Link to={"https://github.com/mtarikucar"}>
            <Typography
              color="blue-gray"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              Github
            </Typography>
          </Link>
        </li>
      </ul>
    </footer>
  );
}
