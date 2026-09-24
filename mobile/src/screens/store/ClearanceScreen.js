import CollectionScreen from "./CollectionScreen";

export default function ClearanceScreen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "Clearance" }}
      collectionKey="clearance"
    />
  );
}
