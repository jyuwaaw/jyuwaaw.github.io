import Home from '../page';
import { TypeStudio } from '@/components/Appearance';
export const metadata = { title: 'Type studio — Benji', robots: { index: false, follow: false } };
export default function TypePage() {
  return <><TypeStudio /><Home /></>;
}
