import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RedLightGreenLight from './components/game/RedLightGreenLight';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<RedLightGreenLight />} />
      </Routes>
    </Router>
  );
}
