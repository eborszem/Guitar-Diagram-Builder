import { useState, useEffect } from "react";
import "./../elements/NeckSetup.css";
import { FaPlus, FaMinus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
export const NeckSetup = ({
    fretboard,
    updateFretboard,
    isDarkMode
}) => {
    const strings = fretboard.strings;
    const onIncreaseHighestString = () => {
        if (strings.length >= 15) return;
        const id = strings.length > 0 ? strings[0].id - 1 : 0;
        updateFretboard(fretboard.id, {
            strings: [
                {id, midi: 64}, // new E4 string
                ...strings
            ]
        });
        // console.log(strings); 
    };

    const onDecreaseHighestString = () => {
        if (strings.length <= 1) return;
        updateFretboard(fretboard.id, {
            strings: strings.slice(1)
        });
        // console.log(strings);
    };

    const onIncreaseLowestString = () => {
        if (strings.length >= 15) return;
        const id = strings.length > 0 ? strings[strings.length - 1].id + 1 : 0;
        updateFretboard(fretboard.id, {
            strings: [
                ...strings,
                {id, midi: 40} // new E2 string
            ]
        });
        // console.log(strings);
    };

    const onDecreaseLowestString = () => {
        if (strings.length <= 1) return;
        updateFretboard(fretboard.id, {
            strings: strings.slice(0, -1)
        });
        // console.log(strings);
    };
    
    const handleFirstChange = (e) => {
        const val = e.target.value;
        if (Number(val) > fretboard.lastVisibleFretIndex) {
            updateFretboard(fretboard.id, { firstVisibleFretIndex: fretboard.lastVisibleFretIndex })
            return;
        } else if (Number(val) < 0) {
            updateFretboard(fretboard.id, { firstVisibleFretIndex: 0 })
            return;
        }
        updateFretboard(fretboard.id, { firstVisibleFretIndex: Number(val)})
    };

    const handleLastChange = (e) => {
        const val = e.target.value;
        if (Number(val) < fretboard.firstVisibleFretIndex) {
            updateFretboard(fretboard.id, { lastVisibleFretIndex: fretboard.firstVisibleFretIndex })
            return;
        } else if (Number(val) < 0) {
            updateFretboard(fretboard.id, { lastVisibleFretIndex: 0 })
            return;
        }
        updateFretboard(fretboard.id, { lastVisibleFretIndex: Number(val)})
    };

    const svg = () => {
        const color = isDarkMode ? "#fffff8" : "black";
        return (
            <svg 
                viewBox="0 0 64 42" 
                width="64px" 
                height="42px" 
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
                xmlns="http://www.w3.org/2000/svg"
                >

                <rect x="7" y="4" width="4" height="36" rx="1.5" ry="1.5" fill={color} />
                <rect x="7" y="3" width="53" height="5" rx="1.5" ry="1.5" fill="#ff4500" />
                <rect x="7" y="11" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="18" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="25" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="31.5" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="38" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
            </svg>
            );
    }

    const svg2 = () => {
        const color = isDarkMode ? "#fffff8" : "black";
        return (
            <svg 
                viewBox="0 0 64 42" 
                width="64px" 
                height="42px" 
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
                xmlns="http://www.w3.org/2000/svg"
                >
                <rect x="7" y="3" width="4" height="36" rx="1.5" ry="1.5" fill={color} />
                <rect x="7" y="3" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="10" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="17" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="24" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="30.5" width="53" height="2.2" rx="0.8" ry="0.8" fill={color} />
                <rect x="7" y="35" width="53" height="5" rx="1.5" ry="1.5" fill="#ff4500" />
            </svg>
        );
    }

    return (
        <div className="neck-setup-interface">
            <p className="neck-setup-text">neck setup</p>

            <div className="neck-setup-input">
                <label htmlFor="first-fret">frets</label>
                <input
                    id="first-fret"
                    type="number"
                    value={fretboard.firstVisibleFretIndex}
                    onChange={handleFirstChange}
                    onBlur={() => updateFretboard(fretboard.id, { firstVisibleFretIndex: Number(fretboard.firstVisibleFretIndex) })}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            updateFretboard(fretboard.id, { firstVisibleFretIndex: Number(fretboard.firstVisibleFretIndex) });
                        }
                    }}
                    style={{ width: "40px", margin: "0 8px" }}
                />

                <label htmlFor="last-fret">to</label>

                <input
                    id="last-fret"
                    type="number"
                    value={fretboard.lastVisibleFretIndex}
                    onChange={handleLastChange}
                    onBlur={() =>
                        updateFretboard(fretboard.id, { lastVisibleFretIndex: Number(fretboard.lastVisibleFretIndex) })
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            updateFretboard(fretboard.id, { lastVisibleFretIndex: Number(fretboard.lastVisibleFretIndex) })
                        }
                    }}
                    style={{ width: "40px", margin: "0 8px" }}
                />
            </div>

            <div className="change-strings">
                <div className="arrows-and-svg">
                    <button type="button" aria-label="Increase highest string" onClick={onIncreaseHighestString}>
                        <IoMdArrowDropup />
                    </button>
                    {svg()}
                    <button type="button" aria-label="Decrease highest string" onClick={onDecreaseHighestString}>
                        <IoMdArrowDropdown />
                    </button>
                </div>
                <div className="arrows-and-svg">
                    <button type="button" aria-label="Increase highest string" onClick={onDecreaseLowestString}>
                        <IoMdArrowDropup />
                    </button>
                    {svg2()}
                    <button type="button" aria-label="Decrease highest string" onClick={onIncreaseLowestString}>
                        <IoMdArrowDropdown />
                    </button>
                </div>
            </div>
            
            {/* <div className="neck-setup-strings">
                <div className="generate-scale">
                    {svg()}
                    <div className="neck-setup-string-control-group">
                        <button type="button" aria-label="Increase highest string" onClick={onIncreaseHighestString}>
                            <FaPlus />
                        </button>
                        <button type="button" aria-label="Decrease highest string" onClick={onDecreaseHighestString}>
                            <FaMinus />
                        </button>
                    </div>
                </div>
                <div className="generate-scale">
                    <label className="string-label">Bottom String</label>
                    <div className="neck-setup-string-control-group">
                        <button type="button" aria-label="Increase lowest string" onClick={onIncreaseLowestString}>
                            <FaPlus />
                        </button>
                        <button type="button" aria-label="Decrease lowest string" onClick={onDecreaseLowestString}>
                            <FaMinus />
                        </button>
                    </div>
                </div>
            </div> */}
        </div>
    );
};