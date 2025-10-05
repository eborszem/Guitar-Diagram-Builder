import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import Interface from './Interface';
import '../elements/App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Interface />} />
                </Routes>
                <Analytics />
            </div>
        </Router>
    );
}

export default App;