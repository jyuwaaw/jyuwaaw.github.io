const readingFace = { id: 'source-sans', name: 'Source Sans 3', serif: false, weights: [400, 500, 600], styles: ['normal', 'italic'] };

// The proof changes only the heading face.
export const typefaces = [
  { id: 'cormorant', name: 'Cormorant Garamond', serif: true, weights: [400, 500, 600], styles: ['normal', 'italic'] },
  { id: 'work-sans', name: 'Work Sans', serif: false, weights: [400, 500, 600], styles: ['normal', 'italic'] },
  { id: 'old-standard', name: 'Old Standard TT', serif: true, weights: [400, 700], styles: ['normal'] },
  { id: 'bricolage', name: 'Bricolage Grotesque', serif: false, weights: [400, 500, 600], styles: ['normal'] },
];

export function siteTypefaces(proof) {
  return [...(proof ? typefaces : typefaces.filter(face => face.id === 'cormorant')), readingFace];
}
