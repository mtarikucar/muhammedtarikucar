import { Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className=" relative bottom-0 flex w-full flex-col  items-center justify-center  gap-x-12 border-t border-blue-gray-50 py-2 text-center md:justify-between backdrop-blur-lg">
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
