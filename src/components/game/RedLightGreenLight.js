import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Doll3D from './Doll3D';
import RGLightBgrd from '../../assets/images/NewBackground.png';
import './TrafficLight.css';
import { useGLTF } from '@react-three/drei';

export default function RedLightGreenLight() {
  const [light, setLight] = useState('green');
  const [position, setPosition] = useState(90);
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
      useGLTF.preload('../../assets/models/squid_game_doll.glb');

      const duration = 1500;
      const interval = 30;
      const steps = duration / interval;
      const increment = 100 / steps;

      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = Math.min(prev + increment, 100);
          if (next >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => setIsLoading(false), 500);
          }
          return next;
        });
      }, interval);

      return () => clearInterval(progressInterval);
    }
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(5);
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
      setLight(prev => prev === 'green' ? 'red' : 'green');
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

  const handleMoveForward = () => {
    if (!gameStarted || timeLeft === 0) return;
    if (light === 'green') {
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
    setLight('green');
    startGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="w-96 text-center">
          <img
            src={require('../../assets/images/Logo.webp')}
            alt="Squid Game Logo"
            className="w-72 md:w-[400px] mx-auto mb-16 mt-[-100px] drop-shadow-lg animate-float"
          />
          <h2 className="text-pink-600 text-3xl font-bold mb-6">Red Light Green Light</h2>
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
          <div className={`light red ${light === 'red' ? 'active' : ''}`}></div>
          <div className={`light green ${light === 'green' ? 'active' : ''}`}></div>
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
        className="relative w-full h-screen bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${RGLightBgrd})` }}
      >
        {/* Red/Green Light Doll */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
          {/* // 3D Canvas */}
          <div className="w-full h-[500px]">
            <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
              <ambientLight />
              <directionalLight intensity={1} position={[2, 5, 2]} />
              <Doll3D isGreenLight={light === 'red'} />
            </Canvas>
          </div>
          {/* <img
            src={light === 'green' ? dollFront : dollBack}
            className="transition-transform duration-700 w-40"
            style={{ transform: `rotateY(${light === 'green' ? 0 : 180}deg)` }}
          />
          <p className="mt-2 text-xl font-bold text-gray-800 capitalize">{light} Light</p> */}
        </div>

        {/* Track with grass/ground style */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-[95%] h-16 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] bg-green-700 rounded-xl border-4 border-green-800 shadow-inner">
          {/* Player Avatar */}
          <div
            className="absolute -top-8 w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-md transition-all duration-300"
            style={{ left: `calc(${position}% - 1.5rem)` }}
          >
            P
          </div>

          {/* Finish line ribbon */}
          <div className="absolute top-0 left-full -translate-x-full w-2 h-full bg-red-500 rounded-md shadow-md"></div>
        </div>

        {/* Move Forward Button */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleMoveForward}
            disabled={isEliminated || position >= 100}
            className={`px-6 py-3 rounded-lg font-bold text-white text-lg bg-gray-600 hover:bg-gray-800
              } ${isEliminated || position >= 100 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              } transition`}
          >
            Move Forward
          </button>
        </div>
      </div>

      {/* Game Over Message - Time's Up */}
      {timeLeft === 0 && isTimedOut && position < 100 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold text-red-600 font-bold">⏰ Time's Up!</p>
            <p className="text-gray-600 font-bold">You ran out of time!</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-bold"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
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
            <p className="text-lg font-semibold text-red-600">🎉 You Win! 🎉</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              >
                Restart
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
        // <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white bg-opacity-90 rounded-lg p-6 text-center space-y-4">
        //   <p className="text-3xl text-green-600 font-bold">🎉 You Win! 🎉</p>
        //   <div className="flex gap-4 justify-center">
        //     <button
        //       onClick={handleRestart}
        //       className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-bold text-white shadow"
        //     >
        //       Restart Game
        //     </button>
        //     <button
        //       onClick={() => navigate('/home')}
        //       className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white shadow"
        //     >
        //       Back to Home
        //     </button>
        //   </div>
        // </div>
      )}


      {/* Elimination Popup */}
      {isEliminated && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold text-red-600">❌ You're Eliminated!</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              >
                Restart
              </button>
              <button
                onClick={() => navigate('/')}
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
            <p className="text-lg font-semibold">Are you sure you want to quit?</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => navigate('/')}
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
