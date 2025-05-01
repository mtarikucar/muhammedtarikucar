import React, { useState, useEffect } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  PowerIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess } from "../../store/AuthSlice";
import { toast } from "react-toastify";
import SearchBar from "../SearchBar/SearchBar";

// Navigation links
const navListItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Blog",
    path: "/blog",
  },
  {
    label: "Categories",
    path: "/categories",
  },
  {
    label: "About",
    path: "/about",
  },
];

// Profile menu items
const profileMenuItems = [
  {
    label: "My Profile",
    icon: UserCircleIcon,
    path: "/profile",
  },
  {
    label: "Edit Profile",
    icon: Cog6ToothIcon,
    path: "/settings",
  },
  {
    label: "Inbox",
    icon: InboxArrowDownIcon,
    path: "/inbox",
  },
  {
    label: "Sign Out",
    icon: PowerIcon,
    action: "logout",
  },
];

function NavList() {
  return (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {navListItems.map(({ label, path }, key) => (
        <Typography
          key={key}
          as="li"
          variant="small"
          color="blue-gray"
          className="p-1 font-normal"
        >
          <NavLink
            to={path}
            className={({ isActive }) =>
              `flex items-center hover:text-primary-500 transition-colors ${
                isActive ? "text-primary-500 font-medium" : ""
              }`
            }
          >
            {label}
          </NavLink>
        </Typography>
      ))}
    </ul>
  );
}

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleMenuItemClick = (action, path) => {
    if (action === "logout") {
      dispatch(logoutSuccess());
      toast.success("Logged out successfully");
      navigate("/");
    } else if (path) {
      navigate(path);
    }
    closeMenu();
  };

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Avatar
            variant="circular"
            size="sm"
            alt="User"
            className="border border-primary-500 p-0.5"
            src={currentUser?.image || "https://ui-avatars.com/api/?name=" + currentUser?.name}
          />
          <Typography variant="small" className="hidden lg:inline-block">
            {currentUser?.name || "User"}
          </Typography>
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {profileMenuItems.map(({ label, icon: Icon, path, action }, key) => {
          return (
            <MenuItem
              key={key}
              onClick={() => handleMenuItemClick(action, path)}
              className={`flex items-center gap-2 rounded ${
                action === "logout" ? "hover:bg-red-500/10 focus:bg-red-500/10" : ""
              }`}
            >
              <Icon
                className={`h-4 w-4 ${action === "logout" ? "text-red-500" : ""}`}
                strokeWidth={2}
              />
              <Typography
                as="span"
                variant="small"
                className="font-normal"
                color={action === "logout" ? "red" : "inherit"}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

export default function MainNavbar() {
  const [openNav, setOpenNav] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { currentUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  return (
    <Navbar className="mx-auto max-w-screen-xl py-2 px-4 lg:px-8 lg:py-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
        <Typography
          as={NavLink}
          to="/"
          className="mr-4 cursor-pointer py-1.5 font-bold"
        >
          Muhammed Tarik Ucar
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <div className="flex items-center gap-4">
          <IconButton
            variant="text"
            color="blue-gray"
            className="lg:hidden"
            onClick={() => setShowSearchBar(!showSearchBar)}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </IconButton>
          <div className="hidden lg:block">
            <SearchBar />
          </div>
          {currentUser ? (
            <ProfileMenu />
          ) : (
            <Button
              variant="gradient"
              size="sm"
              className="hidden lg:inline-block"
              onClick={() => navigate("/login")}
            >
              <span>Sign In</span>
            </Button>
          )}
          <IconButton
            variant="text"
            color="blue-gray"
            className="lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>
        </div>
      </div>
      {showSearchBar && (
        <div className="lg:hidden mt-2 px-4">
          <SearchBar />
        </div>
      )}
      <MobileNav open={openNav}>
        <div className="container mx-auto">
          <NavList />
          {!currentUser && (
            <div className="flex items-center gap-x-1">
              <Button
                fullWidth
                variant="text"
                size="sm"
                className=""
                onClick={() => {
                  navigate("/login");
                  setOpenNav(false);
                }}
              >
                <span>Sign In</span>
              </Button>
              <Button
                fullWidth
                variant="gradient"
                size="sm"
                className=""
                onClick={() => {
                  navigate("/register");
                  setOpenNav(false);
                }}
              >
                <span>Sign Up</span>
              </Button>
            </div>
          )}
        </div>
      </MobileNav>
    </Navbar>
  );
}
