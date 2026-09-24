import CollectionScreen from "./CollectionScreen";

export default function DesignOfMonthScreen({ navigation, route }) {
  return (
    <CollectionScreen
      navigation={navigation}
      route={{ ...route, name: "DesignOfMonth" }}
      collectionKey="design"
    />
  );
}
