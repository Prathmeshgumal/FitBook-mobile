import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar,
  Animated, ActivityIndicator, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useGym } from '../../context/GymContext';
import { listPlans, listBatches, type Plan, type Batch } from '../../api/gyms';
import { createMember } from '../../api/members';
import type { AddMemberStep1ScreenProps } from '../../navigation/types';

const GENDERS = ['male', 'female', 'other'];

const AddMemberStep1Screen = ({ navigation }: AddMemberStep1ScreenProps) => {
  const { gym } = useGym();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [admissionFees, setAdmissionFees] = useState('');
  const [comments, setComments] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [showBatchPicker, setShowBatchPicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    if (gym) {
      listPlans(gym.id).then(setPlans).catch(() => {});
      listBatches(gym.id).then(setBatches).catch(() => {});
    }
  }, [gym]);

  // Auto-generate membership ID preview when gym loads
  useEffect(() => {
    if (gym && !membershipId) {
      const prefix = gym.name.toUpperCase().replace(/\s+/g, '').substring(0, 4).padEnd(4, '_');
      const next = gym.member_serial + 1;
      setMembershipId(`${prefix}${String(next).padStart(4, '0')}`);
    }
  }, [gym]);

  const handleSave = async () => {
    if (!fullName || !phone || !selectedPlan || !purchaseDate) {
      setError('Name, phone, plan and payment date are required.');
      return;
    }
    if (!gym) return;
    setError('');
    setLoading(true);
    try {
      const member = await createMember(gym.id, {
        full_name: fullName,
        gender: gender || undefined,
        phone,
        membership_id: membershipId || undefined,
        plan_id: selectedPlan.id,
        batch_id: selectedBatch?.id,
        purchase_date: purchaseDate,
        paid_amount: paidAmount ? Number(paidAmount) : undefined,
        payment_method: paymentMethod || undefined,
        discount: discount ? Number(discount) : undefined,
        admission_fees: admissionFees ? Number(admissionFees) : undefined,
        comments: comments || undefined,
      });
      navigation.replace('AddMemberStep2', { memberId: member.id });
    } catch (err: any) {
      setError(err.message ?? 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = gym?.payment_methods?.enabled ? gym.payment_methods.options : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
        <Text style={styles.topTitle}>Add Member</Text>
        <Text style={styles.topSub}>Membership details</Text>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cardScroll}>

            <Field label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="e.g. Rohit Sharma" />

            {/* Gender */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.chipRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]}
                    onPress={() => setGender(prev => prev === g ? '' : g)}>
                    <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Field label="Phone Number *" value={phone} onChangeText={setPhone} placeholder="10–15 digits" keyboardType="phone-pad" />
            <Field label="Membership ID" value={membershipId} onChangeText={setMembershipId} placeholder="Auto-generated" />

            {/* Batch */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Batch</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowBatchPicker(v => !v)}>
                <Text style={selectedBatch ? styles.selectBtnText : styles.selectBtnPlaceholder}>
                  {selectedBatch ? `${selectedBatch.name} (${selectedBatch.start_time.substring(0,5)}–${selectedBatch.end_time.substring(0,5)})` : 'Select batch'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#8890A8" />
              </TouchableOpacity>
              {showBatchPicker && (
                <View style={styles.pickerDropdown}>
                  {batches.map(b => (
                    <TouchableOpacity key={b.id} style={styles.pickerItem}
                      onPress={() => { setSelectedBatch(b); setShowBatchPicker(false); }}>
                      <Text style={[styles.pickerItemText, selectedBatch?.id === b.id && styles.pickerItemActive]}>
                        {b.name} ({b.start_time.substring(0,5)}–{b.end_time.substring(0,5)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Plan */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Plan *</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowPlanPicker(v => !v)}>
                <Text style={selectedPlan ? styles.selectBtnText : styles.selectBtnPlaceholder}>
                  {selectedPlan ? `${selectedPlan.name} — ₹${selectedPlan.price}` : 'Select plan'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#8890A8" />
              </TouchableOpacity>
              {showPlanPicker && (
                <View style={styles.pickerDropdown}>
                  {plans.map(p => (
                    <TouchableOpacity key={p.id} style={styles.pickerItem}
                      onPress={() => { setSelectedPlan(p); setShowPlanPicker(false); }}>
                      <Text style={[styles.pickerItemText, selectedPlan?.id === p.id && styles.pickerItemActive]}>
                        {p.name} — ₹{p.price} / {p.duration_value} {p.duration_unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Field label="Payment Date *" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
            <Field label="Paid Amount (₹)" value={paidAmount} onChangeText={setPaidAmount} placeholder="0" keyboardType="numeric" />

            {paymentMethods.length > 0 && (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Payment Method</Text>
                <View style={styles.chipRow}>
                  {paymentMethods.map(m => (
                    <TouchableOpacity key={m} style={[styles.chip, paymentMethod === m && styles.chipActive]}
                      onPress={() => setPaymentMethod(prev => prev === m ? '' : m)}>
                      <Text style={[styles.chipText, paymentMethod === m && styles.chipTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Field label="Discount (₹)" value={discount} onChangeText={setDiscount} placeholder="0" keyboardType="numeric" />
            <Field label="Admission Fees (₹)" value={admissionFees} onChangeText={setAdmissionFees} placeholder="0" keyboardType="numeric" />
            <Field label="Comments" value={comments} onChangeText={setComments} placeholder="Optional notes" multiline />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>NEXT →</Text>}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline }: any) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { minHeight: 60 }]}
      value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor={PLACEHOLDER}
      keyboardType={keyboardType} multiline={multiline}
    />
  </View>
);

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default AddMemberStep1Screen;

const BG = '#0D1A2D';
const PLACEHOLDER = '#C0C0C0';
const DIVIDER = '#E8E8E8';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  backBtn: { marginBottom: 12 },
  topSection: { paddingTop: 56, paddingHorizontal: 32, paddingBottom: 32 },
  stepLabel: { fontSize: 12, color: '#8890A8', fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  topTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', lineHeight: 38 },
  topSub: { fontSize: 14, color: '#8890A8', marginTop: 6 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cardScroll: { paddingHorizontal: 32, paddingTop: 36, paddingBottom: 24 },
  fieldWrap: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: { fontSize: 15, color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 10, padding: 0 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderColor: DIVIDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipActive: { borderColor: BG, backgroundColor: BG },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 10 },
  selectBtnText: { fontSize: 15, color: '#1A1A1A' },
  selectBtnPlaceholder: { fontSize: 15, color: PLACEHOLDER },
  pickerDropdown: { backgroundColor: '#F8F9FC', borderRadius: 8, borderWidth: 1, borderColor: DIVIDER, marginTop: 4 },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: DIVIDER },
  pickerItemText: { fontSize: 14, color: '#333' },
  pickerItemActive: { color: BG, fontWeight: '700' },
  errorText: { fontSize: 13, color: '#E53935', textAlign: 'center', marginBottom: 12 },
  btn: { backgroundColor: BG, borderRadius: 30, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
});
