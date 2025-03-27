import React, { useState, useEffect, useRef } from 'react';

export default function RedLightGreenLight() {
  const [light, setLight] = useState('green');
  const [position, setPosition] = useState(0);
  const gameInterval = useRef(null);

  useEffect(() => {
    gameInterval.current = setInterval(() => {
      setLight((prev) => (prev === 'green' ? 'red' : 'green'));
    }, 3000);

    return () => clearInterval(gameInterval.current);
  }, []);

  const handleMoveForward = () => {
    if (light === 'green') {
      setPosition((prev) => Math.min(prev + 10, 100)); // Move player forward, max 100%
    } else {
      alert("You're eliminated! You moved on Red Light!");
      setPosition(0); // Reset player position
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <div className="mb-8">
        <div
          className={`w-32 h-32 rounded-full ${
            light === 'green' ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <p className="mt-4 text-white font-bold text-3xl capitalize">
          {light} Light
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-4 bg-white rounded-lg overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-500"
          style={{ width: `${position}%` }}
        ></div>
      </div>

      <button
        onClick={handleMoveForward}
        className="mt-10 px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600"
      >
        Move Forward
      </button>

      {position >= 100 && (
        <p className="mt-4 text-3xl text-green-300 font-bold">
          🎉 You Win! 🎉
        </p>
      )}
    </div>
  );
}
