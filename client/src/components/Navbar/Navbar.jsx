import React, { useState, useEffect } from "react";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Collapse,
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
import { useTranslation } from "react-i18next";
import SearchBar from "../SearchBar/SearchBar";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";





export default function MainNavbar() {
  const { t } = useTranslation();
  const [openNav, setOpenNav] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { currentUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  // Navigation links
  const navListItems = [
    {
      label: t("nav.home"),
      path: "/",
    },
    {
      label: t("nav.blog"),
      path: "/blog",
    },
    {
      label: t("nav.about"),
      path: "/about",
    },
  ];

  // Authenticated navigation links
  const authNavListItems = [
    ...navListItems,
  ];

  // Profile menu items
  const getProfileMenuItems = () => {
    const baseItems = [
      {
        label: t("nav.profile"),
        icon: UserCircleIcon,
        path: "/profile",
      },
      {
        label: t("nav.settings"),
        icon: Cog6ToothIcon,
        path: "/settings",
      }
    
    ];

    // Add admin dashboard for admin users
    if (currentUser?.role === 'admin') {
      baseItems.splice(2, 0, {
        label: t("nav.adminDashboard"),
        icon: Cog6ToothIcon,
        path: "/admin/dashboard",
      });
    }

    baseItems.push({
      label: t("nav.logout"),
      icon: PowerIcon,
      action: "logout",
    });

    return baseItems;
  };

  function NavList() {
    const linksToShow = currentUser ? authNavListItems : navListItems;

    return (
      <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
        {linksToShow.map(({ label, path }, key) => (
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
    const dispatch = useDispatch();

    const closeMenu = () => setIsMenuOpen(false);

    const handleMenuItemClick = (action, path) => {
      if (action === "logout") {
        dispatch(logoutSuccess());
        toast.success(t("auth.loginSuccess"));
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
              src={currentUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}`}
            />
            <Typography variant="small" className="hidden lg:inline-block">
              {currentUser?.name || "User"}
            </Typography>
          </Button>
        </MenuHandler>
        <MenuList className="p-1">
          {getProfileMenuItems().map(({ label, icon: Icon, path, action }, key) => {
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
          <LanguageSwitcher />
          {currentUser ? (
            <ProfileMenu />
          ) : (
            <Button
              variant="gradient"
              size="sm"
              className="hidden lg:inline-block"
              onClick={() => navigate("/login")}
            >
              <span>{t("nav.login")}</span>
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
      <Collapse open={openNav}>
        <div className="container mx-auto">
          <NavList />
          <div className="mb-4">
            <LanguageSwitcher />
          </div>
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
                <span>{t("nav.login")}</span>
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
                <span>{t("auth.register")}</span>
              </Button>
            </div>
          )}
        </div>
      </Collapse>
    </Navbar>
  );
}
