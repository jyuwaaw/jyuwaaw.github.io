import { projectsByEra } from '@/lib/projects';
import { TRACKS } from '@/lib/tracks';
import ProjectShelves from '@/components/ProjectShelves';

export const metadata = {
  title: 'Projects',
  description:
    'Things I built — MCP servers, Claude Code skills, and agent tooling on one shelf; RTL, UVM verification, and accelerator research on the other.',
};

export default function ProjectsPage() {
  return (
    <>
      <section className="page-head wrap">
        <span className="eyebrow"><span className="spark">✦</span> Projects</span>
        <h1>Two shelves, <span className="dim">one vertical.</span></h1>
        <p>
          I used to make chips run AI; now I make AI run tools. Same instinct both
          times — find the interface everyone says doesn't exist.
        </p>
      </section>
      <ProjectShelves eras={projectsByEra()} tracks={TRACKS} />
    </>
  );
}
