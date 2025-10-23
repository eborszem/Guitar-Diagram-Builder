
import '../elements/Toggle.css';

import { IoVolumeMedium, IoVolumeOff, IoMoon, IoSunny } from "react-icons/io5";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaHandPointLeft, FaHandPointRight } from "react-icons/fa";
import { FaShare, FaTrashCan } from "react-icons/fa6";

export const FretboardToggles = ({
    hideNotes, setHideNotes,
    playAudio, setPlayAudio,
    showSharps, setShowSharps,
    lefty, setLefty,
    isDarkMode, setIsDarkMode,
    onShare,
    setRoot,
    setNoteToColor
}) => {
    return (
        <div className="toggle-btns">
            <div className="toggle-and-label">
                <button className="toggle-notes" onClick={() => setHideNotes(prev => !prev)}>
                    {hideNotes ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
                {hideNotes ? "Highlights": "All"}
            </div>

            <div className="toggle-and-label">
                <button className="toggle-audio" onClick={() => setPlayAudio(prev => !prev)}>
                    {playAudio ? <IoVolumeMedium /> : <IoVolumeOff />}
                </button>
                {playAudio ? "Audio on" : "Audio off"}
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
                    {showSharps ? '♯' : '♭'}
                </button>
                {showSharps ? "Sharps" : "Flats"}
            </div>

            <div className="toggle-and-label">
                <button className="toggle-hand" onClick={() => setLefty(prev => !prev)}>
                    {lefty ? < FaHandPointLeft size={30} /> : <FaHandPointRight size={30} />}
                </button>
                {lefty ? "Lefty" : "Righty"}
            </div>


            <div className="toggle-and-label">
                <button className="toggle-dark-mode" onClick={() => setIsDarkMode(prev => !prev)}>
                    {isDarkMode ? < IoMoon size={30} /> : <IoSunny size={30} />}
                </button>
                {isDarkMode ? "Dark mode" : "Light mode"}
            </div>

            <div className="toggle-and-label">
                <button className="share" onClick={onShare}>
                    <FaShare size={30} />
                </button>
                Share link
            </div>

            <div className="toggle-and-label">
                <button className="delete" onClick={() => {
                    const confirm = window.confirm("Are you sure you want to clear the fretboard? This action cannot be undone.");
                    if (confirm) {
                        setNoteToColor({});
                        setRoot("C");
                    }
                }}>
                    <FaTrashCan size={30} />
                </button>
                Clear
            </div>
        </div>
    )
}