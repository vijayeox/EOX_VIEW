import osjs from 'osjs';
import metadata from './metadata.json';
import {register} from './src/theme.js';
// Our launcher

osjs.register(metadata.name, register);
