import { useState } from "react";
import "./../elements/Arpeggio.css";

export const Arpeggio = ({
    showSharps,
    setNoteToColor,
    color,
    root, setRoot,
    strings
}) => {
    const [arpeggio, setArpeggio] = useState(["C"]);
    const noteToValueMap = {
        "C": 0,
        "C#": 1, "Db": 1,
        "D": 2,
        "D#": 3, "Eb": 3,
        "E": 4,
        "F": 5,
        "F#": 6, "Gb": 6,
        "G": 7,
        "G#": 8, "Ab": 8,
        "A": 9,
        "A#": 10, "Bb": 10,
        "B": 11
    };

    const notes = showSharps ? [
        "C", "C#", "D", "D#", "E", "F",
        "F#", "G", "G#", "A", "A#", "B"
    ] : [
        "C", "Db", "D", "Eb", "E", "F",
        "Gb", "G", "Ab", "A", "Bb", "B"
    ];

    const lightenHex = (hex, amount = 0.5) => {
        let clean = hex.replace("#", "");

        if (clean.length === 3) {
            clean = clean.split("").map(c => c + c).join("");
        }

        let num = parseInt(clean, 16);

        let r = (num >> 16) & 255;
        let g = (num >> 8) & 255;
        let b = num & 255;

        r = Math.min(255, r + (255 - r) * amount);
        g = Math.min(255, g + (255 - g) * amount);
        b = Math.min(255, b + (255 - b) * amount);

        return `rgb(${r}, ${g}, ${b})`;
    };

    const noteToMidi = (note) => {
        const noteMap = showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            console.log("noteToMidi: root=", root);
        for (let i = 0; i < noteMap.length; i++) {
            console.log("noteToMidi: checking ", noteMap[i], " against ", note);
            if (noteMap[i] === note) {
                console.log("noteToMidi: found match at index ", i);
                return i;
            }
        }
        return -1;
    }

    const scales = {
        "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
        "Dorian": [0, 2, 3, 5, 7, 9, 10],
        "Phrygian": [0, 1, 3, 5, 7, 8, 10],
        "Lydian": [0, 2, 4, 6, 7, 9, 11],
        "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "Natural Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
        "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
        "Melodic Minor Ascending": [0, 2, 3, 5, 7, 9, 11],
        "Locrian": [0, 1, 3, 5, 6, 8, 10],
        "Pentatonic Major": [0, 2, 4, 7, 9],
        "Pentatonic Minor": [0, 3, 5, 7, 10],
    }

    const generateArpeggio = () => {
        if (color === "none") return;
        setNoteToColor({});
        let tmp = {}; // temporary noteToColor mapping
        for (let stringIdx = 0; stringIdx < strings.length; stringIdx++) {
            for (let midi = 0; midi <= 108; midi++) {
                if (midi % 12 === noteToMidi(root)) {
                    tmp[midi + "-"  + strings[stringIdx].id] = color;
                } else if (arpeggio.includes(midi % 12)) {
                    tmp[midi + "-"  + strings[stringIdx].id] = lightenHex(color, 0.6);
                }
            }
        }
        setNoteToColor(tmp);
    };

    const isNoteInArpeggio = (note) => {
        for (const a of arpeggio) {
            if (noteToValueMap[note] === a) {
                return true;
            }
        }
        return false;

    }

    return (
        <div className="scale-interface">
            <p className="scale-text">arpeggio generator</p>
            <div className="scale-dropdown-wrapper">
                <div className="label-and-dropdown">
                    <p>Root</p>
                    <select
                        className="scale-dropdown"
                        value={root}
                        onChange={(e) => {setRoot(e.target.value); 
                            setArpeggio([e.target.value]);
                        }}
                    >
                        {notes.map((note) => 
                            <option key={note} value={note}>{note}</option>
                        )}
                    </select>
                </div>

                <div className="label-and-dropdown">
                    <p>Notes</p>
                    <div className="notes-in-arpeggio">
                        {notes.map((note) => (
                            <label key={note}>
                                {note}
                                <input
                                    key={note}
                                    value={note}
                                    type="checkbox"
                                    checked={note === root || isNoteInArpeggio(note)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setArpeggio(prev => [...prev, noteToValueMap[note]]);
                                        } else {
                                            setArpeggio(prev => prev.filter(n => n !== noteToValueMap[note]));
                                        }
                                    }}
                                    disabled={note === root}
                                />
                            </label>
                            
                        ))}
                    </div>
                </div>
                
                <div className="label-and-dropdown">
                    <p style={{ visibility: "hidden" }}>.</p>
                    <div className="generate-scale">
                        <button onClick={() => generateArpeggio(arpeggio)}>
                            Generate
                        </button>
                    </div>
                </div>
            </div>

        </div>
        
    );
}