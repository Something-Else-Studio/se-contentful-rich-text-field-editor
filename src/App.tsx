import { FieldAppSDK, locations } from "@contentful/app-sdk";
import ConfigScreen from "./locations/ConfigScreen";
import Field from "./locations/Field";
import EntryEditor from "./locations/EntryEditor";
import Dialog from "./locations/Dialog";
import Sidebar from "./locations/Sidebar";
import Page from "./locations/Page";
import Home from "./locations/Home";
import { useSDK } from "@contentful/react-apps-toolkit";
import SERichTextEditor from "./components/SERichTextEditor";

const _ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_FIELD]: Field,
  [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
  [locations.LOCATION_DIALOG]: Dialog,
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
  [locations.LOCATION_PAGE]: Page,
  [locations.LOCATION_HOME]: Home,
};

const App = () => {
  const sdk = useSDK();

  if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    return <SERichTextEditor sdk={sdk as FieldAppSDK} isInitiallyDisabled />;
  }

  return null;
};

export default App;
