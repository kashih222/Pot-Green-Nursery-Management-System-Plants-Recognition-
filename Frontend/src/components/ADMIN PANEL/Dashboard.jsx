import Header from "./Header";
import Sidebar from "./Sidebar";
import MainPage from "../ADMIN PANEL/MainPage"; // Ensure this path is correct
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title> Dashboard | Pot Green Nursery</title>
      </Helmet>
      <div className="main container relative">

        <Header />
        <div className="content-main flex">
          {/* Sidebar */}
          <div className="sidebar-wraper">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="content-right xl:ml-[280px] sm:ml-[160px] mt-6">
            <MainPage /> {/* MainPage should load here */}
          </div>
        </div>
      </div>
    </>

  );
};

export default Dashboard;
