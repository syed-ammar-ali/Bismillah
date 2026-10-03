export const fontFamilies = {
  display: 'CormorantGaramond_600SemiBold',
  title: 'CormorantGaramond_600SemiBold',
  heading: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  caption: 'Inter_500Medium',
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 56,
    fontWeight: '600' as const,
  },
  title: {
    fontFamily: fontFamilies.title,
    fontSize: 28,
    fontWeight: '600' as const,
  },
  heading: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: fontFamilies.caption,
    fontSize: 12,
    fontWeight: '500' as const,
  },
} as const;
