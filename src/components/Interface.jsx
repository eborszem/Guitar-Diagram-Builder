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
import { IoIosMusicalNote } from "react-icons/io";


function Interface({
    strings,
    setStrings,
    noteToColor,
    setNoteToColor,
    color,
    setColor,
    curFretboardId,
    setCurFretboardId,
    setPrevFretboardId,
    noteLabel,
    setNoteLabel,
    noteLabelArr,
    keyForInterval,
    setKeyForInterval,
    firstVisibleFretIndex,
    setFirstVisibleFretIndex,
    lastVisibleFretIndex,
    setLastVisibleFretIndex
}) {
    // toggles
    const [hideNotes, setHideNotes] = useState(false); // hide notes that don't have a color set
    const [playAudio, setPlayAudio] = useState(true); // toggle notes playing audio on click
    const [showSharps, setShowSharps] = useState(true); // sharps or flats
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

    useEffect(() => {
        const handleKeydown = (event) => {
            const target = event.target;

            if (
                target &&
                (
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            const key = event.key.toLowerCase();

            let board = null;

            if (key >= "1" && key <= "9") {
                board = Number(key);
            } else if (key === "0") {
                board = 10;
            }

            if (board !== null) {
                setPrevFretboardId(curFretboardId);
                setCurFretboardId(board);
            }
        };

        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    }, [curFretboardId]);

    // converts a midi note value to its corresponding note in scientific pitch notation (e.g. 64 --> E4, 59 --> B3)
    // in the soundfont-player library, middle C (C4) has midi note value 60
    // defaultSPN is used to ensure custom tuning note names remain in scientific pitch notation
    const formatNote = (midiNoteValue, defaultSPN) => {
        if (defaultSPN || noteLabel === 0 || noteLabel === 1) { // spn labels or no spn labels
            const notes = showSharps
                ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            let note = notes[midiNoteValue % notes.length];
            const octave = Math.floor(midiNoteValue / notes.length) - 1;
            return (noteLabel === 0 || defaultSPN === true) ? (<>{note}<sub>{octave}</sub></>) : (<>{note}</>);
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
                ? ['I', 'I#', 'II', 'II#', 'III', 'IV','IV#', 'V', 'V#', 'VI', 'VI#', 'VII']
                : ['I', 'IIb', 'II', 'IIIb', 'III', 'IV','Vb', 'V', 'VIb', 'VI', 'VIIb', 'VII'];
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



    return (
        <>
            <div className="header">
                <div className="fretboard-title">
                    <IoIosMusicalNote style={{ transform: 'translateY(5px)' }} 
                />
                    {/* FRETBOARD DIAGRAM MAKER */}
                    Fretboard Diagram Builder
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
                <div className="tuning-block-container">
                    <Tuning
                        strings={strings}
                        setStrings={setStrings}
                        showSharps={showSharps}
                        formatNote={formatNote}
                        noteToColor={noteToColor}
                        setNoteToColor={setNoteToColor}
                        root={root}
                        setRoot={setRoot}
                    />
                </div>

                <div className="interface-container">
                    <div className="settings-block-container">
                        <div className="settings-block">
                            <NeckSetup
                                strings={strings}
                                setStrings={setStrings}
                                firstVisibleFretIndex={firstVisibleFretIndex}
                                setFirstVisibleFretIndex={setFirstVisibleFretIndex}
                                lastVisibleFretIndex={lastVisibleFretIndex}
                                setLastVisibleFretIndex={setLastVisibleFretIndex}
                            />
                        </div>

                        <div className="settings-block">
                            <Scale
                                showSharps={showSharps}
                                root={root}
                                setRoot={setRoot}
                                setNoteToColor={setNoteToColor}
                                color={color}
                                strings={strings}
                            />
                        </div>

                        <div className="settings-block">
                            <Arpeggio
                                showSharps={showSharps}
                                root={root}
                                setRoot={setRoot}
                                setNoteToColor={setNoteToColor}
                                color={color}
                                strings={strings}
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
                                    hideNotes={hideNotes}
                                    setHideNotes={setHideNotes}
                                    showSharps={showSharps}
                                    setShowSharps={setShowSharps}
                                    setRoot={setRoot}
                                    setNoteToColor={setNoteToColor}
                                    noteLabel={noteLabel}
                                    setNoteLabel={setNoteLabel}
                                    noteLabelArr={noteLabelArr}
                                    formatNote={formatNote}
                                    keyForInterval={keyForInterval}
                                    setKeyForInterval={setKeyForInterval}
                                />
                            </div>
                            
                            
                        </div>

                        <div className="settings-block">
                            <Download
                                noteToColor={noteToColor}
                                setNoteToColor={setNoteToColor}
                                strings={strings}
                                setStrings={setStrings}
                                noteLabel={noteLabel}
                                setNoteLabel={setNoteLabel}
                                keyForInterval={keyForInterval}
                                setKeyForInterval={setKeyForInterval}
                                firstVisibleFretIndex={firstVisibleFretIndex}
                                setFirstVisibleFretIndex={setFirstVisibleFretIndex}
                                lastVisibleFretIndex={lastVisibleFretIndex}
                                setLastVisibleFretIndex={setLastVisibleFretIndex}
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        <div className="settings-block">
                            <div className="switch-fretboards">
                                <p>switch fretboard</p>
                                <div className="toggle-btns">
                                    {[1,2,3,4,5].map((idx) =>
                                        idx != curFretboardId ? (
                                            <button
                                                key={`fretboard-${idx}`}
                                                className="fretboard-btn"
                                                style={{
                                                    fontSize: "30px",
                                                    fontWeight: "bold"
                                                }}
                                                onClick={() => {
                                                    setPrevFretboardId(curFretboardId);
                                                    setCurFretboardId(idx);
                                                }}
                                                
                                            >
                                                {idx}
                                            </button>
                                        ) : (
                                            <button
                                                key={`fretboard-${idx}`}
                                                className="current-fretboard-btn"
                                                style={{
                                                    fontSize: "30px",
                                                    fontWeight: "bold",
                                                    color: "#4492ff",
                                                    backgroundColor: "#4492ff36",
                                                    border: "none", 
                                                    boxShadow: "inset 0 0 0 2px #4492ff"
                                                }}
                                            >
                                                {idx}
                                            </button>
                                        )
                                    )}
                                </div>
                                <div className="toggle-btns">
                                    {[6,7,8,9,10].map((idx) =>
                                        idx != curFretboardId ? (
                                            <button
                                                key={`fretboard-${idx}`}
                                                className="fretboard-btn"
                                                style={{
                                                    fontSize: "30px",
                                                    fontWeight: "bold"
                                                }}
                                                onClick={() => {
                                                    setPrevFretboardId(curFretboardId);
                                                    setCurFretboardId(idx);
                                                }}
                                                
                                            >
                                                {idx}
                                            </button>
                                        ) : (
                                            <button
                                                key={`fretboard-${idx}`}
                                                className="current-fretboard-btn"
                                                style={{
                                                    fontSize: "30px",
                                                    fontWeight: "bold",
                                                    color: "#4492ff",
                                                    backgroundColor: "#d1e2f9",
                                                    border: "none", 
                                                    boxShadow: "inset 0 0 0 2px #4492ff"
                                                }}
                                            >
                                                {idx}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="fretboard-interface-container">
                        {/* <StringControls
                            side="highest"
                            strings={strings}
                            setStrings={setStrings}
                        /> */}

                        <FretboardInterface
                            strings={strings}
                            toggles={{ hideNotes, isDarkMode, lefty, playAudio }}
                            noteColor={{ color, setColor, colorBank, colorBankLight }}
                            isColorPickerMode={isColorPickerMode}
                            setIsColorPickerMode={setIsColorPickerMode}
                            formatNote={formatNote}
                            noteToColor={noteToColor}
                            setNoteToColor={setNoteToColor}
                            curFretboardId={curFretboardId}
                            setCurFretboardId={setCurFretboardId}
                            setPrevFretboardId={setPrevFretboardId}
                            firstVisibleFretIndex={firstVisibleFretIndex}
                            lastVisibleFretIndex={lastVisibleFretIndex}
                        />
                        
                        {/* <StringControls
                            side="lowest"
                            strings={strings}
                            setStrings={setStrings}
                        /> */}

                    </div>






                    
                </div>
            </div>

        </>
    )
}

export default Interface;