import { Middleware } from 'redux';
import { RootState } from './store';

// Utility function to check if a value is a Date object
const isDate = (value: any): boolean => value instanceof Date;

// Utility function to check if a string is a valid ISO date string
const isIsoDateString = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
};

// Recursively serialize Date objects
export const serializeDates = (obj: any): any => {
  if (obj === null) {
    return null;
  }

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
export const deserializeDates = (obj: any): any => {
  if (obj === null) return null;

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

// Utility function (as defined above)
export function convertEmptyObjectsToNull(obj: any): any {

  let newObj = obj;
  if (newObj && typeof newObj === 'object' && !Array.isArray(newObj)) {
    const keys = Object.keys(newObj);
    if (keys.length === 0) {
      return null; // Replace empty object with null
    }

    // Recursively apply to nested objects
    
    for (const key of keys) {
      newObj[key] = convertEmptyObjectsToNull(newObj[key]);
    }
  }

  return newObj;
}

// Middleware to serialize and deserialize dates
const dateMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  // Serialize Dates in the action payload before passing it to the reducer
  if (action.payload) {
    const serializedAction = {
      ...action,
      payload: serializeDates(action.payload),
      // payload: action.payload,
    };
    return next(serializedAction);
  }

  // Proceed with the original action if there's no payload to serialize
  return next(action);
};

// Selectors or other middleware can use deserializeDates to convert the state back to Date objects when needed

export default dateMiddleware;
