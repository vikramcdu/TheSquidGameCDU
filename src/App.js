import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RedLightGreenLight from './components/game/LightGameSinglePlayer';
import MultiplayerLobby from './components/game/MultiplayerLobby';
import MultiplayerRedLightGreenLight from './components/game/LightGameMultiPlayer';
import LoadingOverlay from './components/LoadingOverlay';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/TheSquidGameCDU" element={<HomePage />} />
        <Route path="/SinglePlayerRedLightGreenLight" element={<RedLightGreenLight />} />
        <Route path="/MultiplayerLobby" element={<MultiplayerLobby />} />
        <Route path="/game/:roomCode" element={<MultiplayerRedLightGreenLight />} />
        <Route path="/LoadingOverlay" element={<LoadingOverlay />} />
      </Routes>
    </Router>
  );
}
