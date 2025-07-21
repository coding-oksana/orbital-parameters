import { atom } from 'jotai';
import { OrbitParams } from '../types/orbitParams';

export const initialState: OrbitParams = {
  a: 0, // semi-major axis (km)
  e: 0, // eccentricity
  ω: 0, // argument of perigee (deg)
  v: 0, // true anomaly (deg)
  i: 0, // inclination
};

const params = atom<OrbitParams>(initialState);

export default params;
