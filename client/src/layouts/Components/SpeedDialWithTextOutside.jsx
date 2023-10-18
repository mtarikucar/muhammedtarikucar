import React, { useState } from "react";
import {
  IconButton,
  SpeedDial,
  SpeedDialHandler,
  SpeedDialContent,
  SpeedDialAction,
  Typography,
  Avatar,
} from "@material-tailwind/react";
import {
  PlusIcon,
  HomeIcon,
  CogIcon,
  Square3Stack3DIcon,
  ArrowUpOnSquareStackIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export function SpeedDialWithTextOutside() {
  const labelProps = {
    variant: "small",
    color: "blue-gray",
    className:
      "absolute top-2/4 -left-2/4 -translate-y-2/4 -translate-x-3/4 font-normal",
  };
  const [open, setOpen] = useState(false);

  const auth = useAuth();
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <SpeedDial open={open} handler={setOpen}>
        <SpeedDialHandler onClick={() => setOpen(!open)}>
          <IconButton size="lg" className="rounded-full">
            {auth.currentUser ? (
              <Avatar
                variant="circular"
                size="sm"
                alt="tania andrew"
                className="border border-gray-900 "
                src="../src/images/avatar.png"
              />
            ) : (
              <PlusIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
            )}
          </IconButton>
        </SpeedDialHandler>
        <SpeedDialContent>
          <SpeedDialAction className="relative">
            <NavLink to={"/"}>
              <Typography {...labelProps}>Home</Typography>
              <HomeIcon className="h-5 w-5" />
            </NavLink>
          </SpeedDialAction>
          {auth.currentUser && (
            <>
              <SpeedDialAction className="relative">
                <NavLink to={"/upload"}>
                  <Typography {...labelProps}>Upload</Typography>
                  <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                </NavLink>
              </SpeedDialAction>
              <SpeedDialAction className="relative">
                <Typography {...labelProps}>Settings</Typography>
                <CogIcon className="h-5 w-5" />
              </SpeedDialAction>
            </>
          )}
        </SpeedDialContent>
      </SpeedDial>
    </div>
  );
}
