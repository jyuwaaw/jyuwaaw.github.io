import catalog from './catalog.json';
import { createLikesWorker } from './worker.mjs';
export default createLikesWorker(catalog);
