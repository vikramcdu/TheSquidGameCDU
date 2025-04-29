import React, { useEffect, useState } from "react";
import socket from "../../socket"; // Ensure this file exports a connected socket instance
import LoadingOverlay from "../LoadingOverlay";
import { useNavigate } from "react-router-dom";

const MultiplayerLobby = () => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [roomMode, setRoomMode] = useState(""); // '', 'create', 'join'

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("player_joined", (players) => setPlayers(players));
    socket.on("game_started", () => {
      setLoading(false);
      navigate(`/game/${roomCode}`, { state: { roomCode, username } });
    });

    return () => {
      socket.off("player_joined");
      socket.off("game_started");
    };
  }, [roomCode]);

  {
    loading && <LoadingOverlay />;
  }

  const handleCreateRoom = () => {
    if (!username) return setError("Enter your name to create a room.");
    socket.emit("create_room", { username }, ({ success, roomCode }) => {
      if (success) {
        setRoomCode(roomCode);
        setJoinedRoom(true);
        setIsHost(true);
      }
    });
  };

  const handleJoinRoom = () => {
    if (!username || !roomCode) return setError("Enter name and room code.");
    socket.emit("join_room", { roomCode, username }, ({ success, message }) => {
      if (success) {
        setJoinedRoom(true);
      } else {
        setError(message || "Failed to join room.");
      }
    });
  };

  const handleStartGame = () => {
    socket.emit("start_game", roomCode);
  };

  // useEffect(() => {
    

  //   return () => {
  //     socket.off("player_joined");
  //     socket.off("game_started");
  //   };
  // }, [roomCode]);

  return (
    <div
      className="min-h-screen relative bg-cover bg-center text-white flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: `url(${require("../../assets/images/squid_lobby.webp")})`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      <div className="relative z-10 w-full max-w-md text-center flex flex-col items-center justify-center mt-[-40px]">
        <img
          src={require("../../assets/images/Logo.webp")}
          alt="Squid Game Logo"
          className="w-60 md:w-[320px] mb-4 drop-shadow-lg"
        />

        <div className="flex items-center justify-center gap-4 mb-6">
          {roomMode && (
            <button
              onClick={() => {
                setRoomMode("");
                // setUsername("");
                // setRoomCode(""); 
                // setError("");
              }}
              className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
            >
              ← Back
            </button>
          )}
          <h1 className="text-3xl font-bold">Multiplayer Lobby</h1>
          <div className="absolute top-4 left-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow"
            >
              Quit
            </button>
          </div>
        </div>

        {!roomMode && (
          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => setRoomMode("create")}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              Create Room
            </button>
            <button
              onClick={() => setRoomMode("join")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
            >
              Join Room
            </button>
          </div>
        )}
        {!joinedRoom ? (
          <>
            {roomMode === "create" && (
              <div className="space-y-4 w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white"
                />
                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
                >
                  Create Room
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            )}

            {roomMode === "join" && (
              <div className="space-y-4 w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white"
                />
                <input
                  type="text"
                  placeholder="Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white"
                />
                <button
                  onClick={handleJoinRoom}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
                >
                  Join Room
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-xl">
              Room Code: <span className="font-mono">{roomCode}</span>
            </p>
            <h2 className="text-lg font-bold">Players:</h2>
            <ul className="space-y-1">
              {players.map((p, idx) => (
                <li key={idx} className="text-green-300">
                  {p.username}
                </li>
              ))}
            </ul>
            {isHost && (
              <button
                onClick={handleStartGame}
                className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded font-bold"
              >
                Start Game
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLobby;
