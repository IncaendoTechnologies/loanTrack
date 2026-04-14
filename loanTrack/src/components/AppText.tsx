import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT } from '../theme/typography';

const AppText = ({ variant = 'body', weight = 'regular', style, children }: any) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: FONT_SIZE[variant],
          lineHeight: LINE_HEIGHT[variant],
          fontFamily: FONT_FAMILY[weight],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default AppText;

const styles = StyleSheet.create({
  text: {
    color: COLORS.text,
  },
});