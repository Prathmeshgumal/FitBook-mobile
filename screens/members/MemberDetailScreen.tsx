import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getMemberDetail,
  updateMember,
  addPayment,
  deletePayment,
  type MemberDetail,
  type Membership,
} from '../../api/members';
import Avatar from '../../components/Avatar';
import type { MemberDetailScreenProps } from '../../navigation/types';

const MemberDetailScreen = ({ route, navigation }: MemberDetailScreenProps) => {
  const { memberId } = route.params;
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getMemberDetail(memberId);
      setMember(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBlock = () => {
    if (!member) return;
    Alert.alert(
      member.is_blocked ? 'Unblock Member' : 'Block Member',
      `${member.is_blocked ? 'Unblock' : 'Block'} ${member.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: member.is_blocked ? 'Unblock' : 'Block',
          style: member.is_blocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateMember(memberId, { is_blocked: !member.is_blocked });
              load();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  const handleCall = () => {
    if (!member) return;
    Linking.openURL(`tel:+91${member.phone}`);
  };

  const handleWhatsApp = () => {
    if (!member) return;
    Linking.openURL(`whatsapp://send?phone=91${member.phone}`);
  };

  if (loading) {
    return (
      <View style={[styles.loaderWrap, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (!member) return null;

  const latestMembership = member.memberships[0] ?? null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <Avatar name={member.full_name} size={56} fontSize={18} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{member.full_name}</Text>
              <Text style={styles.profileSub}>
                M ID: {member.membership_id}
              </Text>
              <Text style={styles.profileSub}>Mobile: +91-{member.phone}</Text>
              {member.gender && (
                <Text style={styles.profileSub}>
                  Gender:{' '}
                  {member.gender.charAt(0).toUpperCase() +
                    member.gender.slice(1)}
                </Text>
              )}
            </View>
          </View>
          {member.address && (
            <Text style={styles.profileAddress}>{member.address}</Text>
          )}
          {member.notes && (
            <Text style={styles.profileNotes}>{member.notes}</Text>
          )}
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          {[
            { icon: 'call-outline', label: 'Call', onPress: handleCall },
            {
              icon: 'logo-whatsapp',
              label: 'WhatsApp',
              onPress: handleWhatsApp,
            },
            {
              icon: 'refresh-outline',
              label: 'Renew Plan',
              onPress: () =>
                Alert.alert(
                  'Renew',
                  'Coming soon — use the plans section below.',
                ),
            },
            {
              icon: member.is_blocked ? 'lock-open-outline' : 'ban-outline',
              label: member.is_blocked ? 'Unblock' : 'Block',
              onPress: handleBlock,
            },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionItem}
              onPress={action.onPress}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={20} color={BG} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Plans</Text>
          <Text style={styles.sectionCount}>({member.memberships.length})</Text>
        </View>

        {member.memberships.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active plans</Text>
          </View>
        )}

        {member.memberships.map(ms => (
          <MembershipCard
            key={ms.id}
            ms={ms}
            memberId={memberId}
            onRefresh={load}
            showPaymentForm={showPaymentForm}
            setShowPaymentForm={setShowPaymentForm}
            payAmount={payAmount}
            setPayAmount={setPayAmount}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const MembershipCard = ({
  ms,
  memberId,
  onRefresh,
  showPaymentForm,
  setShowPaymentForm,
  payAmount,
  setPayAmount,
}: {
  ms: Membership;
  memberId: string;
  onRefresh: () => void;
  showPaymentForm: string | null;
  setShowPaymentForm: (id: string | null) => void;
  payAmount: string;
  setPayAmount: (v: string) => void;
}) => {
  const due =
    parseFloat(ms.full_amount) -
    parseFloat(ms.discount) -
    parseFloat(ms.total_paid);
  const isShowingForm = showPaymentForm === ms.id;

  const handleAddPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return;
    try {
      await addPayment(memberId, {
        membership_id: ms.id,
        amount: Number(payAmount),
        payment_date: new Date().toISOString().split('T')[0],
      });
      setShowPaymentForm(null);
      setPayAmount('');
      onRefresh();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert('Delete Payment', 'Remove this payment record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePayment(memberId, paymentId);
            onRefresh();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.planCard}>
      <Text style={styles.planName}>{ms.plan_name}</Text>
      <View style={styles.planRow}>
        <View style={styles.planCell}>
          <Text style={styles.planCellLabel}>Purchase Date</Text>
          <Text style={styles.planCellValue}>
            {formatDate(ms.purchase_date)}
          </Text>
        </View>
        <View style={styles.planCell}>
          <Text style={styles.planCellLabel}>Expiry Date</Text>
          <Text
            style={[
              styles.planCellValue,
              { color: isExpired(ms.expiry_date) ? '#E53935' : '#4CAF50' },
            ]}
          >
            {formatDate(ms.expiry_date)}
          </Text>
        </View>
      </View>
      <View style={styles.planRow}>
        <View style={styles.planCell}>
          <Text style={styles.planCellLabel}>Complete Amount</Text>
          <Text style={styles.planCellValue}>₹{ms.full_amount}</Text>
        </View>
        <View style={styles.planCell}>
          <Text style={styles.planCellLabel}>Discount</Text>
          <Text style={styles.planCellValue}>₹{ms.discount}</Text>
        </View>
      </View>
      <View style={styles.planRow}>
        <View style={styles.planCell}>
          <Text style={styles.planCellLabel}>Paid</Text>
          <Text style={styles.planCellValue}>₹{ms.total_paid}</Text>
        </View>
        <View style={styles.planCell}>
          <Text style={styles.planCellLabel}>Due Amount</Text>
          <Text
            style={[
              styles.planCellValue,
              { color: due > 0 ? '#E53935' : '#4CAF50' },
            ]}
          >
            ₹{due.toFixed(2)}
          </Text>
        </View>
      </View>
      {ms.comments && <Text style={styles.planComments}>{ms.comments}</Text>}

      {/* Payment history */}
      {ms.payments.length > 0 && (
        <View style={styles.paymentList}>
          <Text style={styles.paymentListLabel}>Payment Details</Text>
          {ms.payments.map(p => (
            <View key={p.id} style={styles.paymentRow}>
              <Text style={styles.paymentDate}>{p.payment_date}</Text>
              <Text style={styles.paymentAmount}>₹{p.amount}</Text>
              <TouchableOpacity onPress={() => handleDeletePayment(p.id)}>
                <Ionicons name="trash-outline" size={14} color="#CCCCCC" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add payment */}
      {isShowingForm ? (
        <View style={styles.payFormRow}>
          <TextInput
            style={styles.payInput}
            value={payAmount}
            onChangeText={setPayAmount}
            placeholder="Amount (₹)"
            placeholderTextColor="#AAAAAA"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.payConfirmBtn}
            onPress={handleAddPayment}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPaymentForm(null)}>
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addPaymentBtn}
          onPress={() => setShowPaymentForm(ms.id)}
        >
          <Ionicons name="card-outline" size={16} color={BG} />
          <Text style={styles.addPaymentText}>Add Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default MemberDetailScreen;

const BG = '#0D1A2D';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  loaderWrap: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  backBtn: { width: 36, alignItems: 'flex-start' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  profileTop: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  profileSub: { fontSize: 13, color: '#666', marginBottom: 2 },
  profileAddress: { fontSize: 13, color: '#555', marginTop: 6, lineHeight: 18 },
  profileNotes: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },

  actionBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    marginBottom: 16,
  },
  actionItem: { alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, color: '#555', fontWeight: '500' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  sectionCount: { fontSize: 13, color: '#8890A8' },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: { fontSize: 14, color: '#AAAAAA' },

  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  planRow: { flexDirection: 'row', marginBottom: 10 },
  planCell: { flex: 1 },
  planCellLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  planCellValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  planComments: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },

  paymentList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  paymentListLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  paymentDate: { flex: 1, fontSize: 13, color: '#555' },
  paymentAmount: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BG,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  addPaymentText: { fontSize: 14, color: BG, fontWeight: '600' },

  payFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  payInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    fontSize: 15,
    color: '#1A1A1A',
    paddingBottom: 6,
  },
  payConfirmBtn: {
    backgroundColor: BG,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
