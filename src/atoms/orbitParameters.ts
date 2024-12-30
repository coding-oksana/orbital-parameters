import { atom } from 'jotai';

export const initialState = {
  orbitParams: [
    '',
  ],
  GeolocationCoordinates: [],
};

const params = atom<{ orbitParams: Array<string> }>(initialState);

export default params;
