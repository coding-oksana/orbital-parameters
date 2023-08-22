import { atom } from 'jotai';

export const initialState = {
  news: [
    '',
  ],
};

const news = atom<{ news: Array<string> }>(initialState);

export default news;
