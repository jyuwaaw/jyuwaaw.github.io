import Link from 'next/link';
import { site } from '@/lib/site';
import { AppearanceMenu } from '@/components/Appearance';
import Avatar from '@/components/Avatar';

export default function Nav() {
  return (
    <header>
      <div className="wrap">
        <nav aria-label="Main navigation">
          <Link className="logo" href="/">
            <Avatar size={30} />
            {site.name}
          </Link>
          <div className="nav-links">
            <Link href="/projects">Projects</Link>
            <Link href="/writing">Writing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/photography">Photography</Link>
            <Link href="/mechanic">Benji’s Garage</Link>
            <Link href="/about">About</Link>
            <a className="btn" href={`mailto:${site.email}`}>Contact</a>
          </div>
          <AppearanceMenu />
        </nav>
      </div>
    </header>
  );
}
