
import '../elements/Toggle.css';

import { React, useEffect, useState } from 'react'
import { IoVolumeMedium, IoVolumeOff, IoMoon, IoSunny } from "react-icons/io5";
import { MdVisibility, MdVisibilityOff, MdLightMode, MdOutlineLightMode } from "react-icons/md";
import { FaVolumeUp, FaVolumeMute, FaHandPointLeft, FaHandPointRight } from "react-icons/fa";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { FaShare, FaTrashCan } from "react-icons/fa6";
import Icon from '@mdi/react';
import { mdiAlphaC, mdiAlphaX, mdiNumeric3, mdiRomanNumeral1 } from '@mdi/js';

export const HeaderToggles = ({
    playAudio, setPlayAudio,
    lefty, setLefty,
    isDarkMode, setIsDarkMode,
}) => {
    return (
        <div className="toggle-btns">
            <div className="toggle-and-label">
                <button className="toggle-audio" onClick={() => setPlayAudio(prev => !prev)}>
                    {playAudio ? <HiVolumeUp size={30} /> : <HiVolumeOff size={30} />}
                </button>
            </div>

            <div className="toggle-and-label">
                <button className="toggle-hand" onClick={() => setLefty(prev => !prev)}>
                    {lefty ? < FaHandPointLeft size={30} /> : <FaHandPointRight size={30} />}
                </button>
            </div>

            <div className="toggle-and-label">
                <button className="toggle-dark-mode" onClick={() => setIsDarkMode(prev => !prev)}>
                    {isDarkMode ? < MdOutlineLightMode size={30} /> : <MdLightMode size={30} />}
                </button>
            </div>            
        </div>
    )
}