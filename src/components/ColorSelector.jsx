import '../elements/Color.css';

import { MdFormatColorReset } from "react-icons/md";
export const ColorSelector = ({ colors, color, setColor }) => {
    const {colorBank, colorBankLight} = colors;
    return (
        <div className="color-selector">   
            <button
                className={`unset-color-btn ${color==='none' && 'selected'}`}
                onClick={() => setColor('none')}
            ><MdFormatColorReset/></button>
            <div className="color-btns-container">
                {[colorBank, colorBankLight].map((arr) => (
                    <div className="color-btns">
                        {arr.map((c) => (
                            <button
                                key={c}
                                className={`color-btn ${c === color ? 'selected' : ''}`}
                                onClick={() => setColor(c)}
                                style={{ backgroundColor: c }}
                            ></button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}