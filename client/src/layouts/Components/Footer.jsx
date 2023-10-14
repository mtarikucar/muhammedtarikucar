import { Typography } from "@material-tailwind/react";

export default function Footer() {
  return (
    <footer className=" sticky bottom-0 flex w-full flex-col  items-center justify-center  gap-x-12 border-t border-blue-gray-50 py-2 text-center md:justify-between backdrop-blur-lg">
      <Typography color="blue-gray" className="font-normal">
        &copy; Muhammed Tarık Uçar
      </Typography>
      <ul className="flex flex-row items-center  gap-x-8">
        <li>
          <Typography
            
            href="https://www.instagram.com/tarikucr"
            color="blue-gray"
            className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
          >
            Instagram
          </Typography>
        </li>
        |
        <li>
          <Typography
            
            href="https://github.com/mtarikucar"
            color="blue-gray"
            className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
          >
            Github
          </Typography>
        </li>
      </ul>
    </footer>
  );
}
