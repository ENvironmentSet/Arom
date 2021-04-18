import { createContext, useContext } from 'react';

const configurationContext = createContext(null);

export const { Provider } = configurationContext;

export function useConfigurationState() {
  return useContext(configurationContext);
}
