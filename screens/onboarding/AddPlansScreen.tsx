import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createPlan } from '../../api/gyms';
import type { AddPlansScreenProps } from '../../navigation/types';

interface PlanForm {
  name: string;
  price: string;
  duration_value: string;
  duration_unit: 'months' | 'days';
}

const EMPTY_PLAN: PlanForm = { name: '', price: '', duration_value: '', duration_unit: 'months' };

const AddPlansScreen = ({ route, navigation }: AddPlansScreenProps) => {
  const { gymId } = route.params;
  const [plans, setPlans] = useState<PlanForm[]>([{ ...EMPTY_PLAN }]);
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

  const updatePlan = (index: number, field: keyof PlanForm, value: string) => {
    setPlans(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPlan = () => setPlans(prev => [...prev, { ...EMPTY_PLAN }]);

  const removePlan = (index: number) => {
    if (plans.length === 1) return;
    setPlans(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const valid = plans.every(p => p.name && p.price && p.duration_value);
    if (!valid) { setError('Please fill in all plan fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await Promise.all(plans.map(p => createPlan(gymId, {
        name: p.name,
        price: Number(p.price),
        duration_value: Number(p.duration_value),
        duration_unit: p.duration_unit,
      })));
      navigation.navigate('AddBatches', { gymId });
    } catch (err: any) {
      setError(err.message ?? 'Failed to save plans.');
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
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.topTitle}>Add Plans</Text>
        <Text style={styles.topSub}>Create membership plans for your gym</Text>
      </Animated.View>

      <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.cardScroll}
        >
          {plans.map((plan, index) => (
            <View key={index} style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardTitle}>Plan {index + 1}</Text>
                {plans.length > 1 && (
                  <TouchableOpacity onPress={() => removePlan(index)}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Plan Name *</Text>
                <TextInput style={styles.input} value={plan.name}
                  onChangeText={v => updatePlan(index, 'name', v)}
                  placeholder="e.g. Monthly, Quarterly" placeholderTextColor={PLACEHOLDER} />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput style={styles.input} value={plan.price}
                  onChangeText={v => updatePlan(index, 'price', v)}
                  placeholder="e.g. 1200" placeholderTextColor={PLACEHOLDER}
                  keyboardType="numeric" />
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldWrap, styles.flex]}>
                  <Text style={styles.label}>Duration *</Text>
                  <TextInput style={styles.input} value={plan.duration_value}
                    onChangeText={v => updatePlan(index, 'duration_value', v)}
                    placeholder="e.g. 1" placeholderTextColor={PLACEHOLDER}
                    keyboardType="numeric" />
                </View>
                <View style={styles.rowSpacer} />
                <View style={[styles.fieldWrap, styles.flex]}>
                  <Text style={styles.label}>Unit *</Text>
                  <View style={styles.unitRow}>
                    {(['months', 'days'] as const).map(u => (
                      <TouchableOpacity key={u} style={[styles.unitBtn, plan.duration_unit === u && styles.unitBtnActive]}
                        onPress={() => updatePlan(index, 'duration_unit', u)}>
                        <Text style={[styles.unitText, plan.duration_unit === u && styles.unitTextActive]}>
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addMoreBtn} onPress={addPlan}>
            <Ionicons name="add-circle-outline" size={18} color={BG} />
            <Text style={styles.addMoreText}>Add Another Plan</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleNext} activeOpacity={0.85} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>NEXT →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default AddPlansScreen;

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
  planCard: { backgroundColor: '#F8F9FC', borderRadius: 12, padding: 16, marginBottom: 16 },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planCardTitle: { fontSize: 14, fontWeight: '700', color: BG },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: { fontSize: 15, color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 10, padding: 0 },
  unitRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  unitBtn: { flex: 1, borderWidth: 1, borderColor: DIVIDER, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  unitBtnActive: { borderColor: BG, backgroundColor: BG },
  unitText: { fontSize: 13, color: '#555' },
  unitTextActive: { color: '#FFFFFF', fontWeight: '700' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 12, marginBottom: 16 },
  addMoreText: { fontSize: 14, color: BG, fontWeight: '600' },
  errorText: { fontSize: 13, color: '#E53935', textAlign: 'center', marginBottom: 12 },
  btn: { backgroundColor: BG, borderRadius: 30, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
});
