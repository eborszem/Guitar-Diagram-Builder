import { React, useEffect, useRef, useState } from 'react'
import '../elements/Fretboard.css';
import { IoArrowForwardCircle, IoArrowBackCircle, IoVolumeMedium, IoVolumeOff } from "react-icons/io5";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { toSvg } from 'html-to-image';
import Soundfont from 'soundfont-player';
import { FaHandPointLeft, FaHandPointRight } from "react-icons/fa";
import { LuRefreshCcw, LuRefreshCw } from "react-icons/lu";

// midi notes correspond to notes
// e.g., 64 = e4, 59 = B3, 55 = G3, 50 = D3, 45 = A2, 40 = E2, etc.
const presetTunings = {
    'standard': [64, 59, 55, 50, 45, 40],
    'drop-d': [64, 59, 55, 50, 45, 38],
    'half-step-down': [63, 58, 54, 49, 44, 39],
    'full-step-down': [62, 57, 53, 48, 43, 38],
    'drop-c': [62, 57, 53, 48, 43, 36],
    'open-d': [62, 57, 54, 50, 45, 38],
    'open-g': [62, 59, 55, 50, 43, 38],
    'open-c': [64, 60, 55, 48, 43, 36],
    'dadgad': [62, 57, 55, 50, 45, 38],
    'double-drop-d': [62, 59, 55, 50, 45, 38],
    'custom': [] // custom is not a preset, and only appears in the dropdown when the user enters a custom tuning
};

