import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, ActivityIndicator, Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBatch } from '../../api/gyms';
import type { AddBatchesScreenProps } from '../../navigation/types';

interface BatchForm {
  name: string;
  start_time: string;
  end_time: string;
}

const EMPTY_BATCH: BatchForm = { name: '', start_time: '', end_time: '' };

const AddBatchesScreen = ({ route, navigation }: AddBatchesScreenProps) => {
  const { gymId } = route.params;
  const [batches, setBatches] = useState<BatchForm[]>([{ ...EMPTY_BATCH }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const updateBatch = (index: number, field: keyof BatchForm, value: string) => {
    setBatches(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const addBatch = () => setBatches(prev => [...prev, { ...EMPTY_BATCH }]);

  const removeBatch = (index: number) => {
    if (batches.length === 1) return;
    setBatches(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    const valid = batches.every(b => b.name && timeRegex.test(b.start_time) && timeRegex.test(b.end_time));
    if (!valid) {
      setError('Please fill all batch fields. Times must be in HH:MM format (e.g. 06:00).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await Promise.all(batches.map(b => createBatch(gymId, {
        name: b.name,
        start_time: b.start_time,
        end_time: b.end_time,
      })));
      navigation.navigate('SetupComplete');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save batches.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.topTitle}>Add Batches</Text>
        <Text style={styles.topSub}>Set up time slots for your members</Text>
      </Animated.View>

      <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.cardScroll}
        >
          {batches.map((batch, index) => (
            <View key={index} style={styles.batchCard}>
              <View style={styles.batchCardHeader}>
                <Text style={styles.batchCardTitle}>Batch {index + 1}</Text>
                {batches.length > 1 && (
                  <TouchableOpacity onPress={() => removeBatch(index)}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Batch Name *</Text>
                <TextInput
                  style={styles.input}
                  value={batch.name}
                  onChangeText={v => updateBatch(index, 'name', v)}
                  placeholder="e.g. Morning, Evening"
                  placeholderTextColor={PLACEHOLDER}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldWrap, styles.flex]}>
                  <Text style={styles.label}>Start Time *</Text>
                  <TextInput
                    style={styles.input}
                    value={batch.start_time}
                    onChangeText={v => updateBatch(index, 'start_time', v)}
                    placeholder="06:00"
                    placeholderTextColor={PLACEHOLDER}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <View style={styles.rowSpacer} />
                <View style={[styles.fieldWrap, styles.flex]}>
                  <Text style={styles.label}>End Time *</Text>
                  <TextInput
                    style={styles.input}
                    value={batch.end_time}
                    onChangeText={v => updateBatch(index, 'end_time', v)}
                    placeholder="08:00"
                    placeholderTextColor={PLACEHOLDER}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addMoreBtn} onPress={addBatch}>
            <Ionicons name="add-circle-outline" size={18} color={BG} />
            <Text style={styles.addMoreText}>Add Another Batch</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>FINISH SETUP</Text>}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default AddBatchesScreen;

const BG = '#0D1A2D';
const PLACEHOLDER = '#C0C0C0';
const DIVIDER = '#E8E8E8';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  row: { flexDirection: 'row' },
  rowSpacer: { width: 16 },
  backBtn: { marginBottom: 12 },
  topSection: { paddingTop: 56, paddingHorizontal: 32, paddingBottom: 32 },
  stepLabel: { fontSize: 12, color: '#8890A8', fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  topTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', lineHeight: 38 },
  topSub: { fontSize: 14, color: '#8890A8', marginTop: 6 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cardScroll: { paddingHorizontal: 32, paddingTop: 36, paddingBottom: 24 },
  batchCard: { backgroundColor: '#F8F9FC', borderRadius: 12, padding: 16, marginBottom: 16 },
  batchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  batchCardTitle: { fontSize: 14, fontWeight: '700', color: BG },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: { fontSize: 15, color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 10, padding: 0 },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 12, marginBottom: 16 },
  addMoreText: { fontSize: 14, color: BG, fontWeight: '600' },
  errorText: { fontSize: 13, color: '#E53935', textAlign: 'center', marginBottom: 12 },
  btn: { backgroundColor: BG, borderRadius: 30, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
});
