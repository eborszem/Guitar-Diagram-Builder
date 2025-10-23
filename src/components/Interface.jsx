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


    // dark mode check
    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // lefty check
    useEffect(() => {
        localStorage.setItem('lefty', JSON.stringify(lefty));
    }, [lefty]);

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

    const [root, setRoot] = useState("C");

    const noteToMidi = () => {
        const noteMap = showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        for (let i = 0; i < noteMap.length; i++) {
            if (noteMap[i] === root) {
                return i;
            }
        }
        return -1;
    }

    const modes = {
        "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
        "Dorian": [0, 2, 3, 5, 7, 9, 10],
        "Phrygian": [0, 1, 3, 5, 7, 8, 10],
        "Lydian": [0, 2, 4, 6, 7, 9, 11],
        "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
        "Locrian": [0, 1, 3, 5, 6, 8, 10]
    }

    const generateScale = (modeName) => {
        setNoteToColor({});
        // first, get all notes in scale
        let midiRoot = noteToMidi(root);
        let mode = modes[modeName];

        // second, set noteToColor mapping for every string
        let tmp = []; // temporary noteToColor mapping
        console.log(midiRoot);
        for (let stringIdx = 0; stringIdx < strings.length; stringIdx++) {
            // valid midi range is 21 to 108
            for (let midi = 0; midi <= 108; midi++) {
                if (midi % 12 !== midiRoot) continue;
                tmp[midi + "-"  + strings[stringIdx].id] = color;
                for (let i = 1; i < mode.length; i++) {
                    let noteMidi = midi + mode[i];
                    if (noteMidi >= 21 && noteMidi <= 108) {
                        tmp[noteMidi + "-"  + strings[stringIdx].id] = colorMap[color];
                    }
                }
            }
        }
        console.log("TMP=",tmp);
        setNoteToColor(tmp);
        
    };

    const handleShare = async () => {
        try {
            const data = {
                tuning: strings.map(s => s.midi).join("_"),
                notetocolor: noteToColor
            };

            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
            const res = await fetch(`${backendUrl}/api/fretboards`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                throw new Error("failed to save fretboard");
            }
            const resData = await res.json();
            navigator.clipboard.writeText(window.location.origin + resData["shareable-link"]);
            alert("Share link copied!");
        } catch (err) {
            console.log(err);
            alert("Failed to generate share link");
        }
    }

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
                generateScale={generateScale}
                root={root}
                setRoot={setRoot}
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
                onShare={handleShare}
                setRoot={setRoot}
                setNoteToColor={setNoteToColor}
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
                            color: idx === curFretboardId ? "rgb(68, 146, 255)" : (isDarkMode ? "#ddd" : ""), 
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