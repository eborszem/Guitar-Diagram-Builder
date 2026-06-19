import { React, useEffect, useState, useRef } from 'react'
import '../elements/Interface.css';

import { StringControls } from './Controls.jsx';
import { FretboardInterface } from './Fretboard.jsx';
import { FretboardToggles } from './Toggles.jsx';
import { HeaderToggles } from './HeaderToggles.jsx';
import { ColorSelector } from './ColorSelector.jsx';
import { Tuning } from './Tuning.jsx';
import { Scale } from './Scale.jsx';
import { Arpeggio } from './Arpeggio.jsx';
import { NeckSetup } from './NeckSetup.jsx';
import { Download } from './Download.jsx';
import { IoIosMusicalNote, IoMdArrowDropdown } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaMinus } from "react-icons/fa";

function Interface() {
    //const { id } = useParams(); // for share links
    // const navigate = useNavigate();
    // useEffect(() => {
    //     if (!id) return;
    //     async function fetchFretboard() {
    //         try {
    //             const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    //             const res = await fetch(`${backendUrl}/share/${id}`);
    //             if (!res.ok) {
    //                 navigate("/");
    //                 return;
    //             }    
    //             const data = await res.json();
    //             // console.log("DATA=",data);
    //             // console.log("NOTETOCOLOR=",data.notetocolor);
    //             const midiString = data.tuning;
    //             const midiValues = midiString.split("_").map(Number);
    //             const strings_ = midiValues.map((midi, idx) => ({
    //                 id: idx,
    //                 midi: midi
    //             }))

    //             setStrings(strings_);
    //             setNoteToColor(data.notetocolor);
    //             setColor('#ff5c5c');
    //             setNoteLabel(data.noteLabel);
    //             setKeyForInterval(data.keyForInterval);

    //             setInterfaces(prev =>
    //                 prev.map(f =>
    //                     f.id === 0
    //                         ? { ...f, strings: strings_, noteToColor: data.notetocolor, color: '#ff5c5c' }
    //                         : f
    //                 )
    //             );
    //             setCurFretboardId(1);
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     }
    //     fetchFretboard();
    // }, [id]);

    const standardTuning = [
        {id: 0, midi: 64}, // E4
        {id: 1, midi: 59}, // B3
        {id: 2, midi: 55}, // G3
        {id: 3, midi: 50}, // D3
        {id: 4, midi: 45}, // A2
        {id: 5, midi: 40}, // E2
    ];

    const [color, setColor] = useState('#5c67ff');
    const [keyForInterval, setKeyForInterval] = useState('C');
    const noteLabelArr = ['octave', 'no octave', 'degree', 'blank'];
    
    const [curFretboardId, setCurFretboardId] = useState(uuidv4());
    const defaultFretboard = {
        id: curFretboardId,
        strings: [...standardTuning],
        color: '#5c67ff',
        noteToColor: {},
        firstVisibleFretIndex: 0,
        lastVisibleFretIndex: 12,
        hideNotes: false,
        showSharps: true,
        noteLabel: 0,
    };

    const [fretboards, setFretboards] = useState([defaultFretboard]);

    const getFretboard = (id) => {
        // const fb = fretboards.find(fretboard => fretboard.id === id);
        // for (const str of fb.strings) {
        //     console.log(str.id + ", midi=" + str.midi);
        // }
        // return fb;
        return fretboards.find(fretboard => fretboard.id === id);
    }

    const updateFretboard = (id, updates) => {
        setFretboards(prev =>
            prev.map(fretboard => fretboard.id === id ? { ...fretboard, ...updates } : fretboard)
        );
    }

    const addFretboard = () => {
        const newId = uuidv4();
        // add new fretboard to fretboards array
        setFretboards(prev => {
            const idx = prev.findIndex(f => f.id === curFretboardId);
            const newFretboard = {
                ...defaultFretboard,
                id: newId,
            }
            return [...prev.slice(0, idx + 1), newFretboard, ...prev.slice(idx + 1)]
        });
        setCurFretboardId(newId);
        return newId;
    };

    const deleteFretboard = (id) => {
        const confirm = window.confirm("Are you sure you want to delete this fretboard? This action cannot be undone. This will only affect the currently selected fretboard.");
        if (!confirm) return;
        setFretboards(prev => {
            const idx = prev.findIndex(f => f.id === id);
            const prevFretboard = idx > 0 ? prev[idx - 1] : prev[1];
            setCurFretboardId(prevFretboard.id);
            // setCurFretboardId(fretboards[0].id);
            // setCurFretboardId(prevFretboard?.id ?? null);
            return prev.filter(f => f.id !== id);
        });
    };

    // global toggles
    // const [hideNotes, setHideNotes] = useState(false); // hide notes that don't have a color set
    const [playAudio, setPlayAudio] = useState(true); // toggle notes playing audio on click
    // const [showSharps, setShowSharps] = useState(true); // sharps or flats
    const [lefty, setLefty] = useState(() => {  // left hand or right hand
        const stored = localStorage.getItem('lefty');
        return stored ? JSON.parse(stored) : false;
    });
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('isDarkMode');
        return stored ? JSON.parse(stored) : false;
    });

    // coloring for diagrams
    const [colorBank] = useState(['#ff5c5c', '#ffbf5c', '#fff85c', '#9cff5c', '#5cf0ff', '#5c67ff', '#b25cff', '#ff5cfd']);
    const [colorBankLight] = useState(['#ffbebe','#ffe5be','#fffcbe','#d7ffbe','#bef9ff', '#c1beff', '#e0beff','#ffbefe']);
    const colorMap = {
        '#ff5c5c': '#ffbebe',
        '#ffbf5c': '#ffe5be',
        '#fff85c': '#fffcbe',
        '#9cff5c': '#d7ffbe',
        '#5cf0ff': '#bef9ff',
        '#5c67ff': '#c1beff',
        '#b25cff': '#e0beff',
        '#ff5cfd': '#ffbefe'
    }

    const [isColorPickerMode, setIsColorPickerMode] = useState(false);

    // dark mode check
    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // lefty check
    useEffect(() => {
        localStorage.setItem('lefty', JSON.stringify(lefty));
    }, [lefty]);

    // prevent overscroll
    useEffect(() => {
        document.documentElement.style.overscrollBehavior = 'none';
        document.body.style.overscrollBehavior = 'none';
        return () => {
            document.documentElement.style.overscrollBehavior = '';
            document.body.style.overscrollBehavior = '';
        };
    }, []);

    // useEffect(() => {
    //     console.log('all fretboards:', fretboards);
    // }, [fretboards]);

    useEffect(() => {
        const handleKeydown = (event) => {
            const target = event.target;
            if ((target) && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            const key = event.key;
            if ((parseInt(key) > fretboards.length) || (parseInt(key) === 0 && fretboards.length <= 9)) {
                return;
            }
            if (/^[0-9]$/.test(key)) {
                let index = parseInt(key) === 0 ? 9 : parseInt(key) - 1; // 1-9 map to 0-8, 0 maps to 9
                setCurFretboardId(fretboards[index]?.id);
            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [fretboards]);

    // converts a midi note value to its corresponding note in scientific pitch notation (e.g. 64 --> E4, 59 --> B3)
    // in the soundfont-player library, middle C (C4) has midi note value 60
    // defaultSPN is used to ensure custom tuning note names remain in scientific pitch notation
    const formatNote = (midiNoteValue, id, defaultSPN) => {
        const noteLabel = getFretboard(id).noteLabel;
        const showSharps = getFretboard(id).showSharps;
        if (defaultSPN || noteLabel === 0 || noteLabel === 1) { // spn labels or no spn labels
            const notes = showSharps
                ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            let note = notes[midiNoteValue % notes.length];
            const octave = Math.floor(midiNoteValue / notes.length) - 1;
            return (noteLabel === 0 || defaultSPN === true) ? 
                (<p style={{
                    display: "flex",
                    alignItems: "flex-end",
                    margin: 0
                }}>
                    <span>{note}</span>
                    <span
                        style={{
                            fontSize: "0.85em",
                            lineHeight: 1,
                            transform: "translateY(2px)"
                        }}
                    >
                        {octave}
                    </span>
                </p>) : (
                    <>
                        {note}
                    </>
                );
        } else if (noteLabel === 2) { // interval labels; user selects key, then intervals show respective to the key
            const notes = showSharps
                ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

            let keyMidi = notes.indexOf(keyForInterval); // get the first midi value of the key (key of f will be 5, c will be 0, etc)
            let note = midiNoteValue % notes.length;
            if (keyMidi > note) {
                note += 12;
            }
            const intervals = showSharps
                ? ['1', '#1', '2', '#2', '3', '4', '#4', '5', '#5', '6', '#6', '7']
                : ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
            // let note = intervals[midiNoteValue % 12];
            return <>{intervals[note - keyMidi]}</>
        } else { // no labels
            return <></>;
        }
        
    };

    const [root, setRoot] = useState("C");

    // const handleShare = async () => {
    //     try {
    //         const data = {
    //             tuning: strings.map(s => s.midi).join("_"),
    //             notetocolor: noteToColor
    //         };

    //         const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    //         const res = await fetch(`${backendUrl}/api/fretboards`, {
    //             method: "POST",
    //             headers: {"Content-Type": "application/json"},
    //             body: JSON.stringify(data)
    //         });

    //         if (!res.ok) {
    //             throw new Error("failed to save fretboard");
    //         }
    //         const resData = await res.json();
    //         navigator.clipboard.writeText(window.location.origin + resData["shareable-link"]);
    //         alert("Share link copied!");
    //     } catch (err) {
    //         console.log(err);
    //         alert("I am unfortunately out of free cloud credits, please use the JSON download/import feature instead!");
    //     }
    // }

    const svg = () => {
        const color = isDarkMode ? "#5f5f5f" : "black";
        return (
            <svg
                viewBox="0 0 64 42" 
                width="64px" 
                height="42px" 
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
                xmlns="http://www.w3.org/2000/svg"
                >
                <rect x="7" y="3" width="4" height="36" rx="1.5" ry="1.5" fill={color} />
                <rect x="7" y="3" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="10" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="17" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="24" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="30.5" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="37" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
            </svg>
        );
    }

    return (
        <>
            <div className="header">
                <div className="fretboard-title">
                    <IoIosMusicalNote
                        size={40}
                        style={{ transform: 'translateY(5px)' , marginRight: '-7px'}}
                    />
                    <IoIosMusicalNote
                        size={40}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: 'translateY(17px)',
                            clipPath: 'inset(0 0 50% 0)',
                            
                        }}
                    />
                    retboard Diagram Builder
                </div>
                <div className="header-toggles">
                    <HeaderToggles
                        playAudio={playAudio}
                        setPlayAudio={setPlayAudio}
                        lefty={lefty}
                        setLefty={setLefty}
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                    />
                </div>
            </div>

            <div className="interface-and-tuning-container">
                <Tuning
                    fretboard={getFretboard(curFretboardId)}
                    fretboards={fretboards}
                    updateFretboard={updateFretboard}
                    formatNote={formatNote}
                    root={root}
                    setRoot={setRoot}
                />
                <div className="interface-container">
                    <div className="settings-block-container">
                        <div className="settings-block">
                            {/* <IoMdArrowDropdown
                                className="corner-dropdown-btn"
                                // onClick={handleDropdownToggle()}
                                size={30}
                            /> */}
                            <NeckSetup
                                fretboard={getFretboard(curFretboardId)}
                                updateFretboard={updateFretboard}
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        <div className="settings-block">
                            <Scale
                                fretboard={getFretboard(curFretboardId)}
                                updateFretboard={updateFretboard}
                                // showSharps={showSharps}
                                root={root}
                                setRoot={setRoot}
                                color={color}
                            />
                        </div>

                        <div className="settings-block">
                            <Arpeggio
                                fretboard={getFretboard(curFretboardId)}
                                updateFretboard={updateFretboard}
                                // showSharps={showSharps}
                                root={root}
                                setRoot={setRoot}
                                color={color}
                            />
                        </div>

                        <div className="settings-block">
                            <div className="settings-block-toggles">
                                <ColorSelector
                                    colorBank={colorBank}
                                    colorBankLight={colorBankLight}
                                    isColorPickerMode={isColorPickerMode}
                                    setIsColorPickerMode={setIsColorPickerMode}
                                    color={color}
                                    setColor={setColor}
                                />
                            </div>
                        </div>

                        <div className="settings-block">
                            <div className="settings-block-toggles">
                                <FretboardToggles
                                    curFretboardId={curFretboardId}
                                    setCurFretboardId={setCurFretboardId}
                                    fretboard={getFretboard(curFretboardId)}
                                    updateFretboard={updateFretboard}
                                    setRoot={setRoot}
                                    noteLabelArr={noteLabelArr}
                                    keyForInterval={keyForInterval}
                                    setKeyForInterval={setKeyForInterval}
                                />
                            </div>
                            
                            
                        </div>

                        <div className="settings-block">
                            <Download
                                fretboard={getFretboard(curFretboardId)}
                                updateFretboard={updateFretboard}
                                defaultFretboard={defaultFretboard}
                                addFretboard={addFretboard}
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        

                    </div>
                    <div className="fretboard-interface-container">
                        {fretboards.map((fretboard) => 
                            <>
                                <FretboardInterface
                                    fretboard={fretboard}
                                    fretboards={fretboards}
                                    setCurFretboardId={setCurFretboardId}
                                    curFretboardId={curFretboardId}
                                    updateFretboard={updateFretboard}
                                    color={color}
                                    setColor={setColor}
                                    toggles={{ /*hideNotes,*/ isDarkMode, lefty, playAudio }}
                                    isColorPickerMode={isColorPickerMode}
                                    setIsColorPickerMode={setIsColorPickerMode}
                                    formatNote={formatNote}
                                />
                                {fretboard.id === curFretboardId &&
                                    <div className="add-remove-fretboard-btns">
                                        <button onClick={() => addFretboard()}><FaPlus/></button>
                                        {fretboards.length > 1 &&
                                            <button 
                                                onClick={() => deleteFretboard(curFretboardId)}>
                                                <FaMinus/>
                                            </button>
                                        }
                                    </div>
                                }
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    )
}

export default Interface;