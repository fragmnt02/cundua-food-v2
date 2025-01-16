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

interface EventParams {
  page_path?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  rating?: number;
  city?: string;
  search_term?: string;
  method?: string;
}

interface ConsentParams {
  analytics_storage?: 'granted' | 'denied';
  [key: string]: string | undefined;
}

// Type for the gtag function
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'consent' | 'config',
      type: string,
      params?: EventParams | ConsentParams
    ) => void;
  }
}

const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

const isAnalyticsEnabled = () => {
  try {
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!preferences) return false;
    return JSON.parse(preferences).analytics === true;
  } catch {
    return false;
  }
};

// Analytics utility functions
export const analytics = {
  // Track page views
  pageview: (url: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', 'page_view', {
      page_path: url
    });
  },

  // Track restaurant views
  trackRestaurantView: (restaurantId: string, restaurantName: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.VIEW_RESTAURANT, {
      restaurant_id: restaurantId,
      restaurant_name: restaurantName
    });
  },

  // Track ratings
  trackRating: (restaurantId: string, rating: number) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.RATE_RESTAURANT, {
      restaurant_id: restaurantId,
      rating: rating
    });
  },

  // Track comments
  trackComment: (restaurantId: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.ADD_COMMENT, {
      restaurant_id: restaurantId
    });
  },

  // Track city selection
  trackCitySelection: (city: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.SELECT_CITY, {
      city: city
    });
  },

  // Track search
  trackSearch: (searchTerm: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.SEARCH, {
      search_term: searchTerm
    });
  },

  // Track sign up
  trackSignUp: (method: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.SIGN_UP, {
      method: method
    });
  },

  // Track login
  trackLogin: (method: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.LOGIN, {
      method: method
    });
  }
};
