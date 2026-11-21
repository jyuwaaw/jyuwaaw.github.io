// Name, role and links used across the site.
const role = 'Founding Engineer at AI startup';

export const site = {
  name: 'Yuhua (Benji) Huang',
  shortName: 'Benji Huang',
  url: 'https://jyuwaaw.github.io',
  avatar: '/images/avatar.webp',
  role,
  roleIntro: 'I’m a founding engineer at an AI startup.',
  description: 'Yuhua (Benji) Huang builds tools for AI agents. Engineering notes on macOS, selected ASIC design and verification projects, and photography.',
  email: 'yuhuah2@uci.edu',
  github: 'https://github.com/jyuwaaw',
  linkedin: 'https://www.linkedin.com/in/yuhua-benji/',
  googleScholar: 'https://scholar.google.com/citations?user=5VKP9mIAAAAJ&hl=en',
  arxiv: 'https://arxiv.org/abs/2411.18065',
};

export const links = [
  { label: 'Email', href: `mailto:${site.email}` },
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Google Scholar', href: site.googleScholar },
  { label: 'arXiv', href: site.arxiv },
];
