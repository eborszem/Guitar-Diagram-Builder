import '../elements/Download.css';
import { toSvg } from 'html-to-image';
import { PiFileSvgDuotone } from "react-icons/pi";

export const Download = ({
    curFretboardId,
    setCurFretboardId,
    fretboard,
    updateFretboard,
    defaultFretboard,
    addFretboard,
    isDarkMode
}) => {
    const downloadSVG = () => {
        const fretboardNode = document.querySelector('.fretboard-interface.active');
        fretboardNode.classList.add('is-exporting');
        toSvg(fretboardNode, {
            style: { 
                backgroundColor: isDarkMode ? '#141414' : 'transparent',
            }
        })
        .then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'fretboard.svg';
            link.href = dataUrl;
            link.click();
        })
        .catch(err => {
            console.error('Failed to save fretboard as SVG:', err);
        })
        .finally(() => {
            fretboardNode.classList.remove('is-exporting');
        });
    };

    const downloadJSON = () => {
        const data = {
            id: fretboard.id,
            strings: fretboard.strings,
            noteToColor: fretboard.noteToColor,
            noteLabel: fretboard.noteLabel,
            firstVisibleFretIndex: fretboard.firstVisibleFretIndex,
            lastVisibleFretIndex: fretboard.lastVisibleFretIndex,
            hideNotes: fretboard.hideNotes,
            showSharps: fretboard.showSharps,
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
                updateFretboard(addFretboard(), {
                    strings: data.strings,
                    noteToColor: data.noteToColor,
                    noteLabel: data.noteLabel,
                    firstVisibleFretIndex: data.firstVisibleFretIndex,
                    lastVisibleFretIndex: data.lastVisibleFretIndex,
                    hideNotes: data.hideNotes,
                    showSharps: data.showSharps
                });
                // console.log("Successfully imported fretboard diagram from JSON");
                // console.log("data=", data);
            } catch (err) {
                addFretboard();
                // console.error('Invalid JSON file', err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <p className="download-text">import & export</p>
            <div className="diagram-actions">
                <button className="saving" onClick={downloadSVG}>download svg</button>
                <button className="json-download" onClick={downloadJSON} title="Save your diagram as a JSON file so you can import and reuse it later">download json</button>
                <label className="json-import" title="Import diagram from JSON">
                    import json
                    <input 
                        className="json-import-input"
                        type="file"
                        accept=".json"
                        onChange={importJSON}
                        style={{ display: "none" }}
                    />
                </label>
            </div>
        </>
    )
}