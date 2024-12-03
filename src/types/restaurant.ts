export interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  isOpen: boolean;
  isOpeningSoon: boolean;
  cuisine: (keyof typeof Cuisine)[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  menu: {
    imageUrl: string;
    order: number;
  }[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  delivery?: {
    whatsapp?: string;
    phone?: string;
  };
  /*
$ = Menos de $100 MXN por persona
$$ = $150-300 MXN por persona
$$$ = $300-600 MXN por persona
$$$$ = Más de $600 MXN por persona
*/
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  features: {
    reservations?: boolean;
    outdoorSeating?: boolean;
    wifi?: boolean;
    hasAC?: boolean;
    hasParking?: boolean;
    kidsFriendly?: boolean;
    freeDelivery?: boolean;
  };
  paymentMethods: (keyof typeof PaymentMethod)[];
  location?: {
    address?: string;
    mapUrl?: string;
  };
}

export enum PaymentMethod {
  Efectivo = 'Efectivo',
  Tarjeta = 'Tarjeta',
  Transferencia = 'Transferencia'
}

export enum Cuisine {
  Tacos = 'Tacos',
  Sushi = 'Sushi',
  Pizza = 'Pizza',
  Hamburguesa = 'Hamburguesa',
  Italiana = 'Italiana',
  Americana = 'Americana',
  Mexicana = 'Mexicana',
  'Comida Callejera' = 'Comida Callejera',
  Asiatica = 'Asiatica'
}
