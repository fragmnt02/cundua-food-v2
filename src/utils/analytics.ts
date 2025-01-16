// Custom event names
export const AnalyticsEventNames = {
  PAGE_VIEW: 'page_view',
  VIEW_RESTAURANT: 'view_restaurant',
  RATE_RESTAURANT: 'rate_restaurant',
  ADD_COMMENT: 'add_comment',
  SELECT_CITY: 'select_city',
  SEARCH: 'search',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  SOCIAL_MEDIA_CLICK: 'social_media_click',
  DELIVERY_CLICK: 'delivery_click',
  MENU_IMAGE_VIEW: 'menu_image_view',
  TAB_VIEW: 'tab_view',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_SPENT: 'time_spent',
  FILTER_USE: 'filter_use',
  FAVORITE_TOGGLE: 'favorite_toggle'
} as const;

interface EventParams {
  page_path?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  rating?: number;
  city?: string;
  search_term?: string;
  method?: string;
  platform?: string;
  delivery_type?: string;
  tab_name?: string;
  scroll_percentage?: number;
  time_seconds?: number;
  filter_type?: string;
  filter_value?: string;
  is_favorite?: boolean;
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
  },

  // Track social media clicks
  trackSocialMediaClick: (restaurantId: string, platform: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.SOCIAL_MEDIA_CLICK, {
      restaurant_id: restaurantId,
      platform: platform
    });
  },

  // Track delivery service clicks
  trackDeliveryClick: (restaurantId: string, deliveryType: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.DELIVERY_CLICK, {
      restaurant_id: restaurantId,
      delivery_type: deliveryType
    });
  },

  // Track menu image views
  trackMenuImageView: (restaurantId: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.MENU_IMAGE_VIEW, {
      restaurant_id: restaurantId
    });
  },

  // Track tab views
  trackTabView: (restaurantId: string, tabName: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.TAB_VIEW, {
      restaurant_id: restaurantId,
      tab_name: tabName
    });
  },

  // Track scroll depth
  trackScrollDepth: (restaurantId: string, scrollPercentage: number) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.SCROLL_DEPTH, {
      restaurant_id: restaurantId,
      scroll_percentage: scrollPercentage
    });
  },

  // Track time spent
  trackTimeSpent: (restaurantId: string, timeSeconds: number) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.TIME_SPENT, {
      restaurant_id: restaurantId,
      time_seconds: timeSeconds
    });
  },

  // Track filter usage
  trackFilterUse: (filterType: string, filterValue: string) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.FILTER_USE, {
      filter_type: filterType,
      filter_value: filterValue
    });
  },

  // Track favorite toggle
  trackFavoriteToggle: (restaurantId: string, isFavorite: boolean) => {
    if (!isAnalyticsEnabled()) return;
    window.gtag?.('event', AnalyticsEventNames.FAVORITE_TOGGLE, {
      restaurant_id: restaurantId,
      is_favorite: isFavorite
    });
  }
};
