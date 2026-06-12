import api from '../services/api';

export const createProjectsSlice = (set, get) => ({
  projects: [],
  selectedProject: null,
  ciclos: [],
  loadingProjects: false,
  errorProjects: null,
  
  fetchProjects: async () => {
    set({ loadingProjects: true, errorProjects: null });
    try {
      const response = await api.get('/projects');
      set({ projects: response.data, loadingProjects: false });
    } catch (error) {
      set({ errorProjects: error.response?.data?.error || error.message, loadingProjects: false });
    }
  },
  
  fetchProjectById: async (id) => {
    set({ loadingProjects: true, errorProjects: null });
    try {
      const response = await api.get(`/projects/${id}`);
      const summary = await api.get(`/projects/${id}/summary`);
      set({ selectedProject: { ...response.data, summary: summary.data }, loadingProjects: false });
    } catch (error) {
      set({ errorProjects: error.response?.data?.error || error.message, loadingProjects: false });
    }
  },
  
  createProject: async (data) => {
    try {
      const response = await api.post('/projects', data);
      set((state) => ({ projects: [response.data, ...state.projects] }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateProject: async (id, data) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? response.data : p),
        selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...response.data } : state.selectedProject
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchCiclos: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/ciclos`);
      set({ ciclos: response.data });
    } catch (error) {
      console.error('Error fetching ciclos:', error);
    }
  },

  createCiclo: async (projectId, nombre) => {
    try {
      const response = await api.post(`/projects/${projectId}/ciclos`, { nombre });
      set((state) => ({ ciclos: [response.data, ...state.ciclos] }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCiclo: async (projectId, cicloId) => {
    try {
      await api.delete(`/projects/${projectId}/ciclos/${cicloId}`);
      set((state) => ({ ciclos: state.ciclos.filter(c => c.id !== cicloId) }));
    } catch (error) {
      throw error;
    }
  }
});
