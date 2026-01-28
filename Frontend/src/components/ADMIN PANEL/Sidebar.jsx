import { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegImage, FaAngleDown, FaTools } from "react-icons/fa";
import { LuUsersRound } from "react-icons/lu";
import { TbBrandProducthunt } from "react-icons/tb";
import { MdCategory } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { BsBoxSeam } from "react-icons/bs";
import { BsCartPlus } from "react-icons/bs";
import { TbTrash } from "react-icons/tb";
import { BsX } from "react-icons/bs";
import { Collapse } from "react-collapse";
import { useAuth } from "../auth/AuthContext";
import logo from "../../assets/img/logo.png"

const Sidebar = ({ isOpen }) => {
  const [subMenuIndex, setSubMenuIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Active route check - make it more precise
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.includes(path);
  };

  // Handle submenu toggle
  const isOpenSubMenu = (index) => {
    setSubMenuIndex(subMenuIndex === index ? null : index);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Dynamic text size class based on sidebar state
  const textSizeClass = isOpen ? 'text-sm' : 'text-xs';

  // Dynamic padding class based on screen size and sidebar state
  const buttonPadding = isOpen
    ? '!px-4 sm:!px-4 !py-3'
    : '!px-2 sm:!px-4 !py-2 sm:!py-3';

  // Dynamic submenu padding
  const submenuPadding = isOpen
    ? '!px-4 sm:!px-4 !py-2'
    : '!px-2 sm:!px-4 !py-1.5 sm:!py-2';

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-green-950/95 transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-green-900 ${isOpen ? 'w-[25%] sm:w-[20%] opacity-100 visible translate-x-0' : 'w-[25%] sm:w-[50%] opacity-100 visible -translate-x-full'
        }`}
    >
      <div className={`pt-16 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="logo flex items-center justify-center w-full py-8 border-b border-yellow-500/20 bg-green-950">
          <img
            src={logo}
            alt="Company Logo"
            className="w-[120px] h-auto object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>

        <nav className="p-2 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {/* Dashboard Link */}
            <li>
              <Link to="/dashboard">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/dashboard') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <LuLayoutDashboard className="text-lg" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            </li>
            <li>
              <Button
                className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/product') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}
                onClick={() => isOpenSubMenu(2)}
                aria-expanded={subMenuIndex === 2}
              >
                <TbBrandProducthunt className="text-lg" />
                <span>Products</span>
                <FaAngleDown className={`transition-all ml-auto ${subMenuIndex === 2 ? "rotate-180" : ""}`} />
              </Button>

              <Collapse isOpened={subMenuIndex === 2}>
                <ul className="ml-2 sm:ml-4 mt-1 sm:mt-2 space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/dashboard/product/product-list">
                      <Button className={`w-full !justify-start ${submenuPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/product-list') ? '!bg-yellow-500/20 !text-yellow-500' : '!text-white/75 hover:!bg-green-900/30'
                        }`}>
                        Product List
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard/product/product-upload">
                      <Button className={`w-full !justify-start ${submenuPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/product-upload') ? '!bg-yellow-500/20 !text-yellow-500' : '!text-white/75 hover:!bg-green-900/30'
                        }`}>
                        Product Upload
                      </Button>
                    </Link>
                  </li>
                </ul>
              </Collapse>
            </li>

            {/* Category Menu - Simplified */}
            <li>
              <Link to="/dashboard/category">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/category') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <MdCategory className="text-lg" />
                  <span>Plants Category</span>
                </Button>
              </Link>
            </li>



            {/* Users Link */}
            <li>
              <Link to="/dashboard/users">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/users') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <LuUsersRound className="text-lg" />
                  <span>Users</span>
                </Button>
              </Link>
            </li>

            {/* Orders Link */}
            <li>
              <Link to="/dashboard/orders">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/orders') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <BsBoxSeam className="text-lg" />
                  <span>Orders</span>
                </Button>
              </Link>
            </li>

            {/* Purchases Link */}
            <li>
              <Link to="/dashboard/purchases">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/purchases') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <BsCartPlus className="text-lg" />
                  <span>Purchases</span>
                </Button>
              </Link>
            </li>

            {/* Wasted Plants Link */}
            <li>
              <Link to="/dashboard/waste">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/waste') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <TbTrash className="text-lg" />
                  <span>Wasted Plants</span>
                </Button>
              </Link>
            </li>

            {/* Out of Stock Link */}
            <li>
              <Link to="/dashboard/out-of-stock">
                <Button
                  className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/out-of-stock') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                    }`}
                >
                  <BsX className="text-lg" /> {/* Cross icon */}
                  <span>Out of Stock</span>
                </Button>
              </Link>
            </li>

            {/* Service Requests Link */}
            <li>
              <Link to="/dashboard/service-requests">
                <Button className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg ${isActive('/service-requests') ? '!bg-yellow-500 !text-green-950' : '!text-white hover:!bg-green-900/50'
                  }`}>
                  <FaTools className="text-lg" />
                  <span>Service Requests</span>
                </Button>
              </Link>
            </li>

            {/* Products Menu */}

            {/* Logout Button */}
            <li>
              <Button
                onClick={handleLogout}
                className={`w-full !justify-start gap-1 sm:gap-2 ${buttonPadding} !${textSizeClass} !normal-case !rounded-lg !text-red-400 hover:!bg-red-500/10`}
                aria-label="Logout"
              >
                <BiLogOut className="text-lg" />
                <span>Logout</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
