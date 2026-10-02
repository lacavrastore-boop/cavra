export const ESTADOS_PEDIDO: Record<string, string> = {
  pending: 'Pendiente de pago',
  paid: 'Por enviar',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  failed: 'Pago fallido',
};

export const claseEstado = (s: string) =>
  s === 'paid'
    ? 'border-oxido text-oxido'
    : s === 'shipped' || s === 'delivered'
      ? 'border-oliva text-oliva'
      : s === 'pending'
        ? 'border-cafe text-cafe'
        : 'border-linea text-texto-suave';

export const fechaCO = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
