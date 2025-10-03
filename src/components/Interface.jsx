import { React, useEffect, useState } from 'react'
import '../elements/Interface.css';
import { FretControls } from './Controls.jsx';
import Soundfont from 'soundfont-player';



export const FretboardInterface = ({ strings, toggles, noteColor, formatNote }) => {

    const [noteToColor, setNoteToColor] = useState({});
    const {hideNotes, isDarkMode, lefty, playAudio} = toggles;
    const {color, setColor, colorBank, colorBankLight} = noteColor;
    
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
        
    // fret is 0-indexed, so the first fret is 0, second fret is 1, etc.
    // playing the open strings (in standard tuning, [E, A, D, G, B, e]) is the equivalent of playing the 0th fret
    const [firstVisibleFretIndex, setFirstVisibleFretIndex] = useState(0); // value changes when the user expands or shrinks the fretboard from the left side
    const [lastVisibleFretIndex, setLastVisibleFretIndex] = useState(16); // value changes when the user expands or shrinks the fretboard from the right side

    const numFrets = lastVisibleFretIndex - firstVisibleFretIndex;

    // functions for modifying the visible frets on the fretboard
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
    }, [onIncreaseLeft, onDecreaseLeft, onIncreaseRight, onDecreaseRight, setColor, colorBank, colorBankLight]);

    // generate midi notes for the fretboard
    // allNotes is an array of midi notes from 0 to 127, representing all possible notes in midi

    // for (let midi = 0; midi <= 200; midi++) { // E1 = 28, G7 = 103
    //     if (midi % 12 === 7 || midi % 12 === 0 || midi % 12 === 4 ) {
    //         for (let stringIndex = 0; stringIndex <= 12; stringIndex++) {
    //             noteToColor[`${midi}-${stringIndex}`] = '#ff5c5c';
    //         }
    //     } else if (midi % 12 === 2 || midi % 12 === 5 || midi % 12 === 9 || midi % 12 === 11) {
    //         for (let stringIndex = 0; stringIndex <= 12; stringIndex++) {
    //             noteToColor[`${midi}-${stringIndex}`] = '#ffbebe';
    //         }
    //     }
    // }


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


    // startingNote: the midi value of a note (64 => E4 note)
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

    // midi note to letter note conversion, returns react element
    

    
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
    

    const fretLabels = () => {
        let arr = Array.from(
            { length: lastVisibleFretIndex - firstVisibleFretIndex },
            (_, i) => firstVisibleFretIndex + i
        );
        return lefty ? arr.reverse() : arr;
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
                    if (i === numFrets - 1) return <></>;
                        return ( 
                            <div 
                                className="fret-marker" 
                                style={{ 
                                    left: `${percent}%`,
                                    width: isZerothFret(i) ? "3px" : "2px",
                                    backgroundColor: isZerothFret(i) ? 
                                        (isDarkMode ? "#797979" : "black") : 
                                        (isDarkMode ? "#292929" : "#717171")
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