import '@fontsource/jost/latin-300.css';
import '@fontsource/jost/latin-400.css';
import PhotoGallery from '@/components/PhotoGallery';
import { getPhotographs } from '@/lib/photography';

export const metadata = {
  title: 'Photography — Yuhua (Benji) Huang',
  description: 'Selected photographs by Yuhua (Benji) Huang.',
};

export default async function Photography() {
  const photos = await getPhotographs();
  return (
    <div className="photography-page">
      <section className="photo-heading wrap">
        <span className="section-label">Selected photographs</span>
        <h1>Photography<span>.</span></h1>
        <p>Places, people, and the moments in between.</p>
      </section>
      <section className="photo-collection wrap" aria-label="Selected photographs">
        <PhotoGallery photos={photos} adaptToTime />
      </section>
    </div>
  );
}
