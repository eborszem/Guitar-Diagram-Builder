// midi values correspond to notes
// e.g., 64 = e4, 59 = B3, 55 = G3, 50 = D3, 45 = A2, 40 = E2, etc.
export const tuningsMidi = {
    'standard': [64, 59, 55, 50, 45, 40],
    'drop-d': [64, 59, 55, 50, 45, 38],
    'half-step-down': [63, 58, 54, 49, 44, 39],
    'full-step-down': [62, 57, 53, 48, 43, 38],
    'drop-c': [62, 57, 53, 48, 43, 36],
    'open-d': [62, 57, 54, 50, 45, 38],
    'open-g': [62, 59, 55, 50, 43, 38],
    'open-c': [64, 60, 55, 48, 43, 36],
    'dadgad': [62, 57, 55, 50, 45, 38],
    'double-drop-d': [62, 59, 55, 50, 45, 38],
    'all fourths': [65, 60, 55, 50, 45, 40],
    '[all fourths]^2': [88, 83, 78, 73, 68, 63, 58, 53, 48, 43, 38, 33, 28],
    'bass standard': [43, 38, 33, 28],
    'custom': [] // custom is not a preset, and only appears in the dropdown when the user enters a custom tuning
};

// generate string objects: {id: string-id, midi: midi value} 
export const tuning = Object.fromEntries(
    Object.entries(tuningsMidi).map(([name, arr]) => [
        name,
        arr.map((midi, i) => ({id: i, midi})),
    ])
);