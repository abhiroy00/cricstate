import CollectionScreen from "./CollectionScreen";

export default function BestsellersScreen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "Bestsellers" }}
      collectionKey="bestsellers"
    />
  );
}
