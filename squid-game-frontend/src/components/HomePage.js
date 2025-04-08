import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import homepageBg from '../assets/images/homepage.webp';
import homepageBg2 from '../assets/images/SquidGamePeople.webp';


export default function HomePage() {
    const [mode, setMode] = useState(null);
    const navigate = useNavigate();

    const handleStartGame = () => {
        if (!mode) return alert('Please select a game mode first!');
        navigate('/game');
    };

    return (
        // Front page logo
        <div
            className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-center text-white relative"
            style={{ backgroundImage: `url(${homepageBg2})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>

            <div className="relative z-10 text-center">
                {/* <h1 className="text-6xl font-bold mb-8">The Squid Game</h1> */}
                <img
                    src={require('../assets/images/Logo.webp')}
                    alt="Squid Game Logo"
                    className="w-72 md:w-[600px] mb-8 drop-shadow-lg"
                />
                {/* Single Player and Multi player button */}
                <div className="mb-6 flex gap-4 justify-center">
                    <button
                        className={`px-20 py-6 rounded-lg font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-md ${mode === 'Single Player'
                                ? 'bg-pink-600 shadow-pink-400'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        onClick={() => setMode('Single Player')}
                    >
                        Single Player
                    </button>
                    <button
                        className={`px-20 py-6 rounded-lg font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-md ${mode === 'Multi Player'
                                ? 'bg-pink-600 shadow-pink-400'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        onClick={() => setMode('Multi Player')}
                    >
                        Multi Player
                    </button>
                </div>

                <button
                    className="mt-4 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-white text-lg transition-transform transform hover:scale-105 shadow-md shadow-red-400"
                    onClick={handleStartGame}
                >
                    Start Game
                </button>
            </div>

            <footer className="absolute bottom-0 w-full py-4 text-center text-white bg-black bg-opacity-50 z-10">
                <p>Created by: Syd-Grp18 | Members: Varun, Suresh, Vinay and Vikram</p>
            </footer>
        </div>
    );
}