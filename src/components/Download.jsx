import '../elements/Download.css';
import { toSvg } from 'html-to-image';
import { PiFileSvgDuotone } from "react-icons/pi";
export const Download = ({
    noteToColor,
    setNoteToColor,
    strings, 
    setStrings,
    noteLabel,
    setNoteLabel,
    keyForInterval,
    setKeyForInterval,
    firstVisibleFretIndex,
    setFirstVisibleFretIndex,
    lastVisibleFretIndex,
    setLastVisibleFretIndex,
    isDarkMode
}) => {
    const downloadSVG = () => {
        const fretboardNode = document.getElementById('fretboard-interface');
        toSvg(fretboardNode, {
            filter: (node) => {
                // removes the arrow buttons on both sides of the fretboard
                return !(node.classList?.contains('modify-number-frets'));
            }, style: { backgroundColor: isDarkMode ? '#141414' : 'transparent'}
        })
        .then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'fretboard.svg';
            link.href = dataUrl;
            link.click();
        })
        .catch(err => {
            console.error('Failed to save fretboard as SVG:', err);
        }); 
    };

    const downloadJSON = () => {
        const data = {
            strings: strings,
            noteToColor: noteToColor,
            noteLabel: noteLabel,
            keyForInterval: keyForInterval,
            firstVisibleFretIndex: firstVisibleFretIndex,
            lastVisibleFretIndex: lastVisibleFretIndex
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fretboard-diagram.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.noteToColor) setNoteToColor(data.noteToColor);
                if (data.strings) setStrings(data.strings);
                if (data.noteLabel) setNoteLabel(data.noteLabel);
                if (data.noteLabel && data.keyForInterval) setKeyForInterval(data.keyForInterval);
                if (data.firstVisibleFretIndex) setFirstVisibleFretIndex(data.firstVisibleFretIndex);
                if (data.lastVisibleFretIndex) setLastVisibleFretIndex(data.lastVisibleFretIndex);
            } catch (err) {
                console.error('Invalid JSON file', err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <p className="download-text">import & export</p>
            <div className="diagram-actions">
                <div className="saving">
                    <button onClick={downloadSVG}>Download SVG</button>
                </div>
                <div className="json-download">
                    <button onClick={downloadJSON} title="Save your diagram as JSON so you can reuse it later">Download JSON</button>
                </div>
                <label className="json-import" title="Import diagram from JSON">
                    Import JSON
                    <input 
                        className="json-import-input"
                        type="file"
                        accept=".json"
                        onChange={importJSON}
                        style={{ display: 'none'}}
                    />
                </label>
            </div>
        </>
    )
}