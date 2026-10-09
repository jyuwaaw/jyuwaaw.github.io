import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-800.css';
import PhotoGallery from '@/components/PhotoGallery';
import { getPhotographs } from '@/lib/photography';
import captions from '@/lib/mechanic.json';

export const metadata = {
  title: 'Mechanic — Yuhua (Benji) Huang',
  description: 'Time in the garage: hands-on work, maintenance, and the details in between.',
};

export default async function Mechanic() {
  const photos = await getPhotographs({ folder: 'Mechanic', captions, defaultStyle: 'In the garage' });
  return (
    <div className="mechanic-page">
      <section className="mechanic-heading wrap">
        <div className="mechanic-kicker"><span>Benji’s garage</span><span>A personal wrenching journal</span></div>
        <div className="mechanic-sign">
          <span className="mechanic-bolt mechanic-bolt-tl" aria-hidden="true" />
          <span className="mechanic-bolt mechanic-bolt-tr" aria-hidden="true" />
          <span className="mechanic-bolt mechanic-bolt-bl" aria-hidden="true" />
          <span className="mechanic-bolt mechanic-bolt-br" aria-hidden="true" />
          <div className="mechanic-sign-top"><span aria-hidden="true">★</span> A little grease. A lot of learning. <span aria-hidden="true">★</span></div>
          <h1>Mechanic</h1>
          <div className="mechanic-sign-bottom"><span>Maintenance</span><span>Parts</span><span>Process</span></div>
        </div>
        <div className="mechanic-intro">
          <p className="mechanic-motto">Hood up. <em>Hands dirty.</em></p>
          <p>Weekend wrenching, parts on the floor,<br />and figuring it out along the way.</p>
        </div>
      </section>
      <section className="photo-collection wrap" aria-label="Garage photographs">
        <PhotoGallery photos={photos} styleLabel="Journal" layout="workshop" />
      </section>
    </div>
  );
}
