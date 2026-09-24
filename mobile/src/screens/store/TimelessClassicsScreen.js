import CollectionScreen from "./CollectionScreen";

export default function TimelessClassicsScreen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "TimelessClassics" }}
      collectionKey="timeless"
    />
  );
}
