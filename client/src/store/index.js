import { create } from 'zustand';
import { createSessionSlice } from './sessionSlice';
import { createProjectsSlice } from './projectsSlice';
import { createTestCasesSlice } from './testCasesSlice';
import { createBugsSlice } from './bugsSlice';
import { createUsersSlice } from './usersSlice';
import { createReportsSlice } from './reportsSlice';

export const useStore = create((...a) => ({
  ...createSessionSlice(...a),
  ...createProjectsSlice(...a),
  ...createTestCasesSlice(...a),
  ...createBugsSlice(...a),
  ...createUsersSlice(...a),
  ...createReportsSlice(...a),
}));
