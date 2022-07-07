import createDebug from 'debug'
import {name} from '../package.json';

export const debug = createDebug(name)
