import { useEffect, useState } from 'react'
import '../elements/Fretboard.css';
import { FretControls } from './Controls.jsx';
import Soundfont from 'soundfont-player';

export const FretboardInterface = ({
    noteToColor,
    setNoteToColor,
    strings,
    toggles,
    noteColor,
    formatNote,
    curFretboardId,
    setCurFretboardId,
    setPrevFretboardId
}) => {

    const {hideNotes, isDarkMode, lefty, playAudio} = toggles;
    const {color, setColor, colorBank, colorBankLight} = noteColor;
    
    // fret is 0-indexed, so the first fret is 0, second fret is 1, etc.
    // playing the open strings (in standard tuning, [E, A, D, G, B, e]) is the equivalent of playing the 0th fret
    const [firstVisibleFretIndex, setFirstVisibleFretIndex] = useState(0); // value changes when the user expands or shrinks the fretboard from the left side
    const [lastVisibleFretIndex, setLastVisibleFretIndex] = useState(16); // value changes when the user expands or shrinks the fretboard from the right side
    
    const numFrets = lastVisibleFretIndex - firstVisibleFretIndex;
    
    // if fretboard is left handed, the side being increased or decreased is inverted
    const onIncreaseLeft = () => lefty ? increaseVisibleFretsRight() : increaseVisibleFretsLeft();
    const onDecreaseLeft = () => lefty ? decreaseVisibleFretsRight() : decreaseVisibleFretsLeft();
    const onIncreaseRight = () => lefty ? increaseVisibleFretsLeft() : increaseVisibleFretsRight();
    const onDecreaseRight = () => lefty ? decreaseVisibleFretsLeft() : decreaseVisibleFretsRight();

    // functions for modifying the visible frets on the fretboard
    const increaseVisibleFretsLeft = () => firstVisibleFretIndex > 0 && setFirstVisibleFretIndex(prev => prev - 1);
    const decreaseVisibleFretsLeft = () => numFrets > 3 && setFirstVisibleFretIndex(prev => prev + 1);
    const increaseVisibleFretsRight = () => setLastVisibleFretIndex(prev => prev + 1);
    const decreaseVisibleFretsRight = () => numFrets > 3 && setLastVisibleFretIndex(prev => prev - 1);

    // keyboard shortcuts for increasing/decreasing visible frets
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tagName = e.target.tagName.toLowerCase();
            // user is typing, so ignore
            if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) return;
            const shortcuts = {
                'w': onIncreaseLeft,
                's': onDecreaseLeft,
                'd': onIncreaseRight,
                'a': onDecreaseRight,

                '1': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(1);},
                '2': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(2);},
                '3': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(3);},
                '4': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(4);},
                '5': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(5);},
                '6': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(6);},
                '7': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(7);},
                '8': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(8);},
                '9': () => { setPrevFretboardId(curFretboardId); setCurFretboardId(9);},

                'Escape': () => setColor('none'),
                'R': () => setColor(colorBankLight[0]),
                'r': () => setColor(colorBank[0]),
                'O': () => setColor(colorBankLight[1]),
                'o': () => setColor(colorBank[1]),
                'Y': () => setColor(colorBankLight[2]),
                'y': () => setColor(colorBank[2]),
                'G': () => setColor(colorBankLight[3]),
                'g': () => setColor(colorBank[3]),
                'L': () => setColor(colorBankLight[4]),
                'l': () => setColor(colorBank[4]),
                'B': () => setColor(colorBankLight[5]),
                'b': () => setColor(colorBank[5]),
                'P': () => setColor(colorBankLight[6]),
                'p': () => setColor(colorBank[6]),
                'M': () => setColor(colorBankLight[7]),
                'm': () => setColor(colorBank[7]),
            };
            const action = shortcuts[e.key];
            if (action) action();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onIncreaseLeft, onDecreaseLeft, onIncreaseRight, onDecreaseRight, setColor, colorBank, colorBankLight]);

    // load the soundfont library on page load, prevents audio delay
    const [instrument, setInstrument] = useState(null);
    useEffect(() => {
        const audioCtx = new AudioContext();
        Soundfont.instrument(audioCtx, 'acoustic_guitar_nylon')
            .then((instrument) => {
                setInstrument(instrument);
                instrument.play(60, 0, { gain: 0, duration: 0.01 });
            })
            .catch((error) => {
                console.error('Error loading instrument:', error);
            }
        );
    }, []);

    // midi notes: 57=A3, 52=E3, etc.
    // stringIndex = 0 (top string) to 5 (bottom string)
    // if playAudio is true, play the note when clicked, and if color is set, apply the color to the note
    const selectNote = (note, stringIndex) => {
        if (note > 108) return; // note is out of range, so ignore it

        if (playAudio && instrument) {
            instrument.play(note, 0, { gain: 1, duration: 1.5 });
        }
        // console.log("start---------");
        // console.log(color);
        // console.log(noteToColor);
        // console.log("end---------");
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

    // noteMidiValue: the midi value of a note (64 => E4 note)
    // getStringNotes returns all the notes that belong to the string
    const getStringNotes = (noteMidiValue) => {
        let stringNotes = [];
        const startIndex = noteMidiValue;
        const startIndexWithOffset = startIndex + firstVisibleFretIndex; // add firstVisibleFretIndex offset user sets
        if (lefty) {
            for (let i = startIndex + lastVisibleFretIndex - 1; i >= startIndexWithOffset; i--) {
                stringNotes.push(i);
            }
        } else {
            for (let i = startIndexWithOffset; i < startIndex + lastVisibleFretIndex; i++) {
                stringNotes.push(i);
            }
        }
        return stringNotes;
    };

    // notes should be positioned in the middle of the fret markers
    // exception: the first note of a string (e.g. EADGBE in standard tuning) should be placed slightly before the "zero-th" fret marker
    const getNotePositions = () => {
        let placements = [];
        let firstFretPosition = 100 / numFrets;
        // first notes of the strings (e.g. EADGBE in standard tuning) should be placed slightly before "zero-th" fret marker
        // only do so when its the zero-th fret, even if the user changes its visibility
        if (lefty) {
            let i;
            for (i = 1; i < numFrets; i++) {
                placements.push((firstFretPosition * i) - (firstFretPosition / 2));
            }
            if (lastVisibleFretIndex === numFrets) {
                placements.push((firstFretPosition * i) - firstFretPosition / 1.66);
            } else {
                placements.push((firstFretPosition * i) - (firstFretPosition / 2));
            }
            return placements;
        }
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

    // returns true if fretIndex is on the zero-th fret and the first visible fret is the zero-th fret
    // used for styling, making it apparent where the start of the fretboard is
    const isZerothFret = (fretIndex) => {
        if (lefty)
            return lastVisibleFretIndex === numFrets && fretIndex === numFrets - 2;
        else
            return firstVisibleFretIndex === 0 && fretIndex === 0;
    };

    const canIncreaseLeft = lefty ? true : firstVisibleFretIndex > 0;
    const canDecreaseLeft = lefty ? lastVisibleFretIndex > firstVisibleFretIndex + 1 : firstVisibleFretIndex < lastVisibleFretIndex - 1;
    const canIncreaseRight = lefty ? firstVisibleFretIndex > 0 : true;
    const canDecreaseRight = lefty ? firstVisibleFretIndex < lastVisibleFretIndex - 1 : lastVisibleFretIndex > firstVisibleFretIndex + 1;

    const fretLabels = () => {
        let arr = Array.from(
            { length: lastVisibleFretIndex - firstVisibleFretIndex },
            (_, i) => firstVisibleFretIndex + i
        );
        return lefty ? arr.reverse() : arr;
    };

    const getFretMarkerPositions = (numFrets) => {
        let placements = [];
        let firstFretPosition = 100 / numFrets;
        for (let i = 1; i <= numFrets; i++) {
            placements.push(firstFretPosition * i);
        }
        return placements;
    };

    return (
        <div id="fretboard-interface" className="fretboard-interface" style={{ minWidth: `${(numFrets + 1) * 75}px` }}> {/* adding 1 to numFrets prevents buttons from overflowing */}
            <FretControls
                side="left"
                canIncrease={canIncreaseLeft}
                canDecrease={canDecreaseLeft}
                onIncrease={onIncreaseLeft}
                onDecrease={onDecreaseLeft}
                numFrets={numFrets}
            />

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

                <div className="string-container" style={{minWidth: `${numFrets * 75}px`}}>
                    {strings.map((stringObj) => (
                    <div className="string" key={stringObj.id}>
                        <div className="string-notes">
                            {/* now map the notes onto the string just generated */}
                            {getStringNotes(stringObj.midi, numFrets).map((note, j) => 
                                // audible midi range is [0, 109]
                                note < 109 && (
                                    <button
                                        key={`${note}-${stringObj.id}`}
                                        // only hide notes that don't have a color given to them
                                        className={`note ${(hideNotes && !noteToColor[note + "-" + stringObj.id]) ? 'hidden' : ''}`}
                                        style={{
                                            left: `${getNotePositions()[j]}%`,
                                            // backgroundColor: noteColorArr[note]
                                            backgroundColor: noteToColor[`${note}-${stringObj.id}`] != null ? noteToColor[`${note}-${stringObj.id}`] : ''
                                        }}
                                        onClick={() => selectNote(note, stringObj.id)}
                                    >
                                        {/* {note}.{stringObj.id} */}
                                        {/* {note} */}
                                        {formatNote(note)}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    ))}
                </div>

                {/* fret line dividers */}
                {getFretMarkerPositions(numFrets).map((percent, i) => {
                    if (i === numFrets - 1) return <></>;
                        return ( 
                            <div 
                                className="fret-marker" 
                                style={{ 
                                    left: `${percent}%`,
                                    width: isZerothFret(i) ? "3px" : "2px",
                                    backgroundColor: isZerothFret(i) ? (isDarkMode ? "#797979" : "black") : (isDarkMode ? "#292929" : "#717171")
                                }}
                            >
                            </div>
                        )
                    }
                )}
            </div>

            <FretControls
                side="right"
                canIncrease={canIncreaseRight}
                canDecrease={canDecreaseRight}
                onIncrease={onIncreaseRight}
                onDecrease={onDecreaseRight}
                numFrets={numFrets}
            />
        </div>
    )
}