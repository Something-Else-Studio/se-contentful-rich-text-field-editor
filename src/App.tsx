import { FieldAppSDK, locations } from "@contentful/app-sdk";
import ConfigScreen from "./locations/ConfigScreen";
import { useSDK } from "@contentful/react-apps-toolkit";
import SERichTextEditor from "./components/SERichTextEditor";

const App = () => {
  const sdk = useSDK();

  if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    return <SERichTextEditor sdk={sdk as FieldAppSDK} isInitiallyDisabled />;
  }
  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    return <ConfigScreen />;
  }

  return null;
};

export default App;
