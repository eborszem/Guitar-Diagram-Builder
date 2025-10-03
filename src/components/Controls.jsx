import '../elements/Controls.css';
import { FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown} from "react-icons/fa";

export const StringControls = ({ side, strings, setStrings }) => {
    // functions for modifying the visible strings on the fretboard
    const onIncreaseHighestString = () => {
        const id = strings.length > 0 ? strings[0].id - 1 : 0;
        setStrings([{id: id, midi: 64}, ...strings]); // add an extra E4 (midi = 64) string
        console.log(strings);
    };

    const onDecreaseHighestString = () => {
        setStrings(strings.slice(1))
        console.log(strings);
    };

    const onIncreaseLowestString = () => {
        const id = strings.length > 0 ? strings[strings.length - 1].id + 1 : 0;
        setStrings([...strings, {id: id, midi: 40}]); // add an extra E2 (midi = 40) string
        console.log(strings);
    };

    const onDecreaseLowestString = () => {
        setStrings(strings.slice(0, -1));
        console.log(strings);
    };
    
    const isHighest = side === "highest";
    return (
        <div className="modify-number-strings">
            {strings.length <= 12 && (
                <button
                    onClick={isHighest ? onIncreaseHighestString : onIncreaseLowestString }
                >
                    {isHighest ? <FaArrowUp /> : <FaArrowDown />}
                </button>
            )}
            {strings.length > 1 && (
                <button
                    onClick={isHighest ? onDecreaseHighestString : onDecreaseLowestString}
                >
                    {isHighest ? <FaArrowDown /> : <FaArrowUp />}
                </button>
            )}
        </div>
    );
};

export const FretControls = ({ side, canIncrease, canDecrease, onIncrease, onDecrease, numFrets }) => {
    const isLeft = side === "left";
    return (
        <div className="modify-number-frets">
            {canIncrease && (
                <button 
                    className={`increase-frets-${side}`}
                    onClick={onIncrease}
                > 
                    {isLeft ? <FaArrowLeft /> : <FaArrowRight />}
                </button>
            )}
            {(numFrets > 3 && canDecrease) && (
                <button
                    className={`decrease-frets-${side}`}
                    onClick={onDecrease}
                >
                    {isLeft ? <FaArrowRight /> : <FaArrowLeft />}
                </button>
            )}
        </div>
    );
};