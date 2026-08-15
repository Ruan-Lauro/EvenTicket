export interface TicketMasterEvent {
  id: string;
  name: string;
  url?: string;
  pleaseNote?: string;
  info?: string;
  images?: {
    url: string;
    width?: number;
    height?: number;
    ratio?: string;
    fallback?: boolean;
  }[];
  dates: {
    start: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
    };
    status?: {
      code?: string;
    };
  };
  _embedded?: {
    venues?: {
      id: string;
      name: string;
      city?: {
        name: string;
      };
      state?: {
        name: string;
        stateCode?: string;
      };
      country?: {
        name: string;
        countryCode?: string;
      };
      address?: {
        line1?: string;
      };
    }[];
  };
  classifications?: {
    primary?: boolean;
    segment?: {
      name: string;
    };
    genre?: {
      name: string;
    };
    subGenre?: {
      name: string;
    };
  }[];
}

export interface TicketMasterResponse {
  _embedded?: {
    events: TicketMasterEvent[];
  };

  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface Classification {
  id?: string;
  segment?: {
    id: string;
    name: string;
  };
  type?: {
    id: string;
    name: string;
  };
  family: boolean;
}

export interface ClassificationsResponse {
  classifications: Classification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}