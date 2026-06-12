import api from '../services/api';

export const createBugsSlice = (set, get) => ({
  bugs: [],
  selectedBug: null,
  bugsFilters: { estado: null, severidad: null, desarrollador_id: null },
  loadingBugs: false,
  errorBugs: null,
  
  fetchBugs: async (projectId, filters) => {
    set({ loadingBugs: true, errorBugs: null });
    try {
      let url = `/projects/${projectId}/bugs`;
      if (filters) {
        const queryParams = new URLSearchParams();
        if (filters.estado) queryParams.append('estado', filters.estado);
        if (filters.severidad) queryParams.append('severidad', filters.severidad);
        if (filters.desarrollador_id) queryParams.append('desarrollador_id', filters.desarrollador_id);
        const q = queryParams.toString();
        if (q) url += `?${q}`;
      }
      
      const response = await api.get(url);
      set({ bugs: response.data, loadingBugs: false });
    } catch (error) {
      set({ errorBugs: error.response?.data?.error || error.message, loadingBugs: false });
    }
  },
  
  fetchBugById: async (projectId, id) => {
    set({ loadingBugs: true, errorBugs: null });
    try {
      const response = await api.get(`/projects/${projectId}/bugs/${id}`);
      set({ selectedBug: response.data, loadingBugs: false });
    } catch (error) {
      set({ errorBugs: error.response?.data?.error || error.message, loadingBugs: false });
    }
  },
  
  createBug: async (projectId, formData) => {
    try {
      // formData porque usa multipart/form-data
      const response = await api.post(`/projects/${projectId}/bugs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set((state) => ({ bugs: [response.data, ...state.bugs] }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateBug: async (projectId, id, data) => {
    try {
      const response = await api.put(`/projects/${projectId}/bugs/${id}`, data);
      set((state) => ({
        bugs: state.bugs.map(b => b.id === id ? response.data : b),
        selectedBug: state.selectedBug?.id === id ? response.data : state.selectedBug
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateEstadoBug: async (projectId, id, estado) => {
    try {
      const response = await api.patch(`/projects/${projectId}/bugs/${id}/estado`, { estado });
      set((state) => ({
        bugs: state.bugs.map(b => b.id === id ? { ...b, estado: response.data.estado } : b),
        selectedBug: state.selectedBug?.id === id ? { ...state.selectedBug, estado: response.data.estado } : state.selectedBug
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteBug: async (projectId, id) => {
    try {
      await api.delete(`/projects/${projectId}/bugs/${id}`);
      set((state) => ({
        bugs: state.bugs.filter(b => b.id !== id),
        selectedBug: state.selectedBug?.id === id ? null : state.selectedBug
      }));
    } catch (error) {
      throw error;
    }
  },
  
  uploadEvidencia: async (projectId, bugId, formData) => {
    try {
      const response = await api.post(`/projects/${projectId}/bugs/${bugId}/evidencias`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set((state) => ({
        selectedBug: state.selectedBug?.id === bugId 
          ? { ...state.selectedBug, evidencia_paths: response.data.evidencia_paths }
          : state.selectedBug
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteEvidencia: async (projectId, bugId, filename) => {
    try {
      const response = await api.delete(`/projects/${projectId}/bugs/${bugId}/evidencias/${filename}`);
      set((state) => ({
        selectedBug: state.selectedBug?.id === bugId 
          ? { ...state.selectedBug, evidencia_paths: response.data.evidencia_paths }
          : state.selectedBug
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  importBugs: async (projectId, jsonData) => {
    set({ loadingBugs: true, errorBugs: null });
    try {
      const response = await api.post(`/projects/${projectId}/bugs/import`, jsonData);
      set({ loadingBugs: false });
      return response.data;
    } catch (error) {
      set({ errorBugs: error.response?.data?.error || error.message, loadingBugs: false });
      throw error;
    }
  },

  exportBugs: async (projectId) => {
    set({ loadingBugs: true, errorBugs: null });
    try {
      const response = await api.get(`/projects/${projectId}/bugs/export`);
      set({ loadingBugs: false });
      return response.data;
    } catch (error) {
      set({ errorBugs: error.response?.data?.error || error.message, loadingBugs: false });
      throw error;
    }
  },
  
  setBugFilters: (bugsFilters) => set({ bugsFilters }),
});
