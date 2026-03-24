import BandejaTickets from '../pages/BandejaTickets'
import DetalleTicket from '../pages/DetalleTicket'
import GestionCategorias from '../pages/GestionCategorias'
import NuevoTicket from '../pages/NuevoTicket'

const mesaAyudaRoutes = {
  sistemaId: 5,
  components: {
    bandeja_tickets: <BandejaTickets />,
    detalle_ticket: <DetalleTicket />,
    nuevo_ticket: <NuevoTicket />,
    categorias: <GestionCategorias />,
  },
}

export default mesaAyudaRoutes
