// Custom event names
export const AnalyticsEventNames = {
  PAGE_VIEW: 'page_view',
  VIEW_RESTAURANT: 'view_restaurant',
  RATE_RESTAURANT: 'rate_restaurant',
  ADD_COMMENT: 'add_comment',
  SELECT_CITY: 'select_city',
  SEARCH: 'search',
  SIGN_UP: 'sign_up',
  LOGIN: 'login'
} as const;

type EventNames =
  (typeof AnalyticsEventNames)[keyof typeof AnalyticsEventNames];

interface EventParams {
  page_path?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  rating?: number;
  city?: string;
  search_term?: string;
  method?: string;
}

// Type for the gtag function
declare global {
  interface Window {
    gtag: (
      command: 'event',
      eventName: EventNames,
      eventParams?: EventParams
    ) => void;
  }
}

// Analytics utility functions
export const analytics = {
  // Track page views
  pageview: (url: string) => {
    window.gtag('event', 'page_view', {
      page_path: url
    });
  },

  // Track restaurant views
  trackRestaurantView: (restaurantId: string, restaurantName: string) => {
    window.gtag('event', AnalyticsEventNames.VIEW_RESTAURANT, {
      restaurant_id: restaurantId,
      restaurant_name: restaurantName
    });
  },

  // Track ratings
  trackRating: (restaurantId: string, rating: number) => {
    window.gtag('event', AnalyticsEventNames.RATE_RESTAURANT, {
      restaurant_id: restaurantId,
      rating: rating
    });
  },

  // Track comments
  trackComment: (restaurantId: string) => {
    window.gtag('event', AnalyticsEventNames.ADD_COMMENT, {
      restaurant_id: restaurantId
    });
  },

  // Track city selection
  trackCitySelection: (city: string) => {
    window.gtag('event', AnalyticsEventNames.SELECT_CITY, {
      city: city
    });
  },

  // Track search
  trackSearch: (searchTerm: string) => {
    window.gtag('event', AnalyticsEventNames.SEARCH, {
      search_term: searchTerm
    });
  },

  // Track sign up
  trackSignUp: (method: string) => {
    window.gtag('event', AnalyticsEventNames.SIGN_UP, {
      method: method
    });
  },

  // Track login
  trackLogin: (method: string) => {
    window.gtag('event', AnalyticsEventNames.LOGIN, {
      method: method
    });
  }
};
