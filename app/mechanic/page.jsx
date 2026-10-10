import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-800.css';
import PhotoGallery from '@/components/PhotoGallery';
import { getPhotographs } from '@/lib/photography';
import captions from '@/lib/mechanic.json';

export const metadata = {
  title: "Benji’s Garage — Yuhua (Benji) Huang",
  description: 'Time in the garage: hands-on work, maintenance, and the details in between.',
};

export default async function Mechanic() {
  const photos = await getPhotographs({ folder: 'Mechanic', captions, defaultStyle: 'In the garage' });
  return (
    <div className="mechanic-page">
      <section className="mechanic-heading wrap">
        <div className="mechanic-kicker"><span>Maintenance · Parts · Process</span><span>A personal wrenching journal</span></div>
        <div className="mechanic-title-row">
          <h1>Benji’s Garage<span aria-hidden="true">.</span></h1>
          <div className="mechanic-intro">
            <p className="mechanic-motto">Hood up. Hands dirty.</p>
            <p>Weekend wrenching, parts on the floor,<br />and figuring it out along the way.</p>
          </div>
        </div>
      </section>
      <section className="photo-collection wrap" aria-label="Garage photographs">
        <PhotoGallery photos={photos} styleLabel="Journal" layout="workshop" />
      </section>
    </div>
  );
}
