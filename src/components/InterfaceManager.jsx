import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Interface from './Interface.jsx'

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

    const [firstVisibleFretIndex, setFirstVisibleFretIndex] = useState(0);
    const [lastVisibleFretIndex, setLastVisibleFretIndex] = useState(12);

    const noteLabelArr = ['Octave', 'No Octave', 'Interval', 'Blank'];
    const [noteLabel, setNoteLabel] = useState(0);

    const [keyForInterval, setKeyForInterval] = useState('C');

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
                // console.log("DATA=",data);
                // console.log("NOTETOCOLOR=",data.notetocolor);
                const midiString = data.tuning;
                const midiValues = midiString.split("_").map(Number);
                const strings_ = midiValues.map((midi, idx) => ({
                    id: idx,
                    midi: midi
                }))

                setStrings(strings_);
                setNoteToColor(data.notetocolor);
                setColor('#ff5c5c');
                setNoteLabel(data.noteLabel);
                setKeyForInterval(data.keyForInterval);

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
            noteToColor: {},
            firstVisibleFretIndex: 0,
            lastVisibleFretIndex: 12
        }))
    );

    const [curFretboardId, setCurFretboardId] = useState(1);
    const [prevFretboardId, setPrevFretboardId] = useState(-1);

    useEffect(() => {
        setInterfaces(prev =>
            prev.map(f =>
                f.id === prevFretboardId
                    ? { ...f, strings, noteToColor, color, firstVisibleFretIndex, lastVisibleFretIndex }
                    : f
            )
        );
    }, [prevFretboardId]); 

    useEffect(() => {
        const cur = interfaces.find(f => f.id === curFretboardId);
        setStrings(cur.strings);
        setNoteToColor(cur.noteToColor);
        setColor(cur.color);
        setFirstVisibleFretIndex(cur.firstVisibleFretIndex);
        setLastVisibleFretIndex(cur.lastVisibleFretIndex);
    }, [curFretboardId]); 

    return (
        <>
            <div className="fretboard-container">
                
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

                    noteLabelArr={noteLabelArr}
                    noteLabel={noteLabel}
                    setNoteLabel={setNoteLabel}
                    keyForInterval={keyForInterval}
                    setKeyForInterval={setKeyForInterval}

                    firstVisibleFretIndex={firstVisibleFretIndex}
                    setFirstVisibleFretIndex={setFirstVisibleFretIndex}
                    lastVisibleFretIndex={lastVisibleFretIndex}
                    setLastVisibleFretIndex={setLastVisibleFretIndex}
                />
            </div>
        </>
    );
}

export default InterfaceManager;