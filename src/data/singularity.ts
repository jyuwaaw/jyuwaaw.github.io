const repository = 'https://github.com/jyuwaaw/lumiere';
const stylePath = 'main/styles/screen-life-singularity/';

export const singularity = {
  title: 'Singularity',
  page: '/films/singularity/',
  format: 'Screen-life short',
  year: 2026,
  stills: '/films/singularity/',
  teaser: repository + '/releases/download/singularity-assets-v1/lumiere_teaser_720p.mp4',
  teaserLength: '0:35',
  filmLength: '2:52',
  description: 'Just before midnight, a man at his laptop hands an unanswered math question to an AI. Outside, the fireworks have already begun.',
  links: [
    { label: 'Making of', href: repository + '/blob/' + stylePath + 'LESSONS.md' },
    { label: 'Source & template', href: repository + '/tree/' + stylePath + 'template/' },
    { label: 'Credits', href: repository + '/blob/' + stylePath + 'credits.md' },
  ],
};