function Fretboard() {
    // toggles
    const [hideNotes, setHideNotes] = useState(false); // hide notes that don't have a color set
    const [playAudio, setPlayAudio] = useState(true); // toggle notes playing audio on click
    const [showSharps, setShowSharps] = useState(true); // sharps or flats
    const [lefty, setLefty] = useState(false); // left hand or right hand
    const [flipStrings, setFlipStrings] = useState(false); // flip the strings 180 degrees

    // coloring for diagrams
    const [colorBank] = useState(['#ff5c5c', '#ffbf5c', '#fff85c', '#9cff5c', '#5cf0ff', '#5c67ff', '#b25cff', '#ff5cfd']);
    const [colorBankLight] = useState(['#ffbebe','#ffe5be','#fffcbe','#d7ffbe','#bef9ff', '#c1beff', '#e0beff','#ffbefe']);
    const [color, setColor] = useState('#ff5c5c'); // can be any value in colorBank or 'none'
    const [noteToColor, setNoteToColor] = useState({});
    
    // fret is 0-indexed, so the first fret is 0, second fret is 1, etc.
    // playing the open strings (in standard tuning, [E, A, D, G, B, e]) is the equivalent of playing the 0th fret
    const [firstVisibleFretIndex, setFirstVisibleFretIndex] = useState(0); // value changes when the user expands or shrinks the fretboard from the left side
    const [lastVisibleFretIndex, setLastVisibleFretIndex] = useState(16); // value changes when the user expands or shrinks the fretboard from the right side
    const numFrets = lastVisibleFretIndex - firstVisibleFretIndex;

    const increaseVisibleFretsLeft = () => {
        if (firstVisibleFretIndex > 0) {
            setFirstVisibleFretIndex(prev => prev - 1);
        }
    };
    
    const decreaseVisibleFretsLeft = () => {
        if (numFrets > 3) {
            setFirstVisibleFretIndex(prev => prev + 1);
        }
    };

    const increaseVisibleFretsRight = () => {
        setLastVisibleFretIndex(prev => prev + 1);
    };
    
    const decreaseVisibleFretsRight = () => {
        if (numFrets > 3) {
            setLastVisibleFretIndex(prev => prev - 1);
        }
    };

    const onIncreaseLeft = () => {
        if (lefty) increaseVisibleFretsRight();
        else increaseVisibleFretsLeft();
    };

    const onDecreaseLeft = () => {
        if (lefty) decreaseVisibleFretsRight();
        else decreaseVisibleFretsLeft();
    };

    const onIncreaseRight = () => {
        if (lefty) increaseVisibleFretsLeft();
        else increaseVisibleFretsRight();
    };

    const onDecreaseRight = () => {
        if (lefty) decreaseVisibleFretsLeft();
        else decreaseVisibleFretsRight();
    };

    const canIncreaseLeft = lefty
        ? true
        : firstVisibleFretIndex > 0;
    const canDecreaseLeft = lefty
        ? lastVisibleFretIndex > firstVisibleFretIndex + 1
        : firstVisibleFretIndex < lastVisibleFretIndex - 1;
    const canIncreaseRight = lefty
        ? firstVisibleFretIndex > 0
        : true;
    const canDecreaseRight = lefty
        ? firstVisibleFretIndex < lastVisibleFretIndex - 1
        : lastVisibleFretIndex > firstVisibleFretIndex + 1;

    const [editingIndex, setEditingIndex] = useState(null);
    const [updatedNote, setUpdatedNote] = useState('');
    
    useEffect(() => {
        // update letter by letter
        setUpdatedNote(formatNoteToString(strings[editingIndex]));
    }, [editingIndex, setEditingIndex]);
    
    const [strings, setStrings] = useState([64, 59, 55, 50, 45, 40]); // tuning can quickly change by modifying this array of midi note
    const [tuning, setTuning] = useState('standard'); // standard by default

    // utility function to check if two arrays are equal
    // used to check if the updated tuning by the user matches any preset options
    const arraysEqual = (a, b) => {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    };

    // check if updated tuning by user matches any preset options
    useEffect(() => {
        let found = false;
        for (const [name, notes] of Object.entries(presetTunings)) {
            if (arraysEqual(notes, strings)) {
                setTuning(name);
                found = true;
            }
        }
        if (!found) {
            setTuning("custom");
        }
        // console.log("curr strings:", strings);
    }, [strings]);

    // keyboard shortcuts for increasing/decreasing visible frets
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tagName = e.target.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
                // user is typing, so ignore
                return;
            }
            switch (e.key) {
                case '4':
                    onIncreaseRight();
                    break;
                case '3':
                    onDecreaseRight();
                    break;
                case '1':
                    onIncreaseLeft();
                    break;
                case '2':
                    onDecreaseLeft();
                    break;
                case 'Escape':
                    setColor('none');
                    break;
                case 'R':
                    setColor(colorBankLight[0]);
                    break;
                case 'r':
                    setColor(colorBank[0]);
                    break;
                case 'O':
                    setColor(colorBankLight[1]);
                    break;
                case 'o':
                    setColor(colorBank[1]);
                    break;
                case 'Y':
                    setColor(colorBankLight[2]);
                    break;
                case 'y':
                    setColor(colorBank[2]);
                    break;
                case 'G':
                    setColor(colorBankLight[3]);
                    break;
                case 'g':
                    setColor(colorBank[3]);
                    break;
                case 'A':
                    setColor(colorBankLight[4]);
                    break;
                case 'a':
                    setColor(colorBank[4]);
                    break;
                case 'B':
                    setColor(colorBankLight[5]);
                    break;
                case 'b':
                    setColor(colorBank[5]);
                    break;
                case 'P':
                    setColor(colorBankLight[6]);
                    break;
                case 'p':
                    setColor(colorBank[6]);
                    break;
                case 'M':
                    setColor(colorBankLight[7]);
                    break;
                case 'm':
                    setColor(colorBank[7]);
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [decreaseVisibleFretsLeft, decreaseVisibleFretsRight, increaseVisibleFretsLeft, increaseVisibleFretsRight]);

    // load the soundfont library on page load, prevents audio delay
    const [instrument, setInstrument] = useState(null);
    useEffect(() => {
        const audioCtx = new AudioContext();
        Soundfont.instrument(audioCtx, 'acoustic_guitar_nylon')
            .then((instrument) => {
                setInstrument(instrument);
            })
            .catch((error) => {
                console.error('Error loading instrument:', error);
            }
        );
    }, []);

    // generate midi notes for the fretboard
    // allNotes is an array of midi notes from 0 to 127, representing all possible notes in midi
    const allNotes = Array.from({ length: 128 }, (_, i) => i);
    
    // startingNote: the note the string starts at (e.g. E for E string)
    // gets all the notes that belong to the string
    const getStringNotes = (startingNote) => {
        // 64 = high e
        let stringNotes = [];
        // console.log(typeof startingNote, startingNote);
        // console.log(`Generating notes for string starting at: ${startingNote}`);
        const startIndex = allNotes[startingNote];
        // console.log(allNotes);
        // console.log(`Start index for ${startingNote}: ${startIndex}`);
        const startIndexWithOffset = startIndex + firstVisibleFretIndex; // add firstVisibleFretIndex offset user sets
        if (lefty) {
            for (let i = startIndex + lastVisibleFretIndex - 1; i >= startIndexWithOffset; i--) {
                stringNotes.push(allNotes[i]);
            }

        } else {
            for (let i = startIndexWithOffset; i < startIndex + lastVisibleFretIndex; i++) {
                stringNotes.push(allNotes[i]);
            }
        }
        return stringNotes;
        // return lefty ? stringNotes.reverse() : stringNotes;
    };

    // midi notes: 57=A3, 52=E3, etc.
    // stringIndex = 0 (top string) to 5 (bottom string)
    // if playAudio is true, play the note when clicked, and if color is set, apply the color to the note
    const selectNote = (note, stringIndex) => {
        if (note > 108) return; // note is out of range, so ignore it
        // console.log(`Selected note: ${note} on string index: ${stringIndex}`);
        if (playAudio && instrument) {
            instrument.play(note, 0, { gain: 1, duration: 1.5 });
        }

        if ((color === noteToColor[`${note}-${stringIndex}`])) {  // or if the user clicks a note with the same color, reset it
            setNoteToColor((prev) => {
                const updated = { ...prev };
                delete updated[`${note}-${stringIndex}`];
                return updated;
            });
        } else if (color !== 'none') { // if a color has been set, then apply it to the note
            setNoteToColor((prev) => ({
                ...prev,
                [`${note}-${stringIndex}`]: color
            }));
        }
    };

    // (100% width) / (number of frets) = locations where each fret marker should be placed
    const getFretMarkerPositions = (numFrets) => {
        let placements = [];
        let firstFretPosition = 100 / numFrets;
        for (let i = 1; i <= numFrets; i++) {
            placements.push(firstFretPosition * i);
        }
        return placements;
    };

    // notes should be positioned in the middle of the fret markers
    // exception: the first note of a string (e.g. EADGBE in standard tuning) should be placed slightly before the "zero-th" fret marker
    const getNotePositions = () => {
        let placements = [];
        let firstFretPosition = 100 / numFrets;
        // first notes of the strings (e.g. EADGBE in standard tuning) should be placed slightly before "zero-th" fret marker
        // only do so when its the zero-th fret, even if the user changes its visibility
        let i = 2;
        if (firstVisibleFretIndex === 0) {
            placements.push(firstFretPosition - firstFretPosition / 3); // div by 3 is a nice offset to div by 2 (which is used for other note placements not on the 0th fret)
        } else {
            // i is changed here to account for when the first visible fret isn't pushed to the placements array
            i = 1;
        }
        // the other notes of the strings are placed in the midpoints of the frets
        for (; i <= numFrets; i++) {
            placements.push((firstFretPosition * i) - (firstFretPosition / 2));
        }
        // console.log(placements);
        return placements;
    };
    
    // user can change the tuning of the fretboard by clicking on the note boxes below the fretboard and editing them
    const updateTuningInputText = (e) => {
        setUpdatedNote(e.target.value);
    };

    const finishChangeTuning = (updatedNote_, index) => {
        const updatedNote = unformatNote(updatedNote_);
        if (updatedNote === -1) {
            setEditingIndex(null); // reset index
            return; // return with no changes
        }
        const newTuning = [...strings];
        newTuning[index] = updatedNote;
        setStrings(newTuning);
        setEditingIndex(null); // reset index
    };

    const resetTuning = () => {
        setStrings([64, 59, 55, 50, 45, 40]);
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
                    node.classList?.contains('modify-fretboard-length-left') ||
                    node.classList?.contains('modify-fretboard-length-right')
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

    // returns true if fretIndex is on the zero-th fret and the first visible fret is the zero-th fret
    // used for styling, making it apparent where the start of the fretboard is
    const isZerothFret = (fretIndex) => {
        if (lefty)
            return lastVisibleFretIndex === numFrets && fretIndex === numFrets - 2;
        else
            return firstVisibleFretIndex === 0 && fretIndex === 0;
    };

    const fretLabels = () => {
        let arr = Array.from(
            { length: lastVisibleFretIndex - firstVisibleFretIndex },
            (_, i) => firstVisibleFretIndex + i
        );
        return lefty ? arr.reverse() : arr;
    };

    // midi note to letter note conversion, returns react element
    const formatNote = (midiNoteValue) => {
        const noteMap = showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        let note = noteMap[midiNoteValue % 12];
        const octave = Math.floor(midiNoteValue / 12) - 1;
        return (
            <>
                {note}
                <sub>{octave}</sub>
                {/* {note} */}
            </>
        );
    };

    // midi note to letter note conversion, returns string 
    const formatNoteToString = (midiNoteValue) => {
        const noteMap = showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        let note = noteMap[midiNoteValue % 12];
        const octave = Math.floor(midiNoteValue / 12) - 1;
        return note + octave;
    };
    
    // letter note to midi note conversion
    const unformatNote = (userInputNote) => {
        const noteMap = {
            'C': 0,
            'C#': 1, 'Db': 1,
            'D': 2,
            'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5,
            'F#': 6, 'Gb': 6,
            'G': 7,
            'G#': 8, 'Ab': 8,
            'A': 9,
            'A#': 10, 'Bb': 10,
            'B': 11
        };
        const match = userInputNote.match(/^([A-G][#b]?)(\d)$/);
        if (!match) {
            alert("Invalid note format. Use C4, D#3, etc.");
            return -1;
        }
        const note = match[1];
        if (noteMap[note] === undefined) {
            alert("Invalid note format. Use C4, D#3, etc.");
            return -1; // invalid note
        }
        const octave = parseInt(match[2], 10) + 1;
        if (octave > 8) {
            alert("Octaves begin to go out of range past 8.");
            return -1; // octave begins to go out of range at this point
        }
        // console.log(`Unformatted note: ${note}, Octave: ${octave}`);
        return (octave * 12) + noteMap[note];
    };

    return (
        <div className="fretboard-container">
            <div className="fretboard-title">
                Fretboard Diagram Maker
            </div>
            <div id="fretboard-interface" className="fretboard-interface" style={{ minWidth: `${(numFrets + 1) * 75}px` }}> {/* adding 1 to numFrets prevents buttons from overflowing */}
                <div className="modify-fretboard-length-left">
                    {canIncreaseLeft && (
                        <button 
                            className="increase-frets-left"
                            onClick={onIncreaseLeft}
                        > 
                            <IoArrowBackCircle /> 
                        </button>
                    )}
                    {(numFrets > 3 && canDecreaseLeft) && (
                        <button
                            className="decrease-frets-left"
                            onClick={onDecreaseLeft}
                        >
                            <IoArrowForwardCircle />
                        </button>
                    )}
                </div>

                {/* the fretboard itself; contains the clickable note */}
                <div className="fretboard">
                    <div className="fret-labels">
                        {fretLabels().map((fretIndex, i) => {
                            // const fretIndex = firstVisibleFretIndex + i;
                            return (
                            <div
                                key={fretIndex}
                                className="fret-label"
                                style={{ left: `${getNotePositions()[i]}%` }}
                            >
                                {fretIndex}
                            </div>
                            );
                        })}
                    </div>

                    {/* .string-container is a workaround bc of the left/right arrows messing with .fretboard height */}
                    <div className="string-container" style={{minWidth: `${numFrets * 75}px`}}>
                        {(flipStrings ? [...strings].reverse() : strings).map((stringName, stringIndex) => ( 
                        <div className="string" key={stringIndex}> {/* for the string itself */}
                            <div className="string-notes">
                                {/* now map the notes onto the string just generated */}
                                {getStringNotes(stringName, numFrets).map((note, j) => 
                                    // audible midi range is [0, 109]
                                    note < 109 && (
                                        <button
                                            key={`${note}-${stringName}`}
                                            // only hide notes that don't have a color given to them
                                            className={`note ${(hideNotes && !noteToColor[note + "-" + stringIndex]) ? 'hidden' : ''}`}
                                            style={{
                                                left: `${getNotePositions()[j]}%`,
                                                // backgroundColor: noteColorArr[note]
                                                backgroundColor: noteToColor[`${note}-${stringIndex}`] != null ? noteToColor[`${note}-${stringIndex}`] : ''
                                            }}
                                            onClick={() => selectNote(note, stringIndex)}
                                        >
                                            {/* {formatNote(note)}-{stringName}-{stringIndex} */}
                                            {/* {note} */}
                                            {formatNote(note)}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                        ))}
                    </div>

                    {/* fret lines */}
                    {getFretMarkerPositions(numFrets).map((percent, i) => {
                        // if (i != numFrets - 1) {
                            return ( 
                                <div 
                                    className="fret-marker" 
                                    style={{ 
                                        left: `${percent}%`,
                                        width: isZerothFret(i) ? "3px" : "2px",
                                        backgroundColor: isZerothFret(i) ? "black" : "gray"
                                    }}
                                >
                                </div>
                            )
                        // }
                    })}
                </div>

                <div className="modify-fretboard-length-right">
                    {canIncreaseRight && (
                        <button 
                        className="increase-frets-right"
                        onClick={onIncreaseRight}
                    >
                        <IoArrowForwardCircle /> 
                        </button>
                    )}
                    {(numFrets > 3 && canDecreaseRight) && (
                        <button 
                            className="decrease-frets-right"
                            onClick={onDecreaseRight}
                        >
                            <IoArrowBackCircle /> 
                        </button>
                    )}
                </div>
            </div>

            <div className="tuning-editor">
                <p>
                    Set Tuning:
                </p>
                <div className="tune-input">
                    {strings.map((note, i) => (
                        <div key={i}>
                            {editingIndex === i ? (
                                <input
                                    value={updatedNote}
                                    onChange={(e) => updateTuningInputText(e)}
                                    onBlur={() => setEditingIndex(null)} // or maybe onBlur={() => finishChangeTuning(updatedNote, i)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            finishChangeTuning(updatedNote, i);
                                        }
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <button 
                                    className='retune-note-btn'
                                    onClick={() => setEditingIndex(i)}>
                                    {formatNote(note)}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="tuning-dropdown-container">
                    <p>
                        Current Tuning:
                    </p>
                    <select id="tuning-dropdown" value={tuning} onChange={changeTuningViaDropdown}>
                        {Object.entries(presetTunings).map(([tuningKey]) => {
                            if (tuningKey === 'custom' && tuning !== 'custom') {
                                return null;
                            }
                            return (
                                <option key={tuningKey} value={tuningKey}>
                                    {tuningKey}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {tuning !== 'standard' && (
                    <button className="reset-tuning" onClick={resetTuning}>
                        Reset Tuning
                    </button>
                )}
            </div>

            <div className="saving">
                <button onClick={downloadSVG}>Download SVG</button>
            </div>

            {/* toggle note visibility */}
            <div className="toggle-btns">
                <button 
                    className="toggle-notes"
                    onClick={() => setHideNotes(prev => !prev)}
                >
                    {hideNotes ? <MdVisibilityOff /> : <MdVisibility />}
                </button>

                <button
                    className="toggle-audio"
                    onClick={() => setPlayAudio(prev => !prev)}
                >
                    {playAudio ? <IoVolumeMedium /> : <IoVolumeOff />}
                </button>

                <button
                    className="toggle-sharps-flats"
                    onClick={() => setShowSharps(prev => !prev)}
                >
                    {showSharps ? '♯' : '♭'}
                </button>

                <button
                    className="toggle-hand"
                    onClick={() => setLefty(prev => !prev)}
                >
                    {lefty ? < FaHandPointLeft size={30} /> : <FaHandPointRight size={30} />}
                </button>

                <button
                    className="toggle-flip-strings"
                    onClick={() => setFlipStrings(prev => !prev)}
                >
                    {flipStrings ? < LuRefreshCcw size={30} /> : <LuRefreshCw size={30} />}
                </button>

            </div>

            {/* color selector for making fretboard diagrams */}
            <div className="color-selector">   
                <button
                    className={`unset-color-btn ${color==='none' && 'selected'}`}
                    onClick={() => setColor('none')}
                >
                    X
                </button>
                <div className="color-btns-container">
                    <div className="color-btns">
                        {colorBank.map((c) => (
                            <button
                            key={c}
                            className={`color-btn ${c === color ? 'selected' : ''}`}
                            onClick={() => setColor(c)}
                            style={{ 
                                backgroundColor: c
                            }}
                            >

                            </button>
                        ))}
                    </div>
                    <div className="color-btns">
                        {colorBankLight.map((c) => (
                            <button
                            key={c}
                            className={`color-btn ${c === color ? 'selected' : ''}`}
                            onClick={() => setColor(c)}
                            style={{ 
                                backgroundColor: c
                            }}
                            >

                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="info">
                <p style={{ fontWeight: 'bold' }}>
                    Hotkeys:
                </p>
                <p>
                    1 &#8594; extend fretboard from left, 2 &#8594; shrink fretboard from left
                </p>
                <p>
                    4 &#8594; extend fretboard from right, 3 &#8594; shrink fretboard from right
                </p> 
                <p>
                    esc &#8594; no color, r &#8594; red, o &#8594; orange, y &#8594; yellow, g &#8594; green, a &#8594; light blue, b &#8594; blue, p &#8594; purple, m &#8594; magenta
                </p>
                <p>
                    shift + r &#8594; light red, etc.
                </p>                        
            </div>
        </div>
    )
}

export default Fretboard