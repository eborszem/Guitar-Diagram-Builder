import { React, useEffect, useState } from 'react'
import '../elements/Interface.css';
import { StringControls } from './Controls.jsx';
import { FretboardInterface } from './Fretboard.jsx';
import { FretboardToggles } from './Toggles.jsx';
import { ColorSelector } from './ColorSelector.jsx';
import { Tuning } from './Tuning.jsx';

function Interface({
    strings,
    setStrings,
    noteToColor,
    setNoteToColor,
    color,
    setColor,
    curFretboardId,
    setCurFretboardId,
    setPrevFretboardId
}) {
    // toggles
    const [hideNotes, setHideNotes] = useState(false); // hide notes that don't have a color set
    const [playAudio, setPlayAudio] = useState(true); // toggle notes playing audio on click
    const [showSharps, setShowSharps] = useState(true); // sharps or flats
    const [lefty, setLefty] = useState(false); // left hand or right hand
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('isDarkMode');
        return stored ? JSON.parse(stored) : false;
    });

    // coloring for diagrams
    const [colorBank] = useState(['#ff5c5c', '#ffbf5c', '#fff85c', '#9cff5c', '#5cf0ff', '#5c67ff', '#b25cff', '#ff5cfd']);
    const [colorBankLight] = useState(['#ffbebe','#ffe5be','#fffcbe','#d7ffbe','#bef9ff', '#c1beff', '#e0beff','#ffbefe']);

    // dark mode check
    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // converts a midi note value to its corresponding note in scientific pitch notation (e.g. 64 --> E4, 59 --> B3)
    // in the soundfont-player library, middle C (C4) has midi note value 60
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
            </>
        );
    };

    return (
        <>
            <StringControls
                side="highest"
                strings={strings}
                setStrings={setStrings}
            />

            <FretboardInterface
                strings={strings}
                toggles={{ hideNotes, isDarkMode, lefty, playAudio }}
                noteColor={{ color, setColor, colorBank, colorBankLight }}
                formatNote={formatNote}
                noteToColor={noteToColor}
                setNoteToColor={setNoteToColor}
                
                curFretboardId={curFretboardId}
                setCurFretboardId={setCurFretboardId}
                setPrevFretboardId={setPrevFretboardId}
            />
            
            <StringControls
                side="lowest"
                strings={strings}
                setStrings={setStrings}
            />

            <Tuning
                strings={strings}
                setStrings={setStrings}
                showSharps={showSharps}
                formatNote={formatNote}
                noteToColor={noteToColor}
                setNoteToColor={setNoteToColor}
            />

            <FretboardToggles
                hideNotes={hideNotes}
                setHideNotes={setHideNotes}
                playAudio={playAudio}
                setPlayAudio={setPlayAudio}
                showSharps={showSharps}
                setShowSharps={setShowSharps}
                lefty={lefty}
                setLefty={setLefty}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            <ColorSelector
                colorBanks={{ colorBank, colorBankLight }}
                color={color}
                setColor={setColor}
            />

            <div className="switch-fretboards">
                <p>Switch Fretboard:</p>
                <div className="toggle-btns">
                {[1,2,3,4,5,6,7,8,9].map((idx) =>
                    <button
                        className="fretboard-btn"
                        onClick={() => {
                            setPrevFretboardId(curFretboardId);
                            setCurFretboardId(idx);
                        }}
                        style={{
                            fontWeight: "bold",
                            fontSize: "20px",
                            color: idx === curFretboardId ? "rgb(68, 146, 255)" : "", 
                            backgroundColor: idx === curFretboardId ? "rgba(68, 146, 255, 0.211)" : "",
                            border: idx === curFretboardId ? "2px solid rgb(68, 146, 255)" : "1px solid #333",
                        }}
                    >
                        {idx}
                    </button>
                )}
                </div>
            </div>
        </>
    )
}

export default Interface;