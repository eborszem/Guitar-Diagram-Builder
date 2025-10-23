import { useState } from "react";
import "./../elements/Scale.css";

export const Scale = ({
    showSharps,
    generateScale,
    root,
    setRoot
}) => {
    const notes = showSharps ? [
        "C", "C#", "D", "D#", "E", "F",
        "F#", "G", "G#", "A", "A#", "B"
    ] : [
        "C", "Db", "D", "Eb", "E", "F",
        "Gb", "G", "Ab", "A", "Bb", "B"
    ];
    const modes = [
        "Major (Ionian)", "Dorian", "Phrygian", "Lydian",
        "Mixolydian", "Minor (Aeolian)", "Locrian"
    ];
    const [mode, setMode] = useState("Major (Ionian)");

    return (
        <div className="scale-interface">
            <p className="scale-text">Scale Generator:</p>
            <div className="scale-dropdown-wrapper">
                <p>Root</p>
                <select
                    className="scale-dropdown"
                    value={root}
                    onChange={(e) => setRoot(e.target.value)}
                >
                    {notes.map((note) => 
                        <option key={note} value={note}>{note}</option>
                    )}
                </select>

                <p>Mode</p>
                <select
                    className="scale-dropdown"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                >
                    {modes.map((mode) => 
                        <option key={mode} value={mode}>{mode}</option>
                    )}
                </select>

                <div className="generate-scale">
                    <button onClick={() => generateScale(mode)}>
                        Generate
                    </button>
                </div>
            </div>

        </div>
        
    );
}