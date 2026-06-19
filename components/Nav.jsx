import Link from 'next/link';
import { site } from '@/lib/site';

export default function Nav() {
  return (
    <header>
      <div className="wrap">
        <nav>
          <Link className="logo" href="/">
            <span className="spark">✦</span>
            {site.name}
          </Link>
          <div className="nav-links">
            <Link className="hide-sm" href="/">Home</Link>
            <Link className="hide-sm" href="/blog">Blog</Link>
            <Link className="hide-sm" href="/about">About</Link>
            <a className="btn" href={`mailto:${site.email}`}>Contact</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
