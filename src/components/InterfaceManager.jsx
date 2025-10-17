import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Interface from './Interface.jsx'
import { IoMdMusicalNote } from "react-icons/io";

function InterfaceManager() {

    const standardTuning = [
        {id: 0, midi: 64}, // E4
        {id: 1, midi: 59}, // B3
        {id: 2, midi: 55}, // G3
        {id: 3, midi: 50}, // D3
        {id: 4, midi: 45}, // A2
        {id: 5, midi: 40}, // E2
    ];

    const [strings, setStrings] = useState(standardTuning);
    const [noteToColor, setNoteToColor] = useState({});
    const [color, setColor] = useState({});

    const { id } = useParams(); // for share links
    const navigate = useNavigate();
    useEffect(() => {
        if (!id) return;
        async function fetchFretboard() {
            try {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
                const res = await fetch(`${backendUrl}/share/${id}`);
                if (!res.ok) {
                    navigate("/");
                    return;
                }    
                const data = await res.json();
                console.log("DATA=",data);
                console.log("NOTETOCOLOR=",data.notetocolor);
                const midiString = data.tuning;
                const midiValues = midiString.split("_").map(Number);
                const strings_ = midiValues.map((midi, idx) => ({
                    id: idx,
                    midi: midi
                }))

                setStrings(strings_);
                setNoteToColor(data.notetocolor);
                setColor('#ff5c5c');

                setInterfaces(prev =>
                    prev.map(f =>
                        f.id === 1
                            ? { ...f, strings: strings_, noteToColor: data.notetocolor, color: '#ff5c5c' }
                            : f
                    )
                );
                setCurFretboardId(1);
            } catch (err) {
                console.error(err);
            }
        }
        fetchFretboard();
    }, [id]);

    const [interfaces, setInterfaces] = useState(
        Array.from({length: 10}, (_, i) => ({
            id: i + 1,
            strings: standardTuning,
            color: '#ff5c5c',
            noteToColor: {}
        }))
    );

    const [curFretboardId, setCurFretboardId] = useState(1);
    const [prevFretboardId, setPrevFretboardId] = useState(-1);

    useEffect(() => {
        setInterfaces(prev =>
            prev.map(f =>
                f.id === prevFretboardId
                    ? { ...f, strings, noteToColor, color }
                    : f
            )
        );
    }, [prevFretboardId]); 

    useEffect(() => {
        const cur = interfaces.find(f => f.id === curFretboardId);
        setStrings(cur.strings);
        setNoteToColor(cur.noteToColor);
        setColor(cur.color);
    }, [curFretboardId]); 

    return (
        <>
            <div className="fretboard-container">
                <div className="fretboard-title"><IoMdMusicalNote style={{ transform: 'translateY(5px)'}} />Fretboard Diagram Maker</div>
                
                <Interface
                    strings={strings}
                    setStrings={setStrings}
                    noteToColor={noteToColor}
                    setNoteToColor={setNoteToColor}
                    color={color}
                    setColor={setColor}
                    curFretboardId={curFretboardId}
                    setCurFretboardId={setCurFretboardId}
                    setPrevFretboardId={setPrevFretboardId}
                />


            </div>
            <div className="info">
                <p className="header"><b>Hotkeys</b>:</p>

                <p className="header"><i>Fretboard</i>:</p>
                <p><kbd>w</kbd> → extend fretboard from left, <kbd>s</kbd> → shrink fretboard from left,</p>
                <p><kbd>d</kbd> → extend fretboard from right, <kbd>a</kbd> → shrink fretboard from right</p>

                <p className="header"><i>Switch Fretboard</i>:</p>
                <p><kbd>1</kbd> → first fretboard, <kbd>2</kbd> → second fretboard, etc.</p>

                <p className="header"><i>Colors</i>:</p>
                <p><kbd>Esc</kbd> → no color, <kbd>r</kbd> → red, <kbd>o</kbd> → orange, <kbd>y</kbd> → yellow,
                <kbd>g</kbd> → green, <kbd>l</kbd> → light blue, <kbd>b</kbd> → blue, <kbd>p</kbd> → purple, <kbd>m</kbd> → magenta</p>
                <p><kbd>Shift + r</kbd> → light red, etc.</p>

                <p className="header"><b>What do the numbers after notes mean?</b></p>
                <p>
                    The numbers after notes indicate their octave using scientific pitch notation.
                    For example, <b>C4</b> is middle C, <b>A4</b> is the A above middle C, and <b>G3</b> is the G below middle C.
                </p>
                <p>
                    On a standard tuned guitar (E A D G B E), the strings correspond to: <b>E2</b>, <b>A2</b>, <b>D3</b>, <b>G3</b>, <b>B3</b>, <b>E4</b>.
                </p>
            </div>
        </>
    );
}

export default InterfaceManager;