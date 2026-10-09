import Photography from '../page';
import PhotographyTypePreview from '@/components/PhotographyTypePreview';

export const metadata = {
  title: 'Photography — Font preview',
  robots: { index: false, follow: false },
};

export default function PhotographyTypePage() {
  return <PhotographyTypePreview><Photography /></PhotographyTypePreview>;
}
