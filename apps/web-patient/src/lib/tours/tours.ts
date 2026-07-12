import type { TourDefinition } from "./TourContext";

export const tours: TourDefinition[] = [
  {
    id: "dashboard",
    name: "Tour del Dashboard",
    startRoute: "/dashboard",
    steps: [
      {
        selector: '[data-tour="credit-lines"]',
        title: "Tus líneas de crédito",
        body: "Aquí ves tus 3 líneas: Salud Cotidiana, Especialidad y Mayor Cuidado. Cada una tiene su propio saldo disponible y condiciones.",
        side: "bottom",
      },
      {
        selector: '[data-tour="quick-actions"]',
        title: "Acciones rápidas",
        body: "Acceso directo a Triaje, Pagar con QR, Medicinas por suscripción, Cuidado Mayor, Comercios, Catálogo y tus Cuotas.",
        side: "bottom",
      },
      {
        selector: '[data-tour="upcoming-payments"]',
        title: "Próximos pagos",
        body: "Tus cuotas pendientes ordenadas por fecha de vencimiento. Toca cualquiera para ver el detalle y pagar.",
        side: "top",
      },
      {
        selector: '[data-tour="bottom-nav"]',
        title: "Navegación",
        body: "Usa la barra inferior para moverte entre Inicio, Comprar, Cuotas y tu Perfil en cualquier momento.",
        side: "top",
      },
    ],
  },
  {
    id: "comercios",
    name: "Tour de Comercios",
    startRoute: "/comercios",
    steps: [
      {
        selector: '[data-tour="merchant-list"]',
        title: "Directorio de comercios",
        body: "Estos son todos los comercios aliados: farmacias, clínicas, laboratorios y más. Toca cualquiera para ver su catálogo.",
        side: "bottom",
      },
      {
        selector: '[data-tour="merchant-search"]',
        title: "Buscar comercio",
        body: "Filtra por nombre o tipo de servicio para encontrar lo que necesitas rápidamente.",
        side: "bottom",
      },
    ],
  },
  {
    id: "merchant-detail",
    name: "Tour del Comercio",
    startRoute: "/comercios",
    steps: [
      {
        selector: '[data-tour="merchant-tabs"]',
        title: "Servicios e Insumos",
        body: "Cada comercio tiene dos pestañas: Servicios médicos (consultas, procedimientos) e Insumos (medicamentos, equipos).",
        side: "bottom",
      },
      {
        selector: '[data-tour="catalog-item"]',
        title: "Items del catálogo",
        body: "Cada item muestra su precio en USD y VES. Los que tienen ícono de receta requieren fórmula médica. Toca 'Agregar' para añadirlo al carrito.",
        side: "bottom",
      },
      {
        selector: '[data-tour="checkout-cart"]',
        title: "Carrito de compra",
        body: "Aquí ves todo lo que agregaste. El monto total se divide entre la inicial y las cuotas restantes. Confirma para generar tu transacción.",
        side: "top",
      },
    ],
  },
  {
    id: "pay-installment",
    name: "Tour de Pago de Cuotas",
    startRoute: "/cuotas",
    steps: [
      {
        selector: '[data-tour="installment-list"]',
        title: "Tus cuotas",
        body: "Lista de todas tus cuotas pendientes. Las urgentes (vencen en 2 días o menos) se destacan en rojo.",
        side: "bottom",
      },
      {
        selector: '[data-tour="installment-card"]',
        title: "Detalle de cuota",
        body: "Toca una cuota para ver el detalle completo: monto en USD y VES, fecha de vencimiento y opciones de pago.",
        side: "top",
      },
    ],
  },
  {
    id: "pay-card",
    name: "Tour de Pago con Tarjeta",
    startRoute: "/cuotas",
    steps: [
      {
        selector: '[data-tour="card-form"]',
        title: "Formulario de tarjeta",
        body: "Ingresa los datos de tu tarjeta. Usamos una pasarela de pago segura. Puedes usar las tarjetas de prueba para simular el pago.",
        side: "bottom",
      },
      {
        selector: '[data-tour="test-cards"]',
        title: "Tarjetas de prueba",
        body: "Estos botones rellenan el formulario automáticamente con tarjetas de test: aprobada, rechazada y fondos insuficientes.",
        side: "top",
      },
      {
        selector: '[data-tour="amount-summary"]',
        title: "Resumen del pago",
        body: "Ves el monto en USD y su equivalente en bolívares (VES) a la tasa BCV del día antes de confirmar.",
        side: "bottom",
      },
    ],
  },
  {
    id: "catalog",
    name: "Tour del Catálogo Global",
    startRoute: "/catalogo",
    steps: [
      {
        selector: '[data-tour="catalog-search"]',
        title: "Buscar en todo el catálogo",
        body: "Busca servicios o insumos médicos en todos los comercios a la vez. Filtra por nombre, categoría o tipo.",
        side: "bottom",
      },
      {
        selector: '[data-tour="catalog-results"]',
        title: "Resultados",
        body: "Cada resultado muestra el comercio, precio y si requiere receta. Toca para ir al comercio y agregarlo a tu carrito.",
        side: "top",
      },
    ],
  },
];

export function getTourById(id: string): TourDefinition | undefined {
  return tours.find((t) => t.id === id);
}
