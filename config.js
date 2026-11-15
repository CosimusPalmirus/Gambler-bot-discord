/* Configurazione pubblica dell'Activity (niente segreti qui: il Client Secret sta SOLO sul VPS).
   clientId = Application ID dell'app sul Developer Portal (pubblico).
   apiBase  = prefisso della URL mapping verso il backend (Discord lo toglie: /api/x -> 62-238-17-24.sslip.io/x).
   giochiAttivi = i giochi che dentro Discord si possono gia' giocare (fase 1: Neon Pong e Smash). */
window.GX_CONFIG = {
  clientId: '1571636314166534255',
  apiBase: '/api',
  avatarPrefix: '/avatar',
  giochiAttivi: ['pong', 'smash']
};
