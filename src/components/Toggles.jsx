
import '../elements/Toggle.css';
import { FaHashtag } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { BsFillTrashFill } from "react-icons/bs";
import Icon from '@mdi/react';
import { mdiAlphaC, mdiAlphaX, mdiNumeric3, mdiNumeric1 } from '@mdi/js';

export const Toggles = ({
    fretboard,
    updateFretboard,
    NOTE_LABELS,
    setRoot,
    keyForInterval,
    setKeyForInterval
}) => {
    const notes = fretboard.showSharps
        ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

        const nextNoteLabel = (label) => {
            const labels = Object.values(NOTE_LABELS);
            const currentIndex = labels.indexOf(label);
            return labels[(currentIndex + 1) % labels.length];
        }

    return (
        <div className="toggle-container">
            <p className="settings-block-header" id="no-margin">toggles</p>
            <div className="toggle-btns">
                <div className="toggle-and-label">
                    <button className="toggle-notes"  aria-label={fretboard.hideNotes ? "Show all notes" : "Show marked notes"} onClick={() => updateFretboard(fretboard.id, { hideNotes: !fretboard.hideNotes })}>
                        {fretboard.hideNotes ? <FaEyeSlash size={37} /> : <FaEye size={35} />}
                    </button>
                    <span className="label-text">
                        {fretboard.hideNotes ? "marked": "all"}
                    </span>
                </div>

                <div className="toggle-and-label">
                    <button
                        className="toggle-sharps-flats"
                        aria-label={fretboard.showSharps ? "Switch to flats" : "Switch to sharps"}
                        onClick={() =>{
                            updateFretboard(fretboard.id, { showSharps: !fretboard.showSharps });
                            setRoot(prev => {
                                const sharps = [
                                    "C", "C#", "D", "D#", "E", "F",
                                    "F#", "G", "G#", "A", "A#", "B"
                                ];
                                const flats  = [
                                    "C", "Db", "D", "Eb", "E", "F",
                                    "Gb", "G", "Ab", "A", "Bb", "B"
                                ];
                                if (fretboard.showSharps) {
                                    const idx = sharps.indexOf(prev);
                                    return idx !== -1 ? flats[idx] : prev;
                                } else {
                                    const idx = flats.indexOf(prev);
                                    return idx !== -1 ? sharps[idx] : prev;
                                }
                            })
                        }}
                    >
                        {fretboard.showSharps ? <FaHashtag size={35} /> : <p style={{ fontSize: "50px", fontWeight: "bold", marginTop: "53px" }}>♭</p>}
                    </button>
                    <span className="label-text">
                        {fretboard.showSharps ? "sharps" : "flats"}
                    </span>
                </div>

                <div className="toggle-and-label">
                    <button
                        className={"toggle-note-label"}
                        aria-label={`Switch note labels to ${nextNoteLabel(fretboard.noteLabel)}`}
                        onClick={() =>
                            updateFretboard(fretboard.id, { noteLabel: nextNoteLabel(fretboard.noteLabel) })
                        }
                    >
                        {fretboard.noteLabel === NOTE_LABELS.SPN && (
                            <div className="icons">
                                <div className="icon"><Icon path={mdiAlphaC} size={2.5} /></div>
                                <div className="icon"><Icon path={mdiNumeric3} size={1.75} /></div>
                            </div>
                        )}
                        {fretboard.noteLabel === NOTE_LABELS.NO_SPN && <div className="icon"><Icon path={mdiAlphaC} size={2.5} /></div>}
                        {fretboard.noteLabel === NOTE_LABELS.INTERVAL && <div className="icon"><Icon path={mdiNumeric1} size={2.5} /></div>}
                        {fretboard.noteLabel === NOTE_LABELS.BLANK && <div className="icon"><Icon path={mdiAlphaX} size={2.5} /></div>}
                    </button>
                    <span className="label-text">
                        {fretboard.noteLabel}
                    </span>
                </div>

                {fretboard.noteLabel === NOTE_LABELS.INTERVAL && (
                    <div className="key-select">
                        <p className="key-text">root</p>
                        <select className="scale-dropdown" value={keyForInterval} onChange={((e) => {setKeyForInterval(e.target.value)})}>
                            {notes.map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                )}

                <div className="toggle-and-label">
                    <button className="delete" aria-label="Clear current fretboard" onClick={() => {
                        const confirm = window.confirm("Are you sure you want to clear this fretboard? This action cannot be undone. This will only affect the currently selected fretboard.");
                        if (confirm) {
                            updateFretboard(fretboard.id, { noteToColor: {} })
                            setRoot("C");
                        }
                    }}>
                        <BsFillTrashFill size={30} />
                    </button>
                    <span className="label-text">
                        clear
                    </span>
                </div>
                
            </div>
        </div>
    )
}