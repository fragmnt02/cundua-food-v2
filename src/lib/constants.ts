export const CITY_USER_FRIENDLY_NAME = {
  // balancan: 'Balancán',
  // cardenas: 'Cárdenas',
  // centla: 'Centla',
  centro: 'Centro',
  // comalcalco: 'Comalcalco',
  cunduacan: 'Cunduacán'
  // emiliano_zapata: 'Emiliano Zapata',
  // huimanguillo: 'Huimanguillo',
  // jalapa: 'Jalapa',
  // jalpa_de_mendez: 'Jalpa de Méndez',
  // jonuta: 'Jonuta',
  // macuspana: 'Macuspana',
  // nacajuca: 'Nacajuca',
  // paraiso: 'Paraíso',
  // tacotalpa: 'Tacotalpa',
  // teapa: 'Teapa',
  // tenosique: 'Tenosique'
};

export const CITIES = Object.keys(CITY_USER_FRIENDLY_NAME);

export type DeliveryCompany = {
  name: string;
  phone: string;
  open: string;
  close: string;
};

export type CityDeliveryCompanies = {
  [K in keyof typeof CITY_USER_FRIENDLY_NAME]: DeliveryCompany[];
};

export const DELIVERY_COMPANIES: CityDeliveryCompanies = {
  cunduacan: [
    {
      name: 'Rapidito',
      phone: '914 113 9222',
      open: '08:00',
      close: '18:00'
    },
    {
      name: 'Turbomoto',
      phone: '914 122 2478',
      open: '08:00',
      close: '23:00'
    }
  ],
  centro: []
} as const;
