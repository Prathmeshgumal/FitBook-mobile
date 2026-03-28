import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = [
  '#0D1A2D', '#1B5E20', '#4A148C', '#B71C1C',
  '#E65100', '#006064', '#1A237E', '#37474F',
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

interface Props {
  name: string;
  size?: number;
  fontSize?: number;
}

const Avatar = ({ name, size = 44, fontSize = 15 }: Props) => {
  const bg = colorFromName(name);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize }]}>{initials(name)}</Text>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '700' },
});
