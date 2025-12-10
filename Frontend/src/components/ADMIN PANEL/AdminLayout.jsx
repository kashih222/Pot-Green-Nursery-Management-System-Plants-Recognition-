import  { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-green-900">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden pt-12">
        <Sidebar isOpen={isSidebarOpen} />
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out overflow-auto bg-green-900 ${
            isSidebarOpen ? 'ml-[25%] sm:ml-[20%] p-2.5' : 'ml-0 p-4'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;