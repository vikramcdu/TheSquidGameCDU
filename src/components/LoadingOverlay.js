import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoadingOverlay = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const duration = 1500;
  const interval = 500;
  const steps = duration / interval;
  const increment = 100 / steps;

  const progressInterval = setInterval(() => {
    setLoadingProgress((prev) => {
      const next = Math.min(prev + increment, 100);
      if (next >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => setIsLoading(false), 500);
      }
      return next;
    });
  }, interval);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="w-96 text-center">
          <img
            src={require("../assets/images/Logo.webp")}
            alt="Squid Game Logo"
            className="w-72 md:w-[400px] mx-auto mb-16 mt-[-100px] drop-shadow-lg animate-float"
          />
          <h2 className="text-pink-600 text-3xl font-bold mb-6">
            Red Light Green Light
          </h2>
          <div className="mb-4">
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-600 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
          <p className="text-white text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    );
  } 
  else navigate("/MultiplayerLobby");
};

export default LoadingOverlay;
