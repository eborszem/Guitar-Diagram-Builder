
import '../elements/Toggle.css';

import { IoVolumeMedium, IoVolumeOff, IoMoon, IoSunny } from "react-icons/io5";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaHandPointLeft, FaHandPointRight } from "react-icons/fa";

export const FretboardToggles = ({ hideNotes, setHideNotes, playAudio, setPlayAudio, showSharps, setShowSharps, lefty, setLefty, isDarkMode, setIsDarkMode }) => {
    return (
        <div className="toggle-btns">
            <button 
                className="toggle-notes"
                onClick={() => setHideNotes(prev => !prev)}
            >
                {hideNotes ? <MdVisibilityOff /> : <MdVisibility />}
            </button>

            <button
                className="toggle-audio"
                onClick={() => setPlayAudio(prev => !prev)}
            >
                {playAudio ? <IoVolumeMedium /> : <IoVolumeOff />}
            </button>

            <button
                className="toggle-sharps-flats"
                onClick={() => setShowSharps(prev => !prev)}
            >
                {showSharps ? '♯' : '♭'}
            </button>

            <button
                className="toggle-hand"
                onClick={() => setLefty(prev => !prev)}
            >
                {lefty ? < FaHandPointLeft size={30} /> : <FaHandPointRight size={30} />}
            </button>

            <button
                className="toggle-dark-mode"
                onClick={() => setIsDarkMode(prev => !prev)}
            >
                {isDarkMode ? < IoMoon size={30} /> : <IoSunny size={30} />}
            </button>
        </div>
    )
}