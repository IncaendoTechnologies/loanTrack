import React from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT } from '../theme/typography';

const AppText = ({ variant = 'body', weight = 'regular', style, children, ...props }: any) => {
  const flattenedStyle = StyleSheet.flatten(style) || {};
  
  // Extract custom font weight from style to map it to our custom Poppins fonts
  let derivedWeight = weight;
  if (flattenedStyle.fontWeight) {
    const fw = flattenedStyle.fontWeight;
    if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900') {
      derivedWeight = 'bold';
    } else if (fw === '500' || fw === '600' || fw === 'semibold') {
      derivedWeight = 'medium';
    } else {
      derivedWeight = 'regular';
    }
  }

  // On iOS, custom fonts often fail if fontWeight is set in the same style object.
  // We remove it since our fontFamily already includes the weight (e.g. PoppinsBold).
  const { fontWeight, ...cleanStyle } = flattenedStyle;

  return (
    <Text
      {...props}
      style={[
        styles.text,
        {
          fontSize: flattenedStyle.fontSize || FONT_SIZE[variant],
          lineHeight: flattenedStyle.lineHeight || (flattenedStyle.fontSize ? undefined : LINE_HEIGHT[variant]),
          fontFamily: FONT_FAMILY[derivedWeight],
        },
        cleanStyle,
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