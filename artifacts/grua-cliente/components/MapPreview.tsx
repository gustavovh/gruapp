import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import MapView, { Marker as RNMarker, Polyline } from "react-native-maps";

import type { LatLng } from "@/contexts/ServiceContext";
import { useColors } from "@/hooks/useColors";

interface Marker {
  id: string;
  coordinate: LatLng;
  color: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
}

interface Props {
  center: LatLng;
  markers?: Marker[];
  showRoute?: boolean;
  routeFrom?: LatLng;
  routeTo?: LatLng;
  style?: ViewStyle | ViewStyle[];
  interactive?: boolean;
}

export function MapPreview({
  center,
  markers = [],
  showRoute,
  routeFrom,
  routeTo,
  style,
  interactive = true,
}: Props) {
  const colors = useColors();

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}
        region={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {markers.map((m) => (
          <RNMarker
            key={m.id}
            coordinate={m.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.markerOuter,
                { backgroundColor: m.color + "33", borderColor: m.color },
              ]}
            >
              <View style={[styles.markerInner, { backgroundColor: m.color }]}>
                {m.icon ? (
                  <MaterialCommunityIcons
                    name={m.icon}
                    size={16}
                    color="#fff"
                  />
                ) : null}
              </View>
            </View>
          </RNMarker>
        ))}
        {showRoute && routeFrom && routeTo ? (
          <Polyline
            coordinates={[routeFrom, routeTo]}
            strokeColor={colors.primary}
            strokeWidth={4}
            lineDashPattern={[8, 6]}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#E8EEF4",
  },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
