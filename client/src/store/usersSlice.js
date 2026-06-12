import api from '../services/api';

export const createUsersSlice = (set, get) => ({
  users: [],
  loadingUsers: false,
  errorUsers: null,
  
  fetchUsers: async () => {
    set({ loadingUsers: true, errorUsers: null });
    try {
      const response = await api.get('/users');
      set({ users: response.data, loadingUsers: false });
    } catch (error) {
      set({ errorUsers: error.response?.data?.error || error.message, loadingUsers: false });
    }
  },
  
  createUser: async (data) => {
    try {
      const response = await api.post('/users', data);
      set((state) => ({ users: [...state.users, response.data] }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      set((state) => ({
        users: state.users.map(u => u.id === id ? response.data : u)
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({
        users: state.users.filter(u => u.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  }
});
