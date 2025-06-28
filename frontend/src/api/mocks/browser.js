import { setupWorker } from 'msw/browser';
import {
  authHandlers,
  requirementsHandlers,
  projectsHandlers,
  releasesHandlers,
  testingHandlers,
  adminHandlers,
} from './handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...requirementsHandlers,
  ...projectsHandlers,
  ...releasesHandlers,
  ...testingHandlers,
  ...adminHandlers
); 