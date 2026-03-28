import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createGym } from '../../api/gyms';
import type { GymSetupScreenProps } from '../../navigation/types';

const GYM_TYPES = [
  'Weight Training',
  'Yoga',
  'CrossFit',
  'Zumba',
  'Mixed Martial Arts',
  'Other',
];

const GymSetupScreen = ({ navigation }: GymSetupScreenProps) => {
  const [name, setName] = useState('');
  const [gymType, setGymType] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = async () => {
    if (!name || !gymType || !phone || !address || !city || !state) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const gym = await createGym({
        name,
        gym_type: gymType,
        phone,
        address,
        city,
        state,
        opening_hours: openingHours || undefined,
      });
      navigation.navigate('AddPlans', { gymId: gym.id });
    } catch (err: any) {
      setError(err.message ?? 'Failed to save gym details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.topTitle}>Set Up Your Gym</Text>
        <Text style={styles.topSub}>Tell us about your gym</Text>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardAnim }] }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.cardScroll}
          >
            <Field
              label="Gym Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. FitBook Gym"
              focused={focused}
              field="name"
              setFocused={setFocused}
            />

            {/* Gym Type selector */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Gym Type *</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.selectRow,
                  focused === 'type' && styles.inputFocused,
                ]}
                onPress={() => setShowTypeDropdown(v => !v)}
                activeOpacity={0.8}
              >
                <Text
                  style={gymType ? styles.selectText : styles.placeholderText}
                >
                  {gymType || 'Select gym type'}
                </Text>
                <Ionicons
                  name={showTypeDropdown ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#8890A8"
                />
              </TouchableOpacity>
              {showTypeDropdown && (
                <View style={styles.dropdown}>
                  {GYM_TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGymType(t);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          gymType === t && styles.dropdownTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Field
              label="Phone Number *"
              value={phone}
              onChangeText={(t: string) =>
                setPhone(t.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit number"
              keyboardType="phone-pad"
              focused={focused}
              field="phone"
              setFocused={setFocused}
            />
            <Field
              label="Address *"
              value={address}
              onChangeText={setAddress}
              placeholder="Street address"
              focused={focused}
              field="address"
              setFocused={setFocused}
            />
            <View style={styles.row}>
              <View style={[styles.fieldWrap, styles.flex]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused === 'city' && styles.inputFocused,
                  ]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={PLACEHOLDER}
                  onFocus={() => setFocused('city')}
                  onBlur={() => setFocused(null)}
                />
              </View>
              <View style={styles.rowSpacer} />
              <View style={[styles.fieldWrap, styles.flex]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused === 'state' && styles.inputFocused,
                  ]}
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  placeholderTextColor={PLACEHOLDER}
                  onFocus={() => setFocused('state')}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>
            <Field
              label="Opening Hours"
              value={openingHours}
              onChangeText={setOpeningHours}
              placeholder="e.g. 6:00 AM – 10:00 PM"
              focused={focused}
              field="hours"
              setFocused={setFocused}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleNext}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>NEXT →</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  focused,
  field,
  setFocused,
}: any) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, focused === field && styles.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={PLACEHOLDER}
      keyboardType={keyboardType}
      onFocus={() => setFocused(field)}
      onBlur={() => setFocused(null)}
    />
  </View>
);

export default GymSetupScreen;

const BG = '#0D1A2D';
const PLACEHOLDER = '#C0C0C0';
const DIVIDER = '#E8E8E8';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  row: { flexDirection: 'row' },
  rowSpacer: { width: 16 },
  topSection: { paddingTop: 56, paddingHorizontal: 32, paddingBottom: 32 },
  stepLabel: {
    fontSize: 12,
    color: '#8890A8',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  topTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  topSub: { fontSize: 14, color: '#8890A8', marginTop: 6 },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cardScroll: { paddingHorizontal: 32, paddingTop: 36, paddingBottom: 24 },
  fieldWrap: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    paddingBottom: 10,
    padding: 0,
  },
  inputFocused: { borderBottomColor: BG },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 15, color: '#1A1A1A' },
  placeholderText: { fontSize: 15, color: PLACEHOLDER },
  dropdown: {
    backgroundColor: '#F8F9FC',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  dropdownText: { fontSize: 14, color: '#555' },
  dropdownTextActive: { color: BG, fontWeight: '700' },
  errorText: {
    fontSize: 13,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 12,
  },
  btn: {
    backgroundColor: BG,
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
