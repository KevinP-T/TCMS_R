import api from '../services/api';

export const createReportsSlice = (set, get) => ({
  dashboardData: null,
  loadingReports: false,
  errorReports: null,
  
  fetchDashboardData: async (projectId = 'general') => {
    set({ loadingReports: true, errorReports: null });
    try {
      const response = await api.get(`/reports/dashboard?projectId=${projectId}`);
      set({ dashboardData: response.data, loadingReports: false });
    } catch (error) {
      set({ errorReports: error.response?.data?.error || error.message, loadingReports: false });
    }
  }
});
