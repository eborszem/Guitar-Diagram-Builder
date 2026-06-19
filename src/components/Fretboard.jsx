import { useEffect, useState } from 'react'
import '../elements/Fretboard.css';
import Soundfont from 'soundfont-player';

export const FretboardInterface = ({
    fretboard,
    fretboards,
    curFretboardId,
    setCurFretboardId,
    updateFretboard,
    color,
    setColor,
    isColorPickerMode,
    setIsColorPickerMode,
    toggles,
    formatNote
}) => {

    const {isDarkMode, lefty, playAudio} = toggles;
    
    const firstVisibleFretIndex = fretboard.firstVisibleFretIndex;
    const lastVisibleFretIndex = fretboard.lastVisibleFretIndex;
    const noteToColor = fretboard.noteToColor;

    const numFrets = lastVisibleFretIndex - firstVisibleFretIndex + 1;
    
    useEffect(() => {
        // console.log("noteToColor changed:", noteToColor);
    }, [noteToColor]);
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

        const noteToColor = fretboard.noteToColor;
        if (isColorPickerMode) {
            setIsColorPickerMode(false);
            if (!(noteToColor[`${note}-${stringIndex}`])) {
                setColor("none");
                return;
            }
            setColor(noteToColor[`${note}-${stringIndex}`]);
            return;
        }
        
        // console.log("start---------");
        // console.log(color);
        // console.log(noteToColor);
        // console.log("end---------");
        if ((color === noteToColor[`${note}-${stringIndex}`])) {  // or if the user clicks a note with the same color, reset it
            // console.log("if1:"+noteColor);
            delete noteToColor[`${note}-${stringIndex}`];
            updateFretboard(fretboard.id, { noteToColor });
            // console.log("-noteToColor:");
            // for (const [key, value] of Object.entries(noteToColor)) { console.log(key, value); }

            // console.log("color="+color);
        } else if (color !== 'none') { // if a color has been set, then apply it to the note
            // console.log("if2:"+noteColor);
            // console.log("[`${note}-${stringIndex}`]: color => " + note +", "+stringIndex + ": " +color);
            updateFretboard(fretboard.id, {
                noteToColor: {
                    ...noteToColor,
                    [`${note}-${stringIndex}`]: color
                }
            });
            // console.log("-noteToColor:");
            // for (const [key, value] of Object.entries(noteToColor)) { console.log(key, value); }
            // console.log("color="+color);
        }
    };

    // noteMidiValue: the midi value of a note (64 => E4 note)
    // getStringNotes returns all the notes that belong to the string
    const getStringNotes = (noteMidiValue) => {
        
        let stringNotes = [];
        const startIndex = noteMidiValue;
        const startIndexWithOffset = startIndex + firstVisibleFretIndex; // add firstVisibleFretIndex offset user sets
        if (lefty) {
            for (let i = startIndex + lastVisibleFretIndex; i >= startIndexWithOffset; i--) {
                stringNotes.push(i);
            }
        } else {
            // console.log("startIndexWithOffset="+startIndexWithOffset+"; startIndex="+startIndex+"; lastVisibleFretIndex="+lastVisibleFretIndex);
            for (let i = startIndexWithOffset; i < startIndex + lastVisibleFretIndex + 1; i++) {
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
            if (lastVisibleFretIndex === numFrets - 1) {
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
            return lastVisibleFretIndex === numFrets - 1 && fretIndex === numFrets - 2;
        else
            return firstVisibleFretIndex === 0 && fretIndex === 0;
    };

    const fretLabels = () => {
        let arr = Array.from(
            { length: lastVisibleFretIndex - firstVisibleFretIndex + 1},
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
        <div 
            id="fretboard-interface"
            // className="fretboard-interface"  
            className={`fretboard-interface ${fretboard.id === curFretboardId ? 'active' : 'inactive'}`}
            style={{
                minWidth: `${(numFrets) * 75}px`,
                cursor: curFretboardId === fretboard.id ? "auto" : "pointer",
            }}
            onClick={() => {
                if (curFretboardId !== fretboard.id) {
                    setCurFretboardId(fretboard.id);
                }
            }}
        >
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

                <div className="string-container" style={{ minWidth: `${numFrets * 75}px` }}>
                    {fretboard.strings.map((stringObj) => (
                    <div className="string" key={stringObj.id}>
                        <div className="string-notes">
                            {/* now map the notes onto the string just generated */}
                            {getStringNotes(stringObj.midi).map((note, j) => 
                                // audible midi range is [0, 109]
                                note < 109 && (
                                    <button
                                        key={`${note}-${stringObj.id}`}
                                        // only hide notes that don't have a color given to them
                                        className={`note ${(fretboard.hideNotes && !noteToColor[note + "-" + stringObj.id]) ? 'hidden' : ''}`}
                                        style={{
                                            left: `${getNotePositions()[j]}%`,
                                            // backgroundColor: noteColorArr[note]
                                            backgroundColor: noteToColor[`${note}-${stringObj.id}`] != null ? noteToColor[`${note}-${stringObj.id}`] : '',
                                            pointerEvents: curFretboardId === fretboard.id ? "auto" : "none"
                                        }}
                                        onClick={() => selectNote(note, stringObj.id)}
                                    >
                                        {/* {note}.{stringObj.id} */}
                                        {/* {note} */}
                                        {formatNote(note, fretboard.id, false)}
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
                                backgroundColor: isZerothFret(i) ? (isDarkMode ? "#727272" : "black") : (isDarkMode ? "#434343" : "#717171")
                            }}
                        >
                        </div>
                    )
                })}
            </div>
        </div>
    )
}