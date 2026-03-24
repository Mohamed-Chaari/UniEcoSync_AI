import React from 'react';
import { render } from '@testing-library/react-native';
import RewardsBadge from '../components/RewardsBadge';

describe('RewardsBadge', () => {
  it('test_renders_points', () => {
    const { getByText } = render(<RewardsBadge points={340} />);
    expect(getByText('340')).toBeTruthy();
  });

  it('test_renders_zero_points', () => {
    const { getByText } = render(<RewardsBadge points={0} />);
    expect(getByText('0')).toBeTruthy();
  });
});
