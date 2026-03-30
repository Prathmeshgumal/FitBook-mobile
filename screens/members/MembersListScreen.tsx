import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGym } from '../../context/GymContext';
import { listMembers, deleteMember, type Member } from '../../api/members';
import { listPlans, type Plan } from '../../api/gyms';
import Avatar from '../../components/Avatar';
import type { MembersListScreenProps } from '../../navigation/types';

const MembersListScreen = ({ navigation }: MembersListScreenProps) => {
  const { gym } = useGym();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [planId, setPlanId] = useState<number | undefined>();
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPlanFilter, setShowPlanFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(300)).current;

  const queryClient = useQueryClient();

  const { data: members = [], isLoading: loading } = useQuery({
    queryKey: ['members', gym?.id, { search, gender, planId, sort }],
    queryFn: () =>
      listMembers(gym!.id, {
        search: search || undefined,
        gender: gender || undefined,
        plan_id: planId,
        sort,
      }),
    enabled: !!gym,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans', gym?.id],
    queryFn: () => listPlans(gym!.id),
    enabled: !!gym,
    staleTime: 5 * 60_000,
  });

  const openSidebar = () => {
    setShowSidebar(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: 300,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setShowSidebar(false));
  };

  const deleteMutation = useMutation({
    mutationFn: (memberId: number) => deleteMember(memberId),
    onMutate: async memberId => {
      await queryClient.cancelQueries({ queryKey: ['members', gym?.id] });
      const previous = queryClient.getQueryData([
        'members',
        gym?.id,
        { search, gender, planId, sort },
      ]);
      queryClient.setQueryData(
        ['members', gym?.id, { search, gender, planId, sort }],
        (old: Member[] = []) => old.filter(m => m.id !== memberId),
      );
      return { previous };
    },
    onError: (_err, _memberId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['members', gym?.id, { search, gender, planId, sort }],
          context.previous,
        );
      }
      Alert.alert('Error', 'Could not delete member. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members', gym?.id] });
    },
  });

  const handleDelete = (member: Member) => {
    Alert.alert('Delete Member', `Remove ${member.full_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(member.id),
      },
    ]);
  };

  const renderMember = ({ item }: { item: Member }) => {
    const due = parseFloat(item.due_amount ?? '0');
    const hasExpiry = !!item.expiry_date;
    return (
      <TouchableOpacity
        style={styles.memberCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('MemberDetail', { memberId: item.id })
        }
      >
        <View style={styles.memberRow}>
          <Avatar name={item.full_name} size={48} />
          <View style={styles.memberInfo}>
            <View style={styles.memberTopRow}>
              <Text style={styles.memberName}>{item.full_name}</Text>
              {due > 0 ? (
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>DUE ₹{due.toFixed(0)}</Text>
                </View>
              ) : hasExpiry ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.memberSub}>
              +91-{item.phone} · {item.membership_id}
            </Text>
            <View style={styles.pillRow}>
              {item.batch_name && (
                <View style={styles.pillBatch}>
                  <Text style={styles.pillText}>{item.batch_name}</Text>
                </View>
              )}
              {item.plan_name && (
                <View style={styles.pillPlan}>
                  <Text style={styles.pillText}>{item.plan_name}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Members</Text>
        <TouchableOpacity onPress={openSidebar} style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#8890A8"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or phone"
          placeholderTextColor="#8890A8"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#8890A8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {/* Gender filter */}
        {['', 'male', 'female'].map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.filterChip, gender === g && styles.filterChipActive]}
            onPress={() => setGender(g)}
          >
            <Text
              style={[
                styles.filterChipText,
                gender === g && styles.filterChipTextActive,
              ]}
            >
              {g === '' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Plan filter */}
        <View>
          <TouchableOpacity
            style={[
              styles.filterChip,
              planId !== undefined && styles.filterChipActive,
            ]}
            onPress={() => setShowPlanFilter(v => !v)}
          >
            <Text
              style={[
                styles.filterChipText,
                planId !== undefined && styles.filterChipTextActive,
              ]}
            >
              {planId
                ? plans.find(p => p.id === planId)?.name ?? 'Plan'
                : 'All Plans'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={planId !== undefined ? '#FFFFFF' : '#555'}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
          {showPlanFilter && (
            <View style={styles.dropdownAbsolute}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setPlanId(undefined);
                  setShowPlanFilter(false);
                }}
              >
                <Text style={styles.dropdownText}>All Plans</Text>
              </TouchableOpacity>
              {plans.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setPlanId(p.id);
                    setShowPlanFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      planId === p.id && styles.dropdownTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sort */}
        <View>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowSortFilter(v => !v)}
          >
            <Ionicons name="swap-vertical" size={13} color="#555" />
            <Text style={styles.filterChipText}>
              {sort === 'newest' ? 'Newest' : 'Oldest'}
            </Text>
          </TouchableOpacity>
          {showSortFilter && (
            <View style={styles.dropdownAbsolute}>
              {(['newest', 'oldest'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSort(s);
                    setShowSortFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      sort === s && styles.dropdownTextActive,
                    ]}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={BG} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => String(item.id)}
          renderItem={renderMember}
          contentContainerStyle={[
            styles.list,
            members.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['members', gym?.id] })
          }
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={56} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No members yet</Text>
              <Text style={styles.emptySub}>
                Add your first member to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddMemberStep1')}
              >
                <Text style={styles.emptyBtnText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => navigation.navigate('AddMemberStep1')}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Member</Text>
      </TouchableOpacity>

      {/* Sidebar overlay */}
      {showSidebar && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <Animated.View
            style={[
              styles.sidebar,
              { transform: [{ translateX: sidebarAnim }] },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <Text style={styles.sidebarTitle}>Settings</Text>

              {/* Payment methods */}
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Payment Methods</Text>
                <TouchableOpacity
                  style={styles.sidebarRow}
                  onPress={() => {
                    closeSidebar();
                    // Navigate to payment methods config — placeholder for now
                    Alert.alert(
                      'Payment Methods',
                      'Configure payment methods in the Settings tab (coming soon).',
                    );
                  }}
                >
                  <Ionicons name="card-outline" size={18} color={BG} />
                  <Text style={styles.sidebarRowText}>Configure Methods</Text>
                  <Ionicons name="chevron-forward" size={16} color="#AAAAAA" />
                </TouchableOpacity>
              </View>

              {/* Gym profile */}
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Gym</Text>
                <TouchableOpacity
                  style={styles.sidebarRow}
                  onPress={() => {
                    closeSidebar();
                    Alert.alert(
                      'Edit Gym',
                      'Gym profile editing coming in Settings tab.',
                    );
                  }}
                >
                  <Ionicons name="business-outline" size={18} color={BG} />
                  <Text style={styles.sidebarRowText}>Edit Gym Profile</Text>
                  <Ionicons name="chevron-forward" size={16} color="#AAAAAA" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MembersListScreen;

const BG = '#0D1A2D';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerBtn: { padding: 4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
    zIndex: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterChipActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  filterChipTextActive: { color: BG, fontWeight: '700' },
  dropdownAbsolute: {
    position: 'absolute',
    top: 32,
    left: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: { fontSize: 13, color: '#333' },
  dropdownTextActive: { color: BG, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },
  listEmpty: { flex: 1, justifyContent: 'center' },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  memberRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  memberInfo: { flex: 1 },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  memberName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  memberSub: { fontSize: 12, color: '#666', marginBottom: 6 },
  pillRow: { flexDirection: 'row', gap: 6 },
  pillBatch: {
    backgroundColor: '#E8EAF6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillPlan: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: { fontSize: 10, color: '#333', fontWeight: '500' },
  dueBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dueBadgeText: { fontSize: 10, color: '#E65100', fontWeight: '700' },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: { fontSize: 10, color: '#2E7D32', fontWeight: '700' },
  deleteBtn: { padding: 4, marginTop: 2 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#8890A8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: BG, fontWeight: '700', fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: BG,
    borderRadius: 30,
    height: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 50,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingHorizontal: 24,
    zIndex: 51,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BG,
    marginBottom: 24,
  },
  sidebarSection: { marginBottom: 24 },
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sidebarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sidebarRowText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
