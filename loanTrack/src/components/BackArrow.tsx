import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

type BackArrowProps = {
  onPress: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
};

const BackArrow = ({
  onPress,
  color = COLORS.primary,
  size = 24,
  accessibilityLabel = 'Go back',
}: BackArrowProps) => (
  <TouchableOpacity style={styles.button} onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <View style={styles.iconWrapper}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    alignSelf: 'flex-start',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackArrow;
