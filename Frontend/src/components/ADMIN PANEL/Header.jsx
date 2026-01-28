import { useState } from 'react';
import Button from "@mui/material/Button";
import { RiMenu2Fill } from "react-icons/ri";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import { BsBell } from "react-icons/bs";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { CgProfile } from "react-icons/cg";
import { IoPersonAdd, IoSettingsOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation , Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { format } from 'date-fns';
import { FaTimes } from "react-icons/fa";

// Styled badge
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = ({ onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const { notifications, unreadCount, loading, error, fetchNotifications, markAsRead, removeNotification } = useNotifications();
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);

  // Check if we're in the admin dashboard
  const isAdminDashboard = location.pathname.startsWith('/dashboard');

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationMenuClick = async (event) => {
    setNotificationAnchorEl(event.currentTarget);
    // Refresh notifications when opening the menu
    await fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate("/");
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleRemoveNotification = async (notificationId, event) => {
    event.stopPropagation();
    await removeNotification(notificationId);
  };

  const handleNotificationClick = (notification) => {
    // If it's an order notification, navigate to the orders page
    if (notification.type === 'order') {
      navigate('/dashboard/orders');
      handleNotificationClose();
    }
    // Mark as read
    handleMarkAsRead(notification._id);
  };

  const name = currentUser?.name || "Guest User";
  const email = currentUser?.email || "guestemail@gmail.com";
  const profilePic = currentUser?.profilePic 
    ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${currentUser.profilePic}` 
    : "src/assets/img/KashafProfile.jpeg";

  return (
    <div className="fixed top-0 right-0 left-0 z-50">
      <header className="w-full h-12 border-b-2 border-yellow-500/30 bg-green-950 shadow-lg flex items-center">
        <div className="left-side w-[38%] sm:ml-[15%] flex items-center justify-start pl-4">
          <Button
            variant="text"
            className="!text-yellow-500 !w-10 !h-10 !min-w-10 !rounded-full hover:!bg-green-900"
            aria-label="Toggle sidebar"
            onClick={onMenuClick}
          >
            <RiMenu2Fill className="text-xl" />
          </Button>
        </div>

        <div className="right-side w-full pr-8 flex items-center justify-end gap-2">
          {/* Show notification bell only in admin dashboard */}
          {isAdminDashboard && currentUser?.role === 'admin' && (
            <>
              <Button
                variant="text"
                className="!text-yellow-500 !w-10 !h-10 !min-w-10 !rounded-full hover:!bg-green-900"
                aria-label="Notifications"
                onClick={handleNotificationMenuClick}
              >
                <StyledBadge badgeContent={unreadCount} color="warning">
                  <BsBell className="text-yellow-500 !w-6 !h-6" />
                </StyledBadge>
              </Button>

              <Menu
                anchorEl={notificationAnchorEl}
                open={notificationOpen}
                onClose={handleNotificationClose}
                MenuListProps={{ disablePadding: false }}
                disablePortal
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: '#022c22',
                      color: 'white',
                      maxHeight: 400,
                      width: 360,
                    }
                  },
                  root: {
                    // prevent aria-hidden on portal parent conflicting with focus
                    disableRestoreFocus: true,
                  }
                }}
              >
                <div className="p-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-yellow-500">Notifications</h3>
                    <button
                      onClick={fetchNotifications}
                      className="text-yellow-500 hover:text-yellow-400"
                    >
                      Refresh
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
                      <p className="text-gray-300 mt-2">Loading notifications...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-red-400">Error loading notifications</p>
                      <button
                        onClick={fetchNotifications}
                        className="text-yellow-500 hover:text-yellow-400 mt-2"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="text-gray-300 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-green-900 ${
                          !notification.read ? 'bg-green-900/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-yellow-500">{notification.title}</p>
                            <p className="text-sm text-gray-300">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleRemoveNotification(notification._id, e)}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Menu>
            </>
          )}

          <div className="relative">
            <div
              className="rounded-full w-8 h-8 overflow-hidden cursor-pointer border-2 border-yellow-500 bg-yellow-400 flex items-center justify-center"
              onClick={handleClick}
              aria-controls={open ? 'profile-menu' : undefined}
              aria-expanded={open}
              aria-haspopup="menu"
              id="profile-menu-button"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(e);
                }
              }}
            >
              {currentUser?.profilePic ? (
                <img
                  src={profilePic}
                  alt={name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-green-900 font-bold text-sm ${currentUser?.profilePic ? 'hidden' : ''}`}>
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          disablePortal
          keepMounted
          disableRestoreFocus
          MenuListProps={{
            'aria-labelledby': 'profile-menu-button',
            role: 'menu',
            disablePadding: false,
          }}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#022c22',
                color: 'white',
                '& .MuiDivider-root': {
                  borderColor: '#ca8a04'
                }
              }
            },
            root: {
              disableRestoreFocus: true,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose} className="!bg-green-950 hover:!bg-green-900">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-yellow-500 bg-yellow-400 flex items-center justify-center">
                  {currentUser?.profilePic ? (
                    <img
                      src={profilePic}
                      alt={name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-green-900 font-bold text-sm ${currentUser?.profilePic ? 'hidden' : ''}`}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="font-Jost">
                  <p className="font-bold text-yellow-500">{name}</p>
                  <p className="text-sm text-gray-300">{email}</p>
                </div>
              </div>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleClose}
              className="!text-gray-200 hover:!bg-green-900 !py-3"
            >
              <Link to={"/dashboard/profile"} className="flex items-center gap-2">
  <CgProfile className="mr-2 text-yellow-500" />
  My Account
</Link>
            </MenuItem>

           

            

            <Divider />

            <MenuItem
              onClick={handleLogout}
              className="!text-red-500 hover:!bg-red-900 !py-3"
            >
              <TbLogout2 className="mr-2" />
              Logout
            </MenuItem>
          </Menu>
        </div>
      </header>
    </div>
  );
};

export default Header;
