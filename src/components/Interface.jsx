import { React, useEffect, useState } from 'react'
import '../elements/Interface.css';
import { StringControls } from './Controls.jsx';
import { FretboardInterface } from './Fretboard.jsx';
import { FretboardToggles } from './Toggles.jsx';
import { ColorSelector } from './ColorSelector.jsx';
import { Tuning } from './Tuning.jsx';
import { IoMdMusicalNote } from "react-icons/io";

function Fretboard() {
    // toggles
    const [hideNotes, setHideNotes] = useState(false); // hide notes that don't have a color set
    const [playAudio, setPlayAudio] = useState(true); // toggle notes playing audio on click
    const [showSharps, setShowSharps] = useState(true); // sharps or flats
    const [lefty, setLefty] = useState(false); // left hand or right hand
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('isDarkMode');
        return stored ? JSON.parse(stored) : false;
    });

    const [noteToColor, setNoteToColor] = useState({});
    // coloring for diagrams
    const [colorBank] = useState(['#ff5c5c', '#ffbf5c', '#fff85c', '#9cff5c', '#5cf0ff', '#5c67ff', '#b25cff', '#ff5cfd']);
    const [colorBankLight] = useState(['#ffbebe','#ffe5be','#fffcbe','#d7ffbe','#bef9ff', '#c1beff', '#e0beff','#ffbefe']);
    const [color, setColor] = useState('#ff5c5c'); // can be any value in colorBank or 'none'

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

    // default strings for fretboard
    // tuning can quickly change by modifying this array of midi notes
    const [strings, setStrings] = useState([
        {id: 0, midi: 64}, // E4
        {id: 1, midi: 59}, // B3
        {id: 2, midi: 55}, // G3
        {id: 3, midi: 50}, // D3
        {id: 4, midi: 45}, // A2
        {id: 5, midi: 40}, // E2
    ]);

    return (
        <div className="fretboard-container">
            <div className="fretboard-title"><IoMdMusicalNote style={{ transform: 'translateY(5px)'}} />Fretboard Diagram Maker</div>

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

            <div className="info">
                <p><b>Hotkeys</b>:</p>
                <p> 1 &#8594; extend fretboard from left, 2 &#8594; shrink fretboard from left </p>
                <p> 4 &#8594; extend fretboard from right, 3 &#8594; shrink fretboard from right </p> 
                <p> esc &#8594; no color, r &#8594; red, o &#8594; orange, y &#8594; yellow, g &#8594; green, a &#8594; light blue, b &#8594; blue, p &#8594; purple, m &#8594; magenta </p>
                <p> shift + r &#8594; light red, etc. </p>                        
            </div>
        </div>
    )
}

export default Fretboard;