export interface Restaurant {
  id: string;
  name: string;
  logoUrl: string;
  coverImageUrl: string;
  /** @deprecated Use logoUrl instead */
  imageUrl?: string;
  isOpen: boolean;
  isOpeningSoon: boolean;
  cuisine: (keyof typeof Cuisine)[];
  hours: {
    day: string;
    slots: {
      open: string;
      close: string;
    }[];
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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    mapUrl?: string;
  };
  information?: string;
  rating: number;
  voteCount: number;
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
  Carnitas = 'Carnitas',
  Cochinita = 'Cochinita',
  ComidaCasera = 'Comida Casera',
  ComidaTipica = 'Comida Típica',
  ComidaVegana = 'Comida Vegana',
  ComidaVegetariana = 'Comida Vegetariana',
  Cortes = 'Cortes',
  Desayunos = 'Desayunos',
  Empanadas = 'Empanadas',
  Ensaladas = 'Ensaladas',
  Gourmet = 'Gourmet',
  Hamburguesas = 'Hamburguesas',
  Helados = 'Helados',
  HotDogs = 'Hot Dogs',
  Italiana = 'Italiana',
  Japonesa = 'Japonesa',
  Jugos = 'Jugos',
  Mariscos = 'Mariscos',
  Mexicana = 'Mexicana',
  Oriental = 'Oriental',
  Panaderia = 'Panadería',
  Pastas = 'Pastas',
  Pescados = 'Pescados',
  Pizza = 'Pizza',
  Postres = 'Postres',
  Quesadillas = 'Quesadillas',
  Saludable = 'Saludable',
  Sandwiches = 'Sandwiches',
  Snacks = 'Snacks',
  Sopas = 'Sopas',
  Sushi = 'Sushi',
  Tacos = 'Tacos',
  Tamales = 'Tamales',
  Tortas = 'Tortas',
  Tostadas = 'Tostadas'
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
  FoodCourt = 'foodCourt',
  TakeAway = 'takeAway'
}

export interface Vote {
  userId: string;
  restaurantId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  restaurantId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'client' | 'admin';
}
