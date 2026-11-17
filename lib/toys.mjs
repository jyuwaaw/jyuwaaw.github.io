import { photoLikeId } from './photo-like-id.mjs';

// Small things that run in the browser. Adding an entry here gives a toy its
// card on /play/ and the home page, plus a like button and a view count.
// `id` is permanent: it identifies the toy in the likes service.
export const toys = [
  {
    id: 'roastmyhomescreen',
    title: 'Roast My Homescreen',
    blurb: 'Get a playful MBTI guess and a review of your home screen, then hide private apps in the card you share.',
    href: '/roastmyhomescreen/',
    language: '中文',
    preview: 'roast',
  },
];

// Same scheme as photographs, under its own collection name.
export const toyStatsId = (id) => photoLikeId('play', id);
