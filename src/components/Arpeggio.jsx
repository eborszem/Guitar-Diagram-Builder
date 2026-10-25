import "./../elements/Arpeggio.css";

export const Arpeggio = ({
  root,
  setRoot,
  arpeggio,
  setArpeggio,
  notes,
}) => {
  const noteToValueMap = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const isNoteInArpeggio = (note) => {
    for (const a of arpeggio) {
      if (noteToValueMap[note] === a) {
        return true;
      }
    }
    return false;
  };

  return (
      <div className="scale-dropdown-wrapper">
        <div className="label-and-dropdown">
          <label htmlFor="root" className="settings-block-label">
            root
          </label>
          <select
            id="root"
            className="scale-dropdown"
            value={root}
            onChange={(e) => {
              setRoot(e.target.value);
              setArpeggio([e.target.value]);
            }}
          >
            {notes.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        <div className="label-and-dropdown">
          <label htmlFor="notes" className="settings-block-label">
            notes
          </label>
          <div className="notes-in-arpeggio">
            {notes.map((note) =>
              root !== note ? (
                <label key={note} htmlFor={note}>
                  <span>{note}</span>
                  <input
                    id={note}
                    key={note}
                    value={note}
                    type="checkbox"
                    checked={note === root || isNoteInArpeggio(note)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setArpeggio((prev) => [...prev, noteToValueMap[note]]);
                      } else {
                        setArpeggio((prev) =>
                          prev.filter((n) => n !== noteToValueMap[note]),
                        );
                      }
                    }}
                    disabled={note === root}
                  />
                </label>
              ) : (
                <label key={note} htmlFor={note}>
                  <span style={{ fontWeight: "bold" }}>{note}</span>
                  <input
                    id={note}
                    key={note}
                    value={note}
                    type="checkbox"
                    checked={note === root || isNoteInArpeggio(note)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setArpeggio((prev) => [...prev, noteToValueMap[note]]);
                      } else {
                        setArpeggio((prev) =>
                          prev.filter((n) => n !== noteToValueMap[note]),
                        );
                      }
                    }}
                    disabled={note === root}
                    style={{ visibility: "hidden" }}
                  />
                </label>
              ),
            )}
          </div>
        </div>
      </div>
  );
};
