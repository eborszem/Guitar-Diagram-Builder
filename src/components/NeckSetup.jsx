import { useState, useEffect } from "react";
import "./../elements/NeckSetup.css";
import { FaPlus, FaMinus } from "react-icons/fa";

export const NeckSetup = ({
    strings,
    setStrings,
    firstVisibleFretIndex,
    setFirstVisibleFretIndex,
    lastVisibleFretIndex,
    setLastVisibleFretIndex,
}) => {
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");

    const onIncreaseHighestString = () => {
        if (strings.length >= 15) return;
        const id = strings.length > 0 ? strings[0].id - 1 : 0;
        setStrings([{id: id, midi: 64}, ...strings]); // add an extra E4 (midi = 64) string
        console.log(strings);
    };

    const onDecreaseHighestString = () => {
        if (strings.length <= 1) return;
        setStrings(strings.slice(1))
        console.log(strings);
    };

    const onIncreaseLowestString = () => {
        if (strings.length >= 15) return;
        const id = strings.length > 0 ? strings[strings.length - 1].id + 1 : 0;
        setStrings([...strings, {id: id, midi: 40}]); // add an extra E2 (midi = 40) string
        console.log(strings);
    };

    const onDecreaseLowestString = () => {
        if (strings.length <= 1) return;
        setStrings(strings.slice(0, -1));
        console.log(strings);
    };

    useEffect(() => {
        setFirst(firstVisibleFretIndex ?? "");
    }, [firstVisibleFretIndex]);

    useEffect(() => {
        setLast(lastVisibleFretIndex ?? "");
    }, [lastVisibleFretIndex]);

    const handleFirstChange = (e) => {
        const val = e.target.value;
        if (Number(val) > lastVisibleFretIndex) {
            setFirst(lastVisibleFretIndex);
            setFirstVisibleFretIndex(lastVisibleFretIndex);
            return;
        } else if (Number(val) < 0) {
            setFirst(0);
            setFirstVisibleFretIndex(0);
            return;
        }

        setFirst(val);
        setFirstVisibleFretIndex(val === "" ? 0 : Number(val));
    };

    const handleLastChange = (e) => {
        const val = e.target.value;
        if (Number(val) < firstVisibleFretIndex) {
            setLast(firstVisibleFretIndex);
            setLastVisibleFretIndex(firstVisibleFretIndex);
            return;
        } else if (Number(val) < 0) {
            setLast(0);
            setLastVisibleFretIndex(0);
            return;
        }

        setLast(val);
        setLastVisibleFretIndex(val === "" ? 0 : Number(val));
    };

    return (
        <div className="neck-setup-interface">
            <p className="neck-setup-text">neck setup</p>

            <div className="neck-setup-input">
                <label>Frets</label>

                <input
                    type="number"
                    value={first}
                    onChange={handleFirstChange}
                    onBlur={() => setFirstVisibleFretIndex(Number(first) || 0)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setFirstVisibleFretIndex(Number(first) || 0);
                        }
                    }}
                    style={{ width: "60px", margin: "0 8px" }}
                />

                <label>to</label>

                <input
                    type="number"
                    value={last}
                    onChange={handleLastChange}
                    onBlur={() =>
                        setLastVisibleFretIndex(Number(last) || 0)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setLastVisibleFretIndex(Number(last) || 0);
                        }
                    }}
                    style={{ width: "60px", margin: "0 8px" }}
                />
            </div>

            <div className="neck-setup-strings">
                <div className="generate-scale">
                    <label className="string-label">Top String</label>
                    <div className="neck-setup-string-control-group">
                        <button type="button" onClick={onIncreaseHighestString}>
                            <FaPlus />
                        </button>
                        <button type="button" onClick={onDecreaseHighestString}>
                            <FaMinus />
                        </button>
                    </div>
                </div>
                <div className="generate-scale">
                    <label className="string-label">Bottom String</label>
                    <div className="neck-setup-string-control-group">
                        <button type="button" onClick={onIncreaseLowestString}>
                            <FaPlus />
                        </button>
                        <button type="button" onClick={onDecreaseLowestString}>
                            <FaMinus />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};