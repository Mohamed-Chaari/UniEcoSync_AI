import React from 'react';
import { View } from 'react-native';

const MapView = (props) => <View testID="mock-map-view" {...props} />;
const Marker = (props) => <View testID="mock-marker" {...props} />;

export default MapView;
export { Marker };
