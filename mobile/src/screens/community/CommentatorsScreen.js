import RoleBoardScreen from "./RoleBoardScreen";

export default function CommentatorsScreen({ navigation, route }) {
  const params = route?.params || {};
  const mergedRoute = {
    ...route,
    params: {
      role: "commentators",
      ...params,
      city: params.city || "Delhi",
    },
  };
  return <RoleBoardScreen navigation={navigation} route={mergedRoute} />;
}
