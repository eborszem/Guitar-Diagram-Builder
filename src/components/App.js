/* client/src/components/App.js */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import Fretboard from './Fretboard';
import '../elements/App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Fretboard />} />
                </Routes>
                <Analytics />
            </div>
        </Router>
    );
}

export default App;