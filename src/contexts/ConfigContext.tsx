import React, { createContext, useContext, useMemo } from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { AppConfiguration, DEFAULT_CONFIG } from '../types/config';

interface ConfigContextValue {
  config: AppConfiguration;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

interface ConfigProviderProps {
  sdk: FieldAppSDK;
  children: React.ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ sdk, children }) => {
  const config = useMemo(() => {
    // Get configuration from SDK parameters
    const installationParameters = sdk.parameters.installation as { richTextConfig?: AppConfiguration } | undefined;
    
    // Use provided configuration or fall back to default
    return installationParameters?.richTextConfig || DEFAULT_CONFIG;
  }, [sdk.parameters.installation]);

  const contextValue = useMemo(() => ({
    config
  }), [config]);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// Hook to get specific parts of the configuration
export const useColors = () => {
  const { config } = useConfig();
  return {
    colors: config.colors,
    enableHexPicker: config.enableHexPicker
  };
};

export const useTypography = () => {
  const { config } = useConfig();
  return config.typography;
};

export const useLists = () => {
  const { config } = useConfig();
  return config.lists;
};