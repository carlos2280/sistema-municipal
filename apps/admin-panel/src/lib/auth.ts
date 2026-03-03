const STORAGE_KEY = "admin-api-key";

export const getApiKey = (): string | null =>
  sessionStorage.getItem(STORAGE_KEY);

export const setApiKey = (key: string): void =>
  sessionStorage.setItem(STORAGE_KEY, key);

export const clearApiKey = (): void => sessionStorage.removeItem(STORAGE_KEY);

export const isAuthenticated = (): boolean => !!getApiKey();
