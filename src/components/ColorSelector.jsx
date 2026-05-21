import { useState } from 'react'

import '../elements/Color.css';

import { MdFormatColorReset } from "react-icons/md";
import { CgColorPicker } from "react-icons/cg";

export const ColorSelector = ({
    colorBank,
    colorBankLight,
    color,
    setColor,
    setIsColorPickerMode,
    isColorPickerMode 
}) => {

    const [allColors] = useState(() => 
        colorBank.flatMap((color, index) => [color, colorBankLight[index]])
    );
    return (
        <div className="color-container">
            <p className="color-text">colors</p>
            <div className="toggle-btns">
                <div className="color-and-label">
                    <button
                        className={`unset-color-btn ${color === 'none' ? 'selected' : ''}`}
                        onClick={() => {
                            setColor('none');
                            setIsColorPickerMode(false);
                        }}
                        title="No Color"
                    >
                        <MdFormatColorReset />
                    </button>
                    {"No Color"}
                </div>

                <div className="color-and-label">
                    <input
                        type="color"
                        value={color === 'none' ? '#000000' : color}
                        onChange={(e) => {
                            setColor(e.target.value);
                            setIsColorPickerMode(false);
                        }}
                        className={`color ${color !== 'none' ? 'selected' : ''}`}
                    />
                    {"Color"}
                </div>

                <div className="color-and-label">
                    <button
                        value={color === 'none' ? '#000000' : color}
                        onClick={(e) => {
                            setIsColorPickerMode(prev => !prev);
                        }}
                        className={`color-picker ${isColorPickerMode ? 'selected' : ''}`}
                    >
                        <CgColorPicker size={30}/>
                    </button>
                        {isColorPickerMode }
                    {"Color Picker"}
                </div> 
            </div>

            <div className="preset-colors">
                {allColors.map((c, index) => (
                        <div
                            key={index}
                            type="color"
                            value={c}
                            onClick={() => {
                                setColor(c);
                                setIsColorPickerMode(false);
                            }}
                            style={{ backgroundColor: c }}
                            className={`color ${color === c ? 'selected' : ''}`}
                        />
                    ))}
            </div>
        </div>
    );
};