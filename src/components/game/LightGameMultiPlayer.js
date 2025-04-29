// RedLightGreenLightMultiPlayer.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import Doll3D from "./Doll3D";
import RGLightBgrd from "../../assets/images/NewBackground.png";
import socket from "../../socket";
import "./TrafficLight.css";
import { useGLTF } from "@react-three/drei";

export default function RedLightGreenLightMultiPlayer() {
  const [light, setLight] = useState("green");
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, username } = useLocation().state;
  const [showConfirm, setShowConfirm] = useState(false);

  const gameInterval = useRef(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    if (!roomCode || !username) {
      navigate("/multiplayer"); // fallback if no data
      return;
    }

    socket.emit("reconnect_player", { roomCode, username });
  }, [roomCode, username]);

  useEffect(() => {
    const img = new Image();
    img.src = RGLightBgrd;

    img.onload = () => {
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

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          setIsTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startLightInterval = () => {
    const toggleLight = () => {
      setLight((prev) => (prev === "green" ? "red" : "green"));
      const nextDelay = Math.random() * (2500 - 500) + 500;
      gameInterval.current = setTimeout(toggleLight, nextDelay);
    };

    toggleLight();
  };

  useEffect(() => {
    if (!isLoading) {
      socket.emit('player_ready', { roomCode, username });
    }
  }, [isLoading]);

  useEffect(() => {
    socket.on('start_game_now', () => {
      setGameStarted(true);
      startTimer();
      startLightInterval();
    });
  
    return () => {
      socket.off('start_game_now');
    };
  }, []);
  

  useEffect(() => {
    socket.on("position_update", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("game_winner", (winnerUsername) => {
      alert(`${winnerUsername} wins!`);
      navigate("/");
    });

    return () => {
      socket.off("position_update");
      socket.off("game_winner");
      clearTimeout(gameInterval.current);
      clearInterval(timerInterval.current);
    };
  }, []);

  const handleMoveForward = () => {
    if (!gameStarted || timeLeft === 0) return;
    if (light === "green") {
      socket.emit("update_position", { roomCode, positionIncrement: 10 });
    } else {
      socket.emit("player_eliminated", roomCode);
    }
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
        {/* Doll */}
        <div className="flex-1 relative">
          <div className="absolute inset-x-0 top-[10%] flex justify-center items-start">
            <div className="w-full max-w-[400px] md:max-w-[500px] h-[200px] md:h-[300px]">
              <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
                <ambientLight />
                <directionalLight intensity={1} position={[2, 5, 2]} />
                <Doll3D isGreenLight={light === "red"} />
              </Canvas>
            </div>
          </div>
        </div>

        {/* Track */}
        <div className="h-[200px] md:h-[250px] relative mb-4">
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[95%] h-32 md:h-80 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] bg-green-700 rounded-xl border-4 border-green-800 shadow-inner">
            <div className="absolute left-0 top-0 h-full w-3 bg-black flex items-center justify-center">
              <span className="text-xs text-white font-bold rotate-[-90deg]">
                START
              </span>
            </div>
            <div className="absolute right-0 top-0 h-full w-3 bg-red-600 flex items-center justify-center">
              <span className="text-xs text-white font-bold rotate-[-90deg]">
                FINISH
              </span>
            </div>
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full w-1 bg-white opacity-30"
                style={{ left: `${(i + 1) * 10}%` }}
              />
            ))}

            {/* Players */}
            {/* {players.map((player, idx) => (
              <div
                key={idx}
                className="absolute -top-10 w-20 h-12 md:w-32 md:h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300"
                style={{
                  left: `calc(${player.position}% - 2rem)`,
                  backgroundColor: player.color || "#3498db",
                  opacity: player.eliminated ? 0.5 : 1,
                  borderColor: player.eliminated ? "red" : "white",
                }}
              >
                <span className="text-xs md:text-sm font-bold text-white">{player.username}</span>
              </div>
            ))} */}
            {players.map((player, idx) => {
              const playerSpacing = 70; // Adjust vertical spacing between players (pixels)
              const startingTop = -40; // Start position slightly above track
              const topOffset = startingTop + idx * playerSpacing;

              return (
                <div
                  key={idx}
                  className="absolute w-20 h-12 md:w-32 md:h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300"
                  style={{
                    top: `${topOffset}px`, // 👈 Dynamic top position
                    left: `calc(${player.position}% - 2rem)`,
                    backgroundColor: player.color || "#3498db",
                    opacity: player.eliminated ? 0.5 : 1,
                    borderColor: player.eliminated ? "red" : "white",
                  }}
                >
                  <span className="text-xs md:text-sm font-bold text-white">
                    {player.username}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Move Button */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleMoveForward}
              className="px-6 py-3 rounded-lg font-bold text-white text-lg bg-gray-600 hover:bg-gray-800 hover:scale-105 transition"
            >
              Move Forward
            </button>
          </div>
        </div>
      </div>
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
