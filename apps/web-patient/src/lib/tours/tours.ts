import type { TourDefinition } from "./TourContext";

export const tours: TourDefinition[] = [
  {
    id: "dashboard",
    name: "names.dashboard",
    startRoute: "/dashboard",
    steps: [
      {
        selector: '[data-tour="credit-lines"]',
        title: "dashboard.steps.0.title",
        body: "dashboard.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="quick-actions"]',
        title: "dashboard.steps.1.title",
        body: "dashboard.steps.1.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="upcoming-payments"]',
        title: "dashboard.steps.2.title",
        body: "dashboard.steps.2.body",
        side: "top",
      },
      {
        selector: '[data-tour="bottom-nav"]',
        title: "dashboard.steps.3.title",
        body: "dashboard.steps.3.body",
        side: "top",
      },
    ],
  },
  {
    id: "comercios",
    name: "names.comercios",
    startRoute: "/comercios",
    steps: [
      {
        selector: '[data-tour="merchant-list"]',
        title: "comercios.steps.0.title",
        body: "comercios.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="merchant-search"]',
        title: "comercios.steps.1.title",
        body: "comercios.steps.1.body",
        side: "bottom",
      },
    ],
  },
  {
    id: "merchant-detail",
    name: "names.merchant-detail",
    startRoute: "/comercios",
    steps: [
      {
        selector: '[data-tour="merchant-tabs"]',
        title: "merchant-detail.steps.0.title",
        body: "merchant-detail.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="catalog-item"]',
        title: "merchant-detail.steps.1.title",
        body: "merchant-detail.steps.1.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="checkout-cart"]',
        title: "merchant-detail.steps.2.title",
        body: "merchant-detail.steps.2.body",
        side: "top",
      },
    ],
  },
  {
    id: "pay-installment",
    name: "names.pay-installment",
    startRoute: "/cuotas",
    steps: [
      {
        selector: '[data-tour="installment-list"]',
        title: "pay-installment.steps.0.title",
        body: "pay-installment.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="installment-card"]',
        title: "pay-installment.steps.1.title",
        body: "pay-installment.steps.1.body",
        side: "top",
      },
    ],
  },
  {
    id: "pay-card",
    name: "names.pay-card",
    startRoute: "/cuotas",
    steps: [
      {
        selector: '[data-tour="card-form"]',
        title: "pay-card.steps.0.title",
        body: "pay-card.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="test-cards"]',
        title: "pay-card.steps.1.title",
        body: "pay-card.steps.1.body",
        side: "top",
      },
      {
        selector: '[data-tour="amount-summary"]',
        title: "pay-card.steps.2.title",
        body: "pay-card.steps.2.body",
        side: "bottom",
      },
    ],
  },
  {
    id: "catalog",
    name: "names.catalog",
    startRoute: "/catalogo",
    steps: [
      {
        selector: '[data-tour="catalog-search"]',
        title: "catalog.steps.0.title",
        body: "catalog.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="catalog-results"]',
        title: "catalog.steps.1.title",
        body: "catalog.steps.1.body",
        side: "top",
      },
    ],
  },
  {
    id: "health-profile",
    name: "names.health-profile",
    startRoute: "/salud",
    steps: [
      {
        selector: '[data-tour="health-summary"]',
        title: "health-profile.steps.0.title",
        body: "health-profile.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="health-vitals"]',
        title: "health-profile.steps.1.title",
        body: "health-profile.steps.1.body",
        side: "top",
      },
    ],
  },
  {
    id: "medical-records",
    name: "names.medical-records",
    startRoute: "/historial",
    steps: [
      {
        selector: '[data-tour="records-list"]',
        title: "medical-records.steps.0.title",
        body: "medical-records.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="record-detail"]',
        title: "medical-records.steps.1.title",
        body: "medical-records.steps.1.body",
        side: "top",
      },
    ],
  },
  {
    id: "appointments",
    name: "names.appointments",
    startRoute: "/citas",
    steps: [
      {
        selector: '[data-tour="appointment-list"]',
        title: "appointments.steps.0.title",
        body: "appointments.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="appointment-schedule"]',
        title: "appointments.steps.1.title",
        body: "appointments.steps.1.body",
        side: "top",
      },
    ],
  },
  {
    id: "medication-reminders",
    name: "names.medication-reminders",
    startRoute: "/recordatorios",
    steps: [
      {
        selector: '[data-tour="reminder-list"]',
        title: "medication-reminders.steps.0.title",
        body: "medication-reminders.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="reminder-add"]',
        title: "medication-reminders.steps.1.title",
        body: "medication-reminders.steps.1.body",
        side: "top",
      },
    ],
  },
  {
    id: "family-members",
    name: "names.family-members",
    startRoute: "/familia",
    steps: [
      {
        selector: '[data-tour="family-list"]',
        title: "family-members.steps.0.title",
        body: "family-members.steps.0.body",
        side: "bottom",
      },
      {
        selector: '[data-tour="family-add"]',
        title: "family-members.steps.1.title",
        body: "family-members.steps.1.body",
        side: "top",
      },
    ],
  },
];

export function getTourById(id: string): TourDefinition | undefined {
  return tours.find((t) => t.id === id);
}
