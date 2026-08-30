import '../elements/Download.css';
import { toSvg } from 'html-to-image';

export const Download = ({
    NOTE_LABELS,
    fretboard,
    updateFretboard,
    addFretboard,
    isDarkMode,
    keyForInterval,
    setKeyForInterval
}) => {
    const downloadSVG = () => {
        const fretboardNode = document.querySelector('.fretboard-interface.active');
        toSvg(fretboardNode, {
            style: {
                backgroundColor: isDarkMode ? '#141414' : 'transparent',
                boxShadow: 'none',
                border: '2px solid transparent',
                borderRadius: '0',
                transition: 'none',
            }
        })
        .then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'fretboard-diagram.svg';
            link.href = dataUrl;
            link.click();
        })
        .catch(err => {
            console.error('Failed to save fretboard as SVG:', err);
        });
    };

    const downloadJSON = () => {
        const data = {
            id: fretboard.id,
            strings: fretboard.strings,
            noteToColor: fretboard.noteToColor,
            noteLabel: fretboard.noteLabel,
            keyForInterval: fretboard.noteLabel === 2 ? keyForInterval : undefined,
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

        const standardTuning = [
            {id: 0, midi: 64}, // E4
            {id: 1, midi: 59}, // B3
            {id: 2, midi: 55}, // G3
            {id: 3, midi: 50}, // D3
            {id: 4, midi: 45}, // A2
            {id: 5, midi: 40}, // E2
        ];

        const reader = new FileReader();
        reader.onload = (event) => {
            let payload;
            try {
                const data = JSON.parse(event.target.result);
                // this code makes it so the jsons created before I
                // changed the notelabel from int to string still work
                let x = data.noteLabel;
                if (x === 0) {
                    x = NOTE_LABELS.SPN;
                } else if (x === 1) {
                    x = NOTE_LABELS.NO_SPN;
                } else if (x === 2) {
                    x = NOTE_LABELS.INTERVAL;
                } else if (x === 3) {
                    x = NOTE_LABELS.BLANK;
                }
                payload = {
                    strings: data.strings ?? standardTuning,
                    noteToColor: data.noteToColor ?? {},
                    noteLabel: x ?? 0,
                    firstVisibleFretIndex: data.firstVisibleFretIndex ?? 0,
                    lastVisibleFretIndex: data.lastVisibleFretIndex ?? 12,
                    hideNotes: data.hideNotes === false || data.hideNotes === 'false',
                    showSharps: data.showSharps === true || data.showSharps === 'true',
                }
                setKeyForInterval(data.keyForInterval ?? 'C');
            } catch (err) {
                payload = {
                    strings: standardTuning,
                    noteToColor: {},
                    noteLabel: NOTE_LABELS.SPN,
                    firstVisibleFretIndex: 0,
                    lastVisibleFretIndex: 12,
                    hideNotes: false,
                    showSharps: true,
                };
            }
            const newFretboardId = addFretboard();
            updateFretboard(newFretboardId, payload);
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <>
            <p className="settings-block-header">import & export</p>
            <div className="diagram-actions">
                <button className="saving" id="no-margin" onClick={downloadSVG}>download svg</button>
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