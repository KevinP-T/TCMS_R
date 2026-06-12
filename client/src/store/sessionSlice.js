export const createSessionSlice = (set) => ({
  usuario: null, // { id, nombre, rol }
  setUsuario: (user) => set({ usuario: user }),
  clearUsuario: () => set({ usuario: null }),
});
