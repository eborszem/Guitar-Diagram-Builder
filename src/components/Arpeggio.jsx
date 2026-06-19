import { useState } from "react";
import "./../elements/Arpeggio.css";

export const Arpeggio = ({
    fretboard,
    updateFretboard,
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

    const notes = fretboard.showSharps ? [
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
        const noteMap = fretboard.showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        for (let i = 0; i < noteMap.length; i++) {
            if (noteMap[i] === note) {
                return i;
            }
        }
        return -1;
    }

    const generateArpeggio = () => {
        if (color === "none") return;
        updateFretboard(fretboard.id, { noteToColor: {} });
        let tmp = {}; // temporary noteToColor mapping
        const strings = fretboard.strings;
        for (let stringIdx = 0; stringIdx < strings.length; stringIdx++) {
            for (let midi = 0; midi <= 108; midi++) {
                if (midi % 12 === noteToMidi(root)) {
                    tmp[midi + "-"  + strings[stringIdx].id] = color;
                } else if (arpeggio.includes(midi % 12)) {
                    tmp[midi + "-"  + strings[stringIdx].id] = lightenHex(color, 0.6);
                }
            }
        }
        updateFretboard(fretboard.id, { noteToColor: tmp });
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
                    <label htmlFor="root" className="scale-text">root</label>
                    <select
                        id="root"
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
                    <label htmlFor="notes" className="scale-text">notes in arpeggio</label>
                    <div className="notes-in-arpeggio">
                        {notes.map((note) => (
                            <label key={note} htmlFor={note}>
                                <span>{note}</span>
                                <input
                                    id={note}
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
                            generate
                        </button>
                    </div>
                </div>
            </div>

        </div>
        
    );
}