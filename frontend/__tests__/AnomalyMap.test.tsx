import React from 'react';
import { render } from '@testing-library/react-native';
import AnomalyMap, { Hotspot } from '../components/AnomalyMap';

describe('AnomalyMap', () => {
  it('test_renders_without_crashing', () => {
    expect(() => render(<AnomalyMap />)).not.toThrow();
  });

  it('test_renders_default_hotspots', () => {
    const { getByText } = render(<AnomalyMap />);
    expect(getByText('Water Leak')).toBeTruthy();
  });

  it('test_renders_custom_hotspots', () => {
    const customHotspots: Hotspot[] = [
      {
        id: '99',
        title: 'Custom Electrical Fault',
        description: 'Testing 123',
        coordinate: { latitude: 0, longitude: 0 },
        type: 'electrical'
      }
    ];

    const { getByText, queryByText } = render(<AnomalyMap hotspots={customHotspots} />);

    expect(getByText('Custom Electrical Fault')).toBeTruthy();
    expect(queryByText('Water Leak')).toBeNull(); // Default hotspot should not be there
  });
});
