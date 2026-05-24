
import '../elements/Toggle.css';

import { React, useEffect, useState } from 'react'
import { IoMoon, IoSunny } from "react-icons/io5";
import { FaHashtag, FaHandPointLeft, FaHandPointRight } from "react-icons/fa";
import { FaEye, FaEyeSlash, FaShare, FaTrashCan } from "react-icons/fa6";
import { BsFillTrashFill } from "react-icons/bs";
import Icon from '@mdi/react';
import { mdiAlphaC, mdiAlphaX, mdiNumeric3, mdiRomanNumeral1 } from '@mdi/js';
import { IoIosTrash } from "react-icons/io";

export const FretboardToggles = ({
    hideNotes, setHideNotes,
    showSharps, setShowSharps,
    onShare,
    setRoot,
    setNoteToColor,
    noteLabel, setNoteLabel, noteLabelArr, keyForInterval, setKeyForInterval
}) => {
    const notesArr = noteLabel !== 3 ? (
        showSharps
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    ) : (
        showSharps
            ? ['I', 'I#', 'II', 'II#', 'III', 'IV','IV#', 'V', 'V#', 'VI', 'VI#', 'VII']
            : ['I', 'IIb', 'II', 'IIIb', 'III', 'IV','Vb', 'V', 'VIb', 'VI', 'VIIb', 'VII']
    );
    return (
        <div className="toggle-container">
            <p className="toggle-text">toggles</p>
            <div className="toggle-btns">
                <div className="toggle-and-label">
                    <button className="toggle-notes" onClick={() => setHideNotes(prev => !prev)}>
                        {hideNotes ? <FaEyeSlash size={35} /> : <FaEye size={35} />}
                    </button>
                    {hideNotes ? "Marked": "All"}
                </div>

                <div className="toggle-and-label">
                    <button
                        className="toggle-sharps-flats"
                        onClick={() =>{
                            setShowSharps(prev => !prev);
                            setRoot(prev => {
                                const sharps = [
                                    "C", "C#", "D", "D#", "E", "F",
                                    "F#", "G", "G#", "A", "A#", "B"
                                ];
                                const flats  = [
                                    "C", "Db", "D", "Eb", "E", "F",
                                    "Gb", "G", "Ab", "A", "Bb", "B"
                                ];
                                // convert sharp → flat or flat → sharp
                                if (showSharps) {
                                    const idx = sharps.indexOf(prev);
                                    return idx !== -1 ? flats[idx] : prev;
                                } else {
                                    const idx = flats.indexOf(prev);
                                    return idx !== -1 ? sharps[idx] : prev;
                                }
                            })
                        }}
                    >
                        {showSharps ? <FaHashtag size={35} /> : <p style={{ fontSize: "40px", fontWeight: "bold", marginTop: "35px" }}>♭</p>}
                    </button>
                    {showSharps ? "Sharps" : "Flats"}
                </div>

                <div className="toggle-and-label">
                    <button
                        className={"toggle-note-label"}
                        onClick={() =>
                            setNoteLabel((prev) => (prev + 1) % noteLabelArr.length)
                        }
                    >
                        {noteLabel === 0 && (
                            <div className="icons">
                                <div className="icon"><Icon path={mdiAlphaC} size={2.5} /></div>
                                <div className="icon"><Icon path={mdiNumeric3} size={1.75} /></div>
                            </div>
                        )}
                        {noteLabel === 1 && <div className="icon"><Icon path={mdiAlphaC} size={2.5} /></div>}
                        {noteLabel === 2 && <div className="icon"><Icon path={mdiRomanNumeral1} size={2.5} /></div>}
                        {noteLabel === 3 && <div className="icon"><Icon path={mdiAlphaX} size={2.5} /></div>}
                    </button>
                    {noteLabelArr[noteLabel]}
                </div>

                {noteLabel === 2 && (
                    <div className="key-select">
                        <p className="key-text">Root</p>
                        <select className="scale-dropdown" value={keyForInterval} onChange={((e) => {setKeyForInterval(e.target.value)})}>
                            {notesArr.map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                )}

                {/* <div className="toggle-and-label">
                    <button className="share" onClick={onShare}>
                        <FaShare size={30} />
                    </button>
                    Share link
                </div> */}

                <div className="toggle-and-label">
                    <button className="delete" onClick={() => {
                        const confirm = window.confirm("Are you sure you want to clear the fretboard? This action cannot be undone.");
                        if (confirm) {
                            setNoteToColor({});
                            setRoot("C");
                        }
                    }}>
                        <BsFillTrashFill size={30} />
                    </button>
                    Clear
                </div>
                
            </div>
        </div>
    )
}