import { Middleware } from 'redux';

// Utility function to check if a value is a Date object
const isDate = (value: any): boolean => value instanceof Date;

// Utility function to check if a string is a valid ISO date string
const isIsoDateString = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
};

// Recursively serialize Date objects
const serializeDates = (obj: any): any => {
  if (isDate(obj)) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeDates(obj[key]);
      return acc;
    }, {} as any);
  }

  return obj;
};

// Recursively deserialize ISO date strings back to Date objects
const deserializeDates = (obj: any): any => {
  if (typeof obj === 'string' && isIsoDateString(obj)) {
    return new Date(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(deserializeDates);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = deserializeDates(obj[key]);
      return acc;
    }, {} as any);
  }

  return obj;
};

// Middleware to serialize and deserialize dates
const dateMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  // Serialize Dates in the action payload before passing it to the reducer
  if (action.payload) {
    const serializedAction = {
      ...action,
      payload: serializeDates(action.payload),
    };
    return next(serializedAction);
  }

  // Proceed with the original action if there's no payload to serialize
  return next(action);
};

// Selectors or other middleware can use deserializeDates to convert the state back to Date objects when needed
const selectDateState = (state: any) => deserializeDates(state.some.dateString);

export default dateMiddleware;
