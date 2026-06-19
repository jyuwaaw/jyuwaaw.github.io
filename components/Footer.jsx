import { site } from '@/lib/site';

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <span><span className="spark">✦</span> {site.name} · © {new Date().getFullYear()}</span>
        <div className="foot-links">
          <a href={site.github}>GitHub</a>
          <a href={site.linkedin}>LinkedIn</a>
          <a href={`mailto:${site.email}`}>Email</a>
        </div>
      </div>
    </footer>
  );
}
