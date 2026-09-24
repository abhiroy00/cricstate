import CollectionScreen from "./CollectionScreen";

export default function PicksUnder499Screen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "PicksUnder499" }}
      collectionKey="under499"
    />
  );
}
