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
  information?: string;
  rating: number;
  videoUrl?: string;
  type: RestaurantType;
}

export enum PaymentMethod {
  Efectivo = 'Efectivo',
  Tarjeta = 'Tarjeta',
  Transferencia = 'Transferencia'
}

export enum Cuisine {
  Alitas = 'Alitas',
  Antojitos = 'Antojitos',
  Aves = 'Aves',
  Burritos = 'Burritos',
  Cafe = 'Cafe',
  Caldos = 'Caldos',
  Carnitas = 'Carnitas',
  Cochinita = 'Cochinita',
  ComidaCasera = 'Comida Casera',
  ComidaCallejera = 'Comida Callejera',
  ComidaRapida = 'Comida Rápida',
  ComidaTipica = 'Comida Típica',
  ComidaVegetariana = 'Comida Vegetariana',
  ComidaVegana = 'Comida Vegana',
  Cortes = 'Cortes',
  Desayunos = 'Desayunos',
  Gourmet = 'Gourmet',
  Hamburguesas = 'Hamburguesas',
  Helados = 'Helados',
  HotDogs = 'Hot Dogs',
  Jugos = 'Jugos',
  Mariscos = 'Mariscos',
  Panaderia = 'Panadería',
  Pizza = 'Pizza',
  Postres = 'Postres',
  Saludable = 'Saludable',
  Sushi = 'Sushi',
  Tacos = 'Tacos',
  Tortas = 'Tortas',
  Tamales = 'Tamales',
  Tostadas = 'Tostadas',
  Empanadas = 'Empanadas',
  Pastas = 'Pastas',
  Ensaladas = 'Ensaladas',
  Sopas = 'Sopas',
  Pescados = 'Pescados',
  Mexicana = 'Mexicana',
  Oriental = 'Oriental',
  Italiana = 'Italiana',
  Japonesa = 'Japonesa'
}

export enum Day {
  Domingo = 'Domingo',
  Lunes = 'Lunes',
  Martes = 'Martes',
  Miercoles = 'Miércoles',
  Jueves = 'Jueves',
  Viernes = 'Viernes',
  Sabado = 'Sábado'
}

export enum RestaurantType {
  Restaurant = 'restaurant',
  FoodTruck = 'foodTruck',
  DarkKitchen = 'darkKitchen',
  FoodCourt = 'foodCourt',
  TakeAway = 'takeAway'
}
