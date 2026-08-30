import { React, useEffect, useState } from 'react'
import { FretboardInterface } from './Fretboard.jsx';
import { Toggles } from './Toggles.jsx';
import { HeaderToggles } from './HeaderToggles.jsx';
import { ColorSelector } from './ColorSelector.jsx';
import { Tuning } from './Tuning.jsx';
import { Scale } from './Scale.jsx';
import { Arpeggio } from './Arpeggio.jsx';
import { NeckSetup } from './NeckSetup.jsx';
import { Download } from './Download.jsx';
import { IoIosMusicalNote } from 'react-icons/io';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import '../elements/Interface.css';

function Interface() {
    const [curFretboardId, setCurFretboardId] = useState(uuidv4());
    const standardTuning = [
        {id: 0, midi: 64},  // E4
        {id: 1, midi: 59},  // B3
        {id: 2, midi: 55},  // G3
        {id: 3, midi: 50},  // D3
        {id: 4, midi: 45},  // A2
        {id: 5, midi: 40},  // E2
    ];
    
    // enum
    const NOTE_LABELS = {
        SPN: 'octave',
        NO_SPN: 'no octave',
        INTERVAL: 'degree',
        BLANK: 'blank'
    }

    const defaultFretboard = {
        id: curFretboardId,
        noteLabel: NOTE_LABELS.SPN,
        strings: [...standardTuning],
        color: '#5c67ff',
        noteToColor: {},
        firstVisibleFretIndex: 0,
        lastVisibleFretIndex: 12,
        hideNotes: false,
        showSharps: true,
    };

    const [fretboards, setFretboards] = useState([defaultFretboard]);

    const [keyForInterval, setKeyForInterval] = useState('C');
    const [root, setRoot] = useState('C');

    // global toggles
    const useToggleState = (key, defaultVal) => {
        const [val, setVal] = useState(() => {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultVal;
        });

        useEffect(() => { 
            localStorage.setItem(key, JSON.stringify(val));
        }, [key, val]);

        return [val, setVal];
    };

    const [playAudio, setPlayAudio] = useToggleState('playAudio', true);

    const [lefty, setLefty] = useToggleState('lefty', false);

    const [isDarkMode, setIsDarkMode] = useToggleState('isDarkMode', false);

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // coloring for notes
    const [color, setColor] = useState('#5c67ff');
    const [colorBank] = useState(['#ff5c5c', '#ffbf5c', '#fff85c', '#9cff5c', '#5cf0ff', '#5c67ff', '#b25cff', '#ff5cfd']);
    const [colorBankLight] = useState(['#ffbebe','#ffe5be','#fffcbe','#d7ffbe','#bef9ff', '#c1beff', '#e0beff','#ffbefe']);
    const [isColorPickerMode, setIsColorPickerMode] = useState(false);
    
    // fretboard crud functions
    const addFretboard = () => {
        const newId = uuidv4();
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
    
    const getFretboard = (id) => {
        // const fb = fretboards.find(fretboard => fretboard.id === id);
        // for (const str of fb.strings) {
        //     console.log(str.id + ', midi=' + str.midi);
        // }
        // return fb;
        return fretboards.find(fretboard => fretboard.id === id);
    }

    const updateFretboard = (id, updates) => {
        setFretboards(prev =>
            prev.map(fretboard => fretboard.id === id ? { ...fretboard, ...updates } : fretboard)
        );
    }

    const deleteFretboard = (id) => {
        const confirm = window.confirm('Are you sure you want to delete this fretboard? This action cannot be undone. This will only affect the currently selected fretboard.');
        if (!confirm) return;
        setFretboards(prev => {
            const idx = prev.findIndex(f => f.id === id);
            const prevFretboard = idx < prev.length - 1 ? prev[idx + 1] : prev[0];
            setCurFretboardId(prevFretboard.id);
            return prev.filter(f => f.id !== id);
        });
    };

    // useEffect(() => {
    //     console.log('all fretboards:', fretboards);
    // }, [fretboards]);

    // converts midi note value to spn (64 --> E4, 59 --> B3)
    const formatNote = (midiNoteValue, id, mandatorySPN = false) => {
        const fretboard = getFretboard(id);
        const noteLabel = fretboard.noteLabel;
        const notes = fretboard.showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

        if (noteLabel === NOTE_LABELS.INTERVAL && !mandatorySPN) {
            let keyMidi = notes.indexOf(keyForInterval); // first midi value of key (key of f will be 5, c will be 0, etc)
            let note = midiNoteValue % notes.length;
            if (keyMidi > note) {
                note += 12;
            }
            const intervals = fretboard.showSharps
                ? ['1', '#1', '2', '#2', '3', '4', '#4', '5', '#5', '6', '#6', '7']
                : ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
            return <>{intervals[note - keyMidi]}</>
        }

        const note = notes[midiNoteValue % notes.length];
        const octave = Math.floor(midiNoteValue / notes.length) - 1;
        if (noteLabel === NOTE_LABELS.SPN || mandatorySPN) { 
            return (
                <p style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    margin: 0
                }}>
                    <span>{note}</span>
                    <span
                        style={{
                            fontSize: '0.85em',
                            lineHeight: 1,
                            transform: 'translateY(2px)'
                        }}
                    >
                        {octave}
                    </span>
                </p>
            ) 
        }
        return noteLabel === NOTE_LABELS.NO_SPN ? <>{note}</> : <></>;
    };

    useEffect(() => {
        document.documentElement.style.overscrollBehavior = 'none';
        document.body.style.overscrollBehavior = 'none';
        return () => {
            document.documentElement.style.overscrollBehavior = '';
            document.body.style.overscrollBehavior = '';
        };
    }, []);

    return (
        <div className="app">
            <div className="header">
                <div className="title">
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
                <div className="toggles">
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
            <div className="interface">
                <div className="settings">
                    <div className="settings-block">
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
                            <Toggles
                                curFretboardId={curFretboardId}
                                setCurFretboardId={setCurFretboardId}
                                fretboard={getFretboard(curFretboardId)}
                                updateFretboard={updateFretboard}
                                setRoot={setRoot}
                                keyForInterval={keyForInterval}
                                setKeyForInterval={setKeyForInterval}
                                NOTE_LABELS={NOTE_LABELS}
                            />
                        </div>
                    </div>
                    <div className="settings-block">
                        <Download
                            NOTE_LABELS={NOTE_LABELS}
                            fretboard={getFretboard(curFretboardId)}
                            updateFretboard={updateFretboard}
                            defaultFretboard={defaultFretboard}
                            addFretboard={addFretboard}
                            isDarkMode={isDarkMode}
                            keyForInterval={keyForInterval}
                            setKeyForInterval={setKeyForInterval}
                        />
                    </div>
                </div>
                <div className="fretboard-display">
                    <Tuning
                        fretboard={getFretboard(curFretboardId)}
                        fretboards={fretboards}
                        updateFretboard={updateFretboard}
                        formatNote={formatNote}
                        root={root}
                        setRoot={setRoot}
                    />
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
                                toggles={{ isDarkMode, lefty, playAudio }}
                                isColorPickerMode={isColorPickerMode}
                                setIsColorPickerMode={setIsColorPickerMode}
                                formatNote={formatNote}
                            />
                            {fretboard.id === curFretboardId &&
                                <div className="add-remove-fretboard-btns">
                                    <button
                                        onClick={() => addFretboard()}>
                                        <FaPlus/>
                                    </button>
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
    )
}

export default Interface;