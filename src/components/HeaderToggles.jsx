
import '../elements/Toggle.css';
import { MdLightMode, MdOutlineLightMode } from "react-icons/md";
import { FaHandPointLeft, FaHandPointRight } from "react-icons/fa";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

export const HeaderToggles = ({
    playAudio,
    setPlayAudio,
    lefty,
    setLefty,
    isDarkMode,
    setIsDarkMode,
}) => {
    return (
        <div className="toggle-btns">
            <div className="toggle-and-label">
                <button
                    className="toggle-audio"
                    aria-label={playAudio ? "Mute audio" : "Unmute audio"}
                    onClick={() => setPlayAudio(prev => !prev)}>
                    {playAudio ? <HiVolumeUp size={30} /> : <HiVolumeOff size={30} />}
                </button>
            </div>

            <div className="toggle-and-label">
                <button
                    className="toggle-hand"
                    aria-label={lefty ? "Switch to right-handed" : "Switch to left-handed"} 
                    onClick={() => setLefty(prev => !prev)}>
                    {lefty ? < FaHandPointLeft size={30} /> : <FaHandPointRight size={30} />}
                </button>
            </div>

            <div className="toggle-and-label">
                <button 
                    className="toggle-dark-mode"
                    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={() => setIsDarkMode(prev => !prev)}>
                    {isDarkMode ? < MdOutlineLightMode size={30} /> : <MdLightMode size={30} />}
                </button>
            </div>            
        </div>
    )
}