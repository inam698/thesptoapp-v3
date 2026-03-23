import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAnnouncement, AnnouncementType } from '@/hooks/useAnnouncement';

const TYPE_STYLES: Record<AnnouncementType, { bg: string; text: string; border: string; emoji: string }> = {
  info:    { bg: '#F5EEF8', text: '#9B6DAE', border: '#C69FD5', emoji: '📢' },
  warning: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D', emoji: '⚠️' },
  success: { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7', emoji: '✅' },
  urgent:  { bg: '#FFF0F3', text: '#E8879C', border: '#F2C4CE', emoji: '🚨' },
};

export default function AnnouncementBanner() {
  const { announcement, dismiss } = useAnnouncement();

  if (!announcement) return null;

  const style = TYPE_STYLES[announcement.type] ?? TYPE_STYLES.info;

  return (
    <View style={[styles.container, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={styles.emoji}>{style.emoji}</Text>
      <Text style={[styles.message, { color: style.text }]} numberOfLines={3}>
        {announcement.message}
      </Text>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.closeText, { color: style.text }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  emoji: {
    fontSize: 18,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    flexShrink: 0,
    padding: 2,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
