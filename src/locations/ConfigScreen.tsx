import { useCallback, useState, useEffect } from "react";
import { ConfigAppSDK } from "@contentful/app-sdk";
import { 
  Heading, 
  Form, 
  Paragraph, 
  Flex,
  Textarea,
  FormControl,
  Button,
  Note
} from "@contentful/f36-components";
import { css } from "emotion";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import { AppConfiguration, DEFAULT_CONFIG } from "../types/config";

export interface AppInstallationParameters {
  richTextConfig?: AppConfiguration;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [configText, setConfigText] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const sdk = useSDK<ConfigAppSDK>();
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  const validateConfiguration = (configString: string): AppConfiguration | null => {
    try {
      const config = JSON.parse(configString);
      
      // Basic validation
      if (!config.colors || !Array.isArray(config.colors)) {
        throw new Error("Configuration must have a 'colors' array");
      }
      
      if (!config.typography || typeof config.typography !== 'object') {
        throw new Error("Configuration must have a 'typography' object");
      }
      
      if (!config.lists || !Array.isArray(config.lists)) {
        throw new Error("Configuration must have a 'lists' array");
      }

      // Validate colors structure
      for (const color of config.colors) {
        if (!color.key || !color.name || !color.value) {
          throw new Error("Each color must have 'key', 'name', and 'value' properties");
        }
      }

      return config as AppConfiguration;
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON');
      return null;
    }
  };

  const handleConfigChange = (value: string) => {
    setConfigText(value);
    setValidationError("");
    
    if (value.trim()) {
      const config = validateConfiguration(value);
      if (config) {
        setParameters({ richTextConfig: config });
      }
    } else {
      setParameters({ richTextConfig: DEFAULT_CONFIG });
    }
  };

  const loadExampleConfig = () => {
    const exampleConfig = JSON.stringify(DEFAULT_CONFIG, null, 2);
    setConfigText(exampleConfig);
    handleConfigChange(exampleConfig);
  };

  const onConfigure = useCallback(async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    
    // Validate configuration before saving
    if (configText.trim()) {
      const config = validateConfiguration(configText);
      if (!config) {
        return false; // Prevent saving if validation fails
      }
    }

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState = await sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk, configText]);

  useEffect(() => {
    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null =
        await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
        
        // If there's a saved configuration, display it in the textarea
        if (currentParameters.richTextConfig) {
          const configJson = JSON.stringify(currentParameters.richTextConfig, null, 2);
          setConfigText(configJson);
        }
      } else {
        // Set default configuration for new installations
        setParameters({ richTextConfig: DEFAULT_CONFIG });
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex
      flexDirection="column"
      className={css({ margin: "80px", maxWidth: "800px" })}
    >
      <Form>
        <Heading>Rich Text Editor Configuration</Heading>
        <Paragraph>
          Configure your custom rich text editor with colors, typography, and list options.
          Generate a configuration using the processing script or use the default configuration.
        </Paragraph>
        
        <FormControl>
          <FormControl.Label>Configuration JSON</FormControl.Label>
          <FormControl.HelpText>
            Paste your generated configuration JSON here. Leave empty to use default configuration.
          </FormControl.HelpText>
          <Textarea
            value={configText}
            onChange={(e) => handleConfigChange(e.target.value)}
            placeholder="Paste your configuration JSON here..."
            rows={20}
            resize="vertical"
            className={css({
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '12px'
            })}
          />
          {validationError && (
            <Note variant="negative" style={{ marginTop: '8px' }}>
              {validationError}
            </Note>
          )}
        </FormControl>

        <Flex gap="spacingS" style={{ marginTop: '16px' }}>
          <Button 
            variant="secondary" 
            onClick={loadExampleConfig}
          >
            Load Default Configuration
          </Button>
        </Flex>

        <Note variant="primary" style={{ marginTop: '16px' }}>
          <strong>To generate a custom configuration:</strong>
          <br />
          1. Create your <code>tailwind.config.json</code> and <code>richtext.json</code> files
          <br />
          2. Run: <code>npm run process-config tailwind.config.json richtext.json</code>
          <br />
          3. Copy the output and paste it above
        </Note>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
