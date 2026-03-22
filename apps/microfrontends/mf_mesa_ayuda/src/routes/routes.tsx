import BandejaTickets from '../pages/BandejaTickets';
import DetalleTicketPage from '../pages/DetalleTicketPage';
import NuevoTicketPage from '../pages/NuevoTicketPage';
import GestionCategorias from '../pages/GestionCategorias';

const mesaAyudaRoutes = {
  sistemaId: 5,
  components: {
    bandeja_tickets: <BandejaTickets />,
    detalle_ticket: <DetalleTicketPage />,
    nuevo_ticket: <NuevoTicketPage />,
    categorias: <GestionCategorias />,
  },
};

export default mesaAyudaRoutes;
