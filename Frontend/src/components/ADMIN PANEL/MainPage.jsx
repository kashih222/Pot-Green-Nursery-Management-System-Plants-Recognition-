import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import MainPagesBoxes from "./pages/MainPagesBoxes";
import ProductList from "./pages/PlantsList/PlantsList";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { IoAddOutline } from "react-icons/io5";
import AnalyticsPage from "./pages/Analytics Page/AnalyticsPage";

const MainPage = () => {
  const { currentUser } = useAuth();
  const [greeting, setGreeting] = useState("Good Day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, []);

  return (
    <div className="px-2.5 mt-2.5 space-y-6">
      {/* Greeting Section */}
      <div className="p-5 bg-green-950 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 text-white">
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold">
            {greeting}, <br />
            {currentUser?.name || "Muhammad Kashaf"}
          </h3>
          <p className="text-yellow-500 text-sm mt-2">
            Here's what's happening in your store
          </p>
          <div className="mt-4">
            <Link to="/dashboard/product/product-upload">
              <Button
                variant="contained"
                className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600"
              >
                <IoAddOutline className="mr-2" /> Add Plant
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/plant-store-1818107-1539674.png"
            alt="Store Overview"
            className="max-w-[200px]"
          />
        </div>
      </div>

      <div>
        <MainPagesBoxes />
      </div>

      <div>
        <AnalyticsPage />
      </div>
    </div>
  );
};

export default MainPage;
