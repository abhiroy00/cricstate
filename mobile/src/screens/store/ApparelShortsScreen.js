import CollectionScreen from "./CollectionScreen";

export default function ApparelShortsScreen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "ApparelShorts" }}
      collectionKey="shorts"
    />
  );
}
