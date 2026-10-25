import { scales } from "./GeneratorScaleAndButton"
import "./../elements/Scale.css";

export const Scale = ({
  root,
  setRoot,
  setScale,
  scale,
  notes,
}) => {

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
          onChange={(e) => setRoot(e.target.value)}
        >
          {notes.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      <div className="label-and-dropdown">
        <label className="settings-block-label">scale</label>
        <select
          id="scale"
          className="scale-dropdown"
          value={scale}
          onChange={(e) => setScale(e.target.value)}
        >
          {Object.entries(scales).map(([key, intervals]) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div className="label-and-dropdown">
        <label
          className="settings-block-label"
          style={{ visibility: "hidden" }}
        >
          .
        </label>
      </div>
    </div>
  );
};
