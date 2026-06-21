// Curated cute pastel / muted palette. Each entry has a soft fill for the
// block background, a slightly deeper border, and a readable dark text color
// drawn from the same hue family so a class reads as "its own color".
export const PALETTE = [
  { bg: '#FBD3D8', border: '#E89AA6', text: '#8A3B49' }, // strawberry
  { bg: '#CFE8D6', border: '#94C9A6', text: '#3C6B4E' }, // matcha
  { bg: '#D6E2F7', border: '#9FBBE8', text: '#3C5488' }, // periwinkle
  { bg: '#FBE6C8', border: '#EBC58C', text: '#8A6326' }, // honey
  { bg: '#E7D6F2', border: '#C4A4DE', text: '#5E3F80' }, // lavender
  { bg: '#CDEDED', border: '#90D2D2', text: '#2F6B6B' }, // seafoam
  { bg: '#F8D7E8', border: '#E8A4C8', text: '#8A3B69' }, // rose
  { bg: '#E4EAC9', border: '#C2CE8E', text: '#5C6B2E' }, // pistachio
  { bg: '#FAD9C4', border: '#EDB088', text: '#8A4F26' }, // apricot
  { bg: '#D2E7F0', border: '#9CC9DD', text: '#356073' }, // sky
  { bg: '#E8D9CF', border: '#CBB1A0', text: '#6B4E3C' }, // latte
  { bg: '#DCD6F2', border: '#B0A4DE', text: '#4A3F80' }, // iris
  { bg: '#F2E0D0', border: '#DCBE9E', text: '#7A5436' }, // sand
  { bg: '#C9E9DC', border: '#8FD0B6', text: '#2F6B54' }, // mint
  { bg: '#F5D6E0', border: '#E2A0B6', text: '#82385A' }, // blush
  { bg: '#D9E4D0', border: '#AEC79C', text: '#4E6B3C' }, // sage
  { bg: '#E0DAF0', border: '#B4AADE', text: '#473F80' }, // wisteria
  { bg: '#F7E3C4', border: '#E6C488', text: '#7E5E26' }, // butter
  { bg: '#D0E6E2', border: '#99CFC7', text: '#326B62' }, // teal-mist
  { bg: '#F0D9E6', border: '#D6A2C2', text: '#7A3A60' }, // mauve
]

// Deterministic color for a course based on its id, so a course always keeps
// the same color across reloads.
export function colorFor(id) {
  return PALETTE[id % PALETTE.length]
}
