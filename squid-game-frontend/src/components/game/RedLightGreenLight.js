import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dollFront from '../../assets/images/DollFaceFront.png';
import dollBack from '../../assets/images/DollFaceBack.png';
import { Canvas } from '@react-three/fiber';
import Doll3D from './Doll3D';
import RGLightBgrd from '../../assets/images/NewBackground.png'

export default function RedLightGreenLight() {
  const [light, setLight] = useState('green');
  const [position, setPosition] = useState(0);
  const [facingFront, setFacingFront] = useState(true);
  const gameInterval = useRef(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);

  const startLightInterval = () => {
    if (gameInterval.current) clearInterval(gameInterval.current);
    gameInterval.current = setInterval(() => {
      setLight((prev) => {
        const newLight = prev === 'green' ? 'red' : 'green';
        setFacingFront(newLight === 'green');
        return newLight;
      });
    }, 3000);
  };

  useEffect(() => {
    startLightInterval();
    return () => clearInterval(gameInterval.current);
  }, []);

  const handleMoveForward = () => {
    if (light === 'green') {
      setPosition((prev) => Math.min(prev + 10, 100));
    } else {
      clearInterval(gameInterval.current);
      setIsEliminated(true);
    }
  };

  const handleRestart = () => {
    setPosition(0);
    setIsEliminated(false);
    setLight('green');
    setFacingFront(true);
    startLightInterval();
  };

  return (
    <>
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
              <directionalLight position={[2, 5, 2]} />
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
            className={`px-6 py-3 rounded-lg font-bold text-white text-lg ${light === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600'
              } ${isEliminated || position >= 100 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              } transition`}
          >
            Move Forward
          </button>
        </div>

        {/* Game Win Message */}
        {position >= 100 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white bg-opacity-90 rounded-lg p-6 text-center space-y-4">
            <p className="text-3xl text-green-600 font-bold">🎉 You Win! 🎉</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-bold text-white shadow"
              >
                Restart Game
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white shadow"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Elimination Popup */}
      {isEliminated && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold text-red-600">❌ You’re Eliminated!</p>
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



// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function RedLightGreenLight() {
//   const [light, setLight] = useState('green');
//   const [position, setPosition] = useState(0);
//   const gameInterval = useRef(null);
//   const navigate = useNavigate();
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [isEliminated, setIsEliminated] = useState(false);


//   useEffect(() => {
//     gameInterval.current = setInterval(() => {
//       setLight((prev) => (prev === 'green' ? 'red' : 'green'));
//     }, 3000);

//     return () => clearInterval(gameInterval.current);
//   }, []);

//   const handleMoveForward = () => {
//     if (light === 'green') {
//       setPosition((prev) => Math.min(prev + 10, 100));
//     } else {
//       setIsEliminated(true); // Show failure popup
//     }
//   };


//   return (
//     <>
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
//         <div className="mb-8">
//           <div
//             className={`w-32 h-32 rounded-full ${light === 'green' ? 'bg-green-500' : 'bg-red-500'
//               }`}
//           ></div>
//           <p className="mt-4 text-white font-bold text-3xl capitalize">
//             {light} Light
//           </p>
//         </div>

//         <div className="relative w-full max-w-4xl h-4 bg-white rounded-lg overflow-hidden">
//           <div
//             className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-500"
//             style={{ width: `${position}%` }}
//           ></div>
//         </div>

//         <button
//           onClick={handleMoveForward}
//           disabled={isEliminated}
//           className={`mt-10 px-6 py-2 rounded-lg font-bold text-white ${light === 'green' ? 'bg-green-500' : 'bg-red-500'
//             } ${isEliminated ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} transition`}
//         >
//           Move Forward
//         </button>

//         {position >= 100 && (
//           <div className="mt-6 flex flex-col items-center space-y-4">
//             <p className="text-3xl text-green-300 font-bold">🎉 You Win! 🎉</p>

//             <div className="flex gap-4">
//               <button
//                 onClick={() => setPosition(0)}
//                 className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-bold text-white shadow"
//               >
//                 Restart Game
//               </button>
//               <button
//                 onClick={() => navigate('/')}
//                 className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white shadow"
//               >
//                 Back to Home
//               </button>
//             </div>
//           </div>
//         )}

//       </div >
//       {isEliminated && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
//           <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
//             <p className="text-lg font-semibold text-red-600">❌ You’re Eliminated!</p>
//             <div className="flex justify-around mt-4">
//               <button
//                 onClick={() => {
//                   setPosition(0);
//                   setIsEliminated(false);
//                 }}
//                 className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
//               >
//                 Restart
//               </button>
//               <button
//                 onClick={() => navigate('/')}
//                 className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
//               >
//                 Quit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="absolute top-4 right-4 z-20">
//         <button
//           onClick={() => setShowConfirm(true)}
//           className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow"
//         >
//           Quit Game
//         </button>
//       </div>

//       {showConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
//           <div className="bg-white text-black rounded-lg p-6 w-[300px] shadow-xl text-center space-y-4">
//             <p className="text-lg font-semibold">Are you sure you want to quit?</p>
//             <div className="flex justify-around mt-4">
//               <button
//                 onClick={() => navigate('/')}
//                 className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={() => setShowConfirm(false)}
//                 className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}



//     </>
//   );
// }
