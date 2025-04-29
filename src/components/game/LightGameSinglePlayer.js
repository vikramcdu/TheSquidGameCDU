import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import Doll3D from "./Doll3D";
import RGLightBgrd from "../../assets/images/NewBackground.png";
import "./TrafficLight.css";
import { useGLTF } from "@react-three/drei";

export default function RedLightGreenLight() {
  const [light, setLight] = useState("green");
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const gameInterval = useRef(null);
  const timerInterval = useRef(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    // Load background image
    const img = new Image();
    img.src = RGLightBgrd;

    img.onload = () => {
      // Once background is ready, preload 3D model
      useGLTF.preload("../../assets/models/squid_game_doll.glb");

      const duration = 1500;
      const interval = 30;
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

      return () => clearInterval(progressInterval);
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(60);
    startLightInterval();
    startTimer();
  };

  const startTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          setIsTimedOut(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const startLightInterval = () => {
    if (gameInterval.current) clearTimeout(gameInterval.current);

    const toggleLight = () => {
      setLight((prev) => (prev === "green" ? "red" : "green"));
      const nextDelay = Math.random() * (2500 - 500) + 500;
      gameInterval.current = setTimeout(toggleLight, nextDelay);
    };

    toggleLight();
  };

  useEffect(() => {
    return () => {
      if (gameInterval.current) clearTimeout(gameInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      startGame();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isTimedOut) {
      clearTimeout(gameInterval.current);
      clearInterval(timerInterval.current);
    }
  }, [isTimedOut]);

  useEffect(() => {
    if (position >= 100) {
      clearTimeout(gameInterval.current);
      clearInterval(timerInterval.current);
    }
  }, [position]);

  const handleMoveForward = () => {
    if (!gameStarted || timeLeft === 0) return;
    if (light === "green") {
      setPosition((prev) => Math.min(prev + 10, 100));
    } else {
      clearTimeout(gameInterval.current);
      clearInterval(timerInterval.current);
      setIsEliminated(true);
    }
  };

  const handleRestart = () => {
    setPosition(0);
    setIsEliminated(false);
    setLight("green");
    startGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="w-96 text-center">
          <img
            src={require("../../assets/images/Logo.webp")}
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

  return (
    <>
      {/* Game Stats */}
      <div className="absolute top-4 left-4 z-20 flex gap-4 items-center">
        <div className="traffic-light">
          <div className={`light red ${light === "red" ? "active" : ""}`}></div>
          <div
            className={`light green ${light === "green" ? "active" : ""}`}
          ></div>
        </div>
        <div className="px-4 py-2 bg-gray-800 text-white rounded-lg font-bold">
          Time: {formatTime(timeLeft)}
        </div>
      </div>

      {/* Quit Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow"
        >
          Quit Game
        </button>
      </div>

      {/* Game Environment */}
      <div
        className="relative w-full h-screen bg-cover bg-center overflow-hidden flex flex-col justify-between"
        style={{ backgroundImage: `url(${RGLightBgrd})` }}
      >
        {/* Red/Green Light Doll */}
        <div className="flex-1 relative">
          <div className="absolute inset-x-0 top-[10%] flex justify-center items-start">
            <div className="w-full max-w-[400px] md:max-w-[500px] h-[200px] md:h-[300px] lg:h-[100]">
              <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
                <ambientLight />
                <directionalLight intensity={1} position={[2, 5, 2]} />
                <Doll3D isGreenLight={light === "red"} />
              </Canvas>
            </div>
          </div>
        </div>

        {/* Track Container */}
        <div className="h-[200px] md:h-[250px] relative mb-4">
          {/* Track with sand/dirt style */}
          <div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[98%] md:w-[95%] h-32 md:h-80 
      bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] 
      bg-green-700 rounded-xl border-4 border-green-800 shadow-inner"
          >
            {/* Rest of the track code remains the same */}
            {/* Track with sand/dirt style */}
            {/* <div className="absolute bottom-24 md:bottom-32 left-1/2 transform -translate-x-1/2 w-[98%] md:w-[95%] h-40 md:h-60 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] bg-green-700 rounded-xl border-4 border-green-800 shadow-inner"> */}
            {/* Start Line */}
            <div className="absolute left-0 top-0 h-full w-3 bg-black z-10 flex flex-col items-center justify-center">
              <span className="text-xs text-white font-bold rotate-[-90deg]">
                START
              </span>
            </div>
            {/* Finish Line */}
            <div className="absolute right-0 top-0 h-full w-3 bg-red-600 z-10 flex flex-col items-center justify-center">
              <span className="text-xs text-white font-bold rotate-[-90deg]">
                FINISH
              </span>
            </div>
            {/* Lane Markings */}
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full w-1 bg-white opacity-30"
                style={{ left: `${(i + 1) * 10}%` }}
              />
            ))}
            {/* Player Avatar */}
            <div
              className="absolute -top-10 w-20 h-12 md:w-32 md:h-16 rounded-full bg-pink-600 border-4 border-white flex items-center justify-center shadow-lg transition-all duration-300"
              style={{ left: `calc(${position}% - 2rem)` }}
            >
              <span className="text-lg md:text-xl font-extrabold text-white drop-shadow">
                Player
              </span>
              {/* Shadow */}
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-10 h-3 bg-black opacity-30 rounded-full blur-sm"></div>
            </div>
            {/* </div> */}
          </div>

          {/* Move Forward Button - Moved inside track container */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleMoveForward}
              disabled={isEliminated || position >= 100}
              className={`px-6 py-3 rounded-lg font-bold text-white text-lg bg-gray-600 hover:bg-gray-800
          } ${
            isEliminated || position >= 100
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105"
          } transition`}
            >
              Move Forward
            </button>
          </div>
        </div>
      </div>

      {/* Game Over Message - Time's Up */}
      {timeLeft === 0 && isTimedOut && position < 100 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold text-red-600 font-bold">
              ⏰ Time's Up!
            </p>
            <p className="text-gray-600 font-bold">You ran out of time!</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-bold"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Win Message */}
      {position >= 100 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold text-red-600 font-bold">
              🎉 You Win! 🎉
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-bold"
              >
                Restart
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elimination Popup */}
      {isEliminated && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold text-red-600">
              ❌ You're Eliminated!
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              >
                Restart
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold">
              Are you sure you want to quit?
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
