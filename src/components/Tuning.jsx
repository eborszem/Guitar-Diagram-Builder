import { useEffect, useState } from 'react'
import '../elements/Tuning.css';
import { toSvg } from 'html-to-image';
import { tuning, tuningsMidi } from "./Tunings.jsx"

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

export const Tuning = ({ strings, setStrings, showSharps, formatNote }) => {
    const [tuning, setTuning] = useState('standard');
    const [editingIndex, setEditingIndex] = useState(null);
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

    const finishChangeTuning = (updatedNoteAndOctave, index) => {
        const noteMidiValue = convertNoteAndOctaveToMidi(updatedNoteAndOctave);
        if (noteMidiValue === -1) {
            setEditingIndex(null); // reset index
            return; // return with no changes
        }
        // const newTuning = [...strings];
        // newTuning[index] = updatedNote;
        // setStrings(newTuning);
        setStrings(prev => 
            prev.map(str => str.id === editingIndex ? {...str, midi: noteMidiValue} : str)
        );
        setEditingIndex(null); // reset index
    };

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
        const match = userInputNote.match(/^([A-G][#b]?)(\d+)$/);
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
        // console.log("event val ===" + e.target.value);
        const tuning = e.target.value;
        setTuning(tuning); // update dropdown
        if (tuning !== 'custom') {
            setStrings(presetTunings[tuning]); // update the fretboard tuning
            // console.log("dropdown tuning strings:" + strings);
        }
    };

    // export the fretboard as svg upon request
    const downloadSVG = () => {
        const fretboardNode = document.getElementById('fretboard-interface');
        toSvg(fretboardNode, {
            filter: (node) => {
                // removes the arrow buttons on both sides of the fretboard
                return !(
                    node.classList?.contains('modify-number-frets')
                );
            }
        })
        .then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'fretboard.svg';
            link.href = dataUrl;
            link.click();
        })
        .catch(err => {
            console.error('Failed to save fretboard as SVG:', err);
        }); 
    };

    // midi note to letter note conversion, returns string 
    const getNoteAndOctaveFromMidiValue = (midiNoteValue) => {
        const noteMap = showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        let note = noteMap[midiNoteValue % 12];
        const octave = Math.floor(midiNoteValue / 12) - 1;
        return note + octave;
    };

    useEffect(() => {
        // update letter by letter
        let stringObj = strings.find((str) => str.id === editingIndex);
        if (stringObj) {
            setUpdatedNote(getNoteAndOctaveFromMidiValue(stringObj.midi));
        }
        //strings[editingIndex]
    }, [editingIndex]);

    return (
        <>
            <div className="tuning-editor">
                <div className="tune-wrapper">
                    <p><b>Set Tuning</b>:</p>
                    <div className="tune-input">
                        {strings.map((stringObj) => (
                            <div key={stringObj.id}>
                                {editingIndex === stringObj.id ? (
                                    <input
                                        value={updatedNote}
                                        onChange={(e) => updateTuningInputText(e)}
                                        onBlur={() => setEditingIndex(null)} // or maybe onBlur={() => finishChangeTuning(updatedNote, i)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                finishChangeTuning(updatedNote, stringObj.id);
                                            }
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    <button
                                        className='retune-note-btn'
                                        onClick={() => setEditingIndex(stringObj.id)}>
                                        {formatNote(stringObj.midi)}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="tune-dropdown-wrapper">
                    <p><b>Current Tuning</b>:</p>
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
            </div>
            <div className="svg-and-reset-tune">
                    <div className="saving">
                        <button onClick={downloadSVG}>Download SVG</button>
                    </div>
                    <div className="reset-tuning-wrapper">
                        {tuning !== 'standard' && (
                            <button className="reset-tuning" onClick={resetTuning}>
                                Reset Tuning
                            </button>
                        )}
                    </div>
            </div>
        </>
    );
}