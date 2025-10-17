import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import InterfaceManager from './InterfaceManager';
import '../elements/App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<InterfaceManager />} />
                </Routes>
                <Analytics />
                <SpeedInsights />
            </div>
        </Router>
    );
}

export default App;