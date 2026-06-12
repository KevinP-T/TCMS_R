import api from '../services/api';

export const createTestCasesSlice = (set, get) => ({
  testCases: [],
  selectedTestCase: null,
  executions: [],
  testCasesFilters: { estado: null, tipo: null, ciclo_id: null },
  loadingTestCases: false,
  errorTestCases: null,
  
  fetchTestCases: async (projectId, filters) => {
    set({ loadingTestCases: true, errorTestCases: null });
    try {
      let url = `/projects/${projectId}/test-cases`;
      if (filters) {
        const queryParams = new URLSearchParams();
        if (filters.estado) queryParams.append('estado', filters.estado);
        if (filters.tipo) queryParams.append('tipo', filters.tipo);
        if (filters.ciclo_id) queryParams.append('ciclo_id', filters.ciclo_id);
        const q = queryParams.toString();
        if (q) url += `?${q}`;
      }
      
      const response = await api.get(url);
      set({ testCases: response.data, loadingTestCases: false });
    } catch (error) {
      set({ errorTestCases: error.response?.data?.error || error.message, loadingTestCases: false });
    }
  },
  
  fetchTestCaseById: async (projectId, id) => {
    set({ loadingTestCases: true, errorTestCases: null });
    try {
      const response = await api.get(`/projects/${projectId}/test-cases/${id}`);
      set({ selectedTestCase: response.data, loadingTestCases: false });
    } catch (error) {
      set({ errorTestCases: error.response?.data?.error || error.message, loadingTestCases: false });
    }
  },
  
  fetchExecutions: async (projectId, caseId) => {
    try {
      const response = await api.get(`/projects/${projectId}/test-cases/${caseId}/executions`);
      set({ executions: response.data });
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  },
  
  createTestCase: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/test-cases`, data);
      set((state) => ({ testCases: [response.data, ...state.testCases] }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateTestCase: async (projectId, id, data) => {
    try {
      const response = await api.put(`/projects/${projectId}/test-cases/${id}`, data);
      set((state) => ({
        testCases: state.testCases.map(tc => tc.id === id ? response.data : tc),
        selectedTestCase: state.selectedTestCase?.id === id ? response.data : state.selectedTestCase
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateEstadoTestCase: async (projectId, id, estado, testerId, resultadosObtenidos, observaciones) => {
    try {
      const response = await api.patch(`/projects/${projectId}/test-cases/${id}/estado`, { 
        estado, 
        tester_id: testerId, 
        resultados_obtenidos: resultadosObtenidos, 
        observaciones 
      });
      set((state) => ({
        testCases: state.testCases.map(tc => tc.id === id ? { ...tc, estado: response.data.estado } : tc),
        selectedTestCase: state.selectedTestCase?.id === id ? { ...state.selectedTestCase, estado: response.data.estado } : state.selectedTestCase
      }));
      
      // Recargar historial si corresponde al caso seleccionado actualmente
      if (get().selectedTestCase?.id === id) {
        await get().fetchExecutions(projectId, id);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteTestCase: async (projectId, id) => {
    try {
      await api.delete(`/projects/${projectId}/test-cases/${id}`);
      set((state) => ({
        testCases: state.testCases.filter(tc => tc.id !== id),
        selectedTestCase: state.selectedTestCase?.id === id ? null : state.selectedTestCase
      }));
    } catch (error) {
      throw error;
    }
  },

  importTestCases: async (projectId, jsonData) => {
    set({ loadingTestCases: true, errorTestCases: null });
    try {
      const response = await api.post(`/projects/${projectId}/test-cases/import`, jsonData);
      set({ loadingTestCases: false });
      return response.data;
    } catch (error) {
      set({ errorTestCases: error.response?.data?.error || error.message, loadingTestCases: false });
      throw error;
    }
  },

  exportTestCases: async (projectId) => {
    set({ loadingTestCases: true, errorTestCases: null });
    try {
      const response = await api.get(`/projects/${projectId}/test-cases/export`);
      set({ loadingTestCases: false });
      return response.data;
    } catch (error) {
      set({ errorTestCases: error.response?.data?.error || error.message, loadingTestCases: false });
      throw error;
    }
  },
  
  setTestCaseFilters: (testCasesFilters) => set({ testCasesFilters }),
});
