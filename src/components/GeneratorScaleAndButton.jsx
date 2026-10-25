import { useState } from "react";
import{ Scale } from "./Scale";
import { Arpeggio } from "./Arpeggio";

export const scales = {
  "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  "Natural Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor Ascending": [0, 2, 3, 5, 7, 9, 11],
  "Pentatonic Major": [0, 2, 4, 7, 9],
  "Pentatonic Minor": [0, 3, 5, 7, 10],
};

export const GeneratorScaleAndButton = ({
  fretboard,
  updateFretboard,
  root,
  setRoot,
  generate,
  option,
  showSharps,
  color,
}) => {
  const notes = showSharps
    ? ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    : ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  const [scale, setScale] = useState("Major (Ionian)");
  const [arpeggio, setArpeggio] = useState(["C"]);

  const lightenHex = (hex, amount = 0.5) => {
    let clean = hex.replace("#", "");

    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((c) => c + c)
        .join("");
    }

    let num = parseInt(clean, 16);

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = Math.min(255, Math.round(r + (255 - r) * amount));
    g = Math.min(255, Math.round(g + (255 - g) * amount));
    b = Math.min(255, Math.round(b + (255 - b) * amount));

    const toHex = (value) => value.toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const noteToMidi = () => {
    const noteMap = fretboard.showSharps
      ? ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
      : ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    for (let i = 0; i < noteMap.length; i++) {
      if (noteMap[i] === root) {
        return i;
      }
    }
    return -1;
  };

  const generateScale = (scaleName) => {
    if (color === "none") return;

    updateFretboard(fretboard.id, { noteToColor: {} });

    let midiRoot = noteToMidi(root);
    
    let scale = scales[scaleName];

    let tmp = {}; // temporary noteToColor mapping

    const rootColor = color;
    const scaleColor = lightenHex(color, 0.6);
    const strings = fretboard.strings;
    for (let stringIdx = 0; stringIdx < strings.length; stringIdx++) {
      // valid midi range is 21 to 108
      for (let midi = 0; midi <= 108; midi++) {
        if (midi % 12 !== midiRoot) continue;
        tmp[midi + "-"  + strings[stringIdx].id] = rootColor;
        for (let i = 1; i < scale.length; i++) {
          let noteMidi = midi + scale[i];
          if (noteMidi >= 21 && noteMidi <= 108) {
            tmp[noteMidi + "-"  + strings[stringIdx].id] = scaleColor;
          }
        }
      }
    }
    updateFretboard(fretboard.id, { noteToColor: tmp });
  };

  const generateArpeggio = () => {
    if (color === "none") return;
    updateFretboard(fretboard.id, { noteToColor: {} });
    let tmp = {}; // temporary noteToColor mapping
    const strings = fretboard.strings;
    for (let stringIdx = 0; stringIdx < strings.length; stringIdx++) {
      for (let midi = 0; midi <= 108; midi++) {
        if (midi % 12 === noteToMidi(root)) {
          tmp[midi + "-"  + strings[stringIdx].id] = color;
        } else if (arpeggio.includes(midi % 12)) {
          tmp[midi + "-"  + strings[stringIdx].id] = lightenHex(color, 0.6);
        }
      }
    }
    updateFretboard(fretboard.id, { noteToColor: tmp });
  };

  return (
    <>
      <p className="settings-block-header">{option} generator</p>
      <div className="scale-dropdown-wrapper">
        <div className="label-and-dropdown">
        </div>
        {option === "scale" ? (
          <Scale 
            root={root}
            setRoot={setRoot}
            scale={scale}
            setScale={setScale}
            color={color}
            notes={notes}
          />
        ) : (
          <Arpeggio
            root={root}
            setRoot={setRoot}
            arpeggio={arpeggio}
            setArpeggio={setArpeggio}
            notes={notes}
          />
        )}
        {/* todo: fix name */}
        <div className="label-and-dropdown"> 
          <label
            className="settings-block-label"
            style={{ visibility: "hidden" }}
          >
            .
          </label>
          <div className="generate-scale">
            <button
              className="gen-btn-text"
              onClick={() => 
                option === "scale" ? 
                  generateScale(scale) : 
                  generateArpeggio(arpeggio) 
            }>
              generate
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
