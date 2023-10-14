import React, { useState } from "react";
import {
  IconButton,
  SpeedDial,
  SpeedDialHandler,
  SpeedDialContent,
  SpeedDialAction,
  Typography,
} from "@material-tailwind/react";
import {
  PlusIcon,
  HomeIcon,
  CogIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

export function SpeedDialWithTextOutside() {
  const labelProps = {
    variant: "small",
    color: "blue-gray",
    className:
      "absolute top-2/4 -left-2/4 -translate-y-2/4 -translate-x-3/4 font-normal",
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleSpeedDial = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-5 right-5">
      <SpeedDial>
        <SpeedDialHandler>
          <IconButton size="lg" className="rounded-full">
            <PlusIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
          </IconButton>
        </SpeedDialHandler>
        <SpeedDialContent>
          <SpeedDialAction className="relative">
            <NavLink to={"/"}>
              <Typography {...labelProps}>Home</Typography>
              <HomeIcon className="h-5 w-5" />
            </NavLink>
          </SpeedDialAction>
          {/*  <SpeedDialAction className="relative">
            <Typography {...labelProps}>Settings</Typography>
            <CogIcon className="h-5 w-5" />
          </SpeedDialAction>
          <SpeedDialAction className="relative">
            <Typography {...labelProps}>Pages</Typography>
            <Square3Stack3DIcon className="h-5 w-5" />
          </SpeedDialAction> */}
        </SpeedDialContent>
      </SpeedDial>
    </div>
  );
}
