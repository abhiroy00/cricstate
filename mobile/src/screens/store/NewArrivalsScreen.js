import CollectionScreen from "./CollectionScreen";

export default function NewArrivalsScreen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "NewArrivals" }}
      collectionKey="new"
    />
  );
}
