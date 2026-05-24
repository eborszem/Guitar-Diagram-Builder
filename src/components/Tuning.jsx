import { useEffect, useState } from 'react'
import '../elements/Tuning.css';
import { tuning, tuningsMidi } from "./Tunings.jsx"
import { Scale } from './Scale.jsx';
import { IoRefresh } from "react-icons/io5";

const presetTunings = {
    'standard': tuning['standard'],
    'half-step-down': tuning['half-step-down'],
    'full-step-down': tuning['full-step-down'],
    'drop-d': tuning['drop-d'],
    'drop-c': tuning['drop-c'],
    'open-d': tuning['open-d'],
    'open-c': tuning['open-c'],
    'open-g': tuning['open-g'],
    'dadgad': tuning['dadgad'],
    'double-drop-d': tuning['double-drop-d'],
    'all fourths': tuning['all fourths'],
    'bass standard': tuning['bass standard'],
    'custom': tuning['custom'] // custom is not a preset, and only appears in the dropdown when the user enters a custom tuning
};

export const Tuning = ({
    noteToColor,
    setNoteToColor,
    strings, 
    setStrings,
    showSharps,
    formatNote,
    root,
    setRoot
}) => {
    const [tuning, setTuning] = useState('standard');
    const [retuningStringId, setRetuningStringId] = useState(null);
    const [updatedNote, setUpdatedNote] = useState('');
    
    // user can change the tuning of the fretboard by clicking on the note boxes below the fretboard and editing them
    const updateTuningInputText = (e) => {
        setUpdatedNote(e.target.value);
    };

    // helper function to check if two arrays are equal
    // used to check if the updated tuning by the user matches any preset options
    const arraysEqual = (a, b) => {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    };

    // check if updated tuning by user matches any preset options
    useEffect(() => {
        let found = false;
        let currentMidiArray = strings.map(s => s.midi);
        for (const [name, notes] of Object.entries(tuningsMidi)) {
            if (arraysEqual(notes, currentMidiArray)) {
                setTuning(name);
                found = true;
                break;
            }
        }
        if (!found) {
            setTuning("custom");
        }
    }, [strings, setTuning]);

    // letter note to midi note conversion
    const convertNoteAndOctaveToMidi = (userInputNote) => {
        const noteMap = {
            'C': 0,
            'C#': 1, 'DB': 1,
            'D': 2,
            'D#': 3, 'EB': 3,
            'E': 4,
            'F': 5,
            'F#': 6, 'GB': 6,
            'G': 7,
            'G#': 8, 'AB': 8,
            'A': 9,
            'A#': 10, 'BB': 10,
            'B': 11
        };
        const match = userInputNote.match(/^([A-G][#b]?)(\d+)$/i);
        const fail = "Invalid note format. Use Scientific Pitch Notation :)\nFormat: [note][octave]\nExamples: E2, A2, D3, G3, B3, E4, A#4, Bb2, etc.";
        if (!match) {
            alert(fail);
            return -1;
        }
        const note = match[1].toUpperCase();
        if (noteMap[note] === undefined) {
            alert(fail);
            return -1;
        }
        const octave = parseInt(match[2], 10) + 1;

        if ((octave > 9) ||
            ((octave <= 1) && !(['A','A#','BB'].includes(note))) || 
            ((octave === 9) && (note !== 'C'))) {
            alert("Valid octave range: [A0, C8]");
            return -1;
        }
        // console.log(`Unformatted note: ${note}, Octave: ${octave}`);
        return (octave * 12) + noteMap[note];
    };

    const finishChangeTuning = (updatedNoteAndOctave) => {
        const noteMidiValue = convertNoteAndOctaveToMidi(updatedNoteAndOctave);
        if (noteMidiValue === -1) {
            setRetuningStringId(null); // reset index
            return; // return with no changes
        }
        setStrings(prev => 
            prev.map(str => str.id === retuningStringId ? {...str, midi: noteMidiValue} : str)
        );
        setRetuningStringId(null); // reset index
    };

    // prefills retune input box with current note
    useEffect(() => {
        let stringObj = strings.find((str) => str.id === retuningStringId);
        if (!stringObj) return;
        const noteMap = showSharps
        ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        let note = noteMap[stringObj.midi % 12];
        const octave = Math.floor(stringObj.midi / 12) - 1;
        setUpdatedNote(note + octave);
    }, [retuningStringId]);

    // reset to default tuning
    const resetTuning = () => {
        setStrings([
            {id: 0, midi: 64}, // E4
            {id: 1, midi: 59}, // B3
            {id: 2, midi: 55}, // G3
            {id: 3, midi: 50}, // D3
            {id: 4, midi: 45}, // A2
            {id: 5, midi: 40}, // E2
        ]);
    }

    // for when the user selects a preset tuning from the dropdown
    const changeTuningViaDropdown = (e) => {
        const tuning = e.target.value;
        setTuning(tuning); // update dropdown
        if (tuning !== 'custom') {
            setStrings(presetTunings[tuning]); // update the fretboard tuning
        }
    };

    return (
        <div className="tuning-block">
            <div className="tuning-editor">
                <div className="tune-dropdown-wrapper">
                    <p className="tuning-text">Current Tuning</p>
                        <select
                            className="tuning-dropdown" 
                            value={tuning}
                            onChange={changeTuningViaDropdown}
                        >
                            {Object.entries(presetTunings).map(([tuningKey]) => {
                                if (tuningKey === 'custom' && tuning !== 'custom') {
                                    return null;
                                }
                                return (
                                    <option key={tuningKey} value={tuningKey}>{tuningKey}</option>
                                );
                            })}
                        </select>
                </div>
                
                <div className="tune-dropdown-wrapper">
                    <p className="tuning-text">Set Custom Tuning</p>
                    <div className="tune-input">
                        {strings.map((stringObj) => (
                            <div key={stringObj.id}>
                                {retuningStringId === stringObj.id ? (
                                    <input
                                        value={updatedNote}
                                        onChange={(e) => updateTuningInputText(e)}
                                        onBlur={() => setRetuningStringId(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                finishChangeTuning(updatedNote);
                                            }
                                        }}
                                        autoFocus
                                    >
                                        </input>
                                ) : (
                                    <button
                                        className='retune-note-btn'
                                        onClick={() => setRetuningStringId(stringObj.id)}
                                    >
                                        {formatNote(stringObj.midi, true)}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {tuning !== 'standard' && (
                <div className="tuning-editor">
                    <div className="toggle-btns">
                        <button className="toggle-btns" id="refresh" onClick={resetTuning}><IoRefresh /></button>
                    </div>
                </div>
            )}
        </div>
    );
}

// const presetTunings = {
//     'standard': tuning['standard'],
//     'half-step-down': tuning['half-step-down'],
//     'full-step-down': tuning['full-step-down'],
//     'drop-d': tuning['drop-d'],
//     'drop-c': tuning['drop-c'],
//     'open-d': tuning['open-d'],
//     'open-c': tuning['open-c'],
//     'open-g': tuning['open-g'],
//     'dadgad': tuning['dadgad'],
//     'double-drop-d': tuning['double-drop-d'],
//     'all fourths': tuning['all fourths'],
//     'bass standard': tuning['bass standard'],
//     'custom': tuning['custom'] // custom is not a preset, and only appears in the dropdown when the user enters a custom tuning
// };