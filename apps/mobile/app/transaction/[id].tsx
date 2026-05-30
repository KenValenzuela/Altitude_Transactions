import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from 'expo-router';
import {Colors, Radii, Spacing, Typography} from '@/constants/AltitudeTheme';

const TABS = ['Overview', 'Deadlines', 'Tasks', 'Contacts', 'Docs'] as const;

export default function TransactionDetailScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
                    <Text style={styles.backArrow}>‹</Text>
                    <Text style={styles.backLabel}>Transactions</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Property hero placeholder */}
                <View style={styles.hero}>
                    <Text style={styles.heroEyebrow}>Transaction · {id ?? '—'}</Text>
                    <Text style={styles.heroAddress}>Address loading…</Text>
                    <Text style={styles.heroCity}>Colorado</Text>
                </View>

                {/* Stage rail placeholder */}
                <View style={styles.stageRail}>
                    {['Under Contract', 'Review', 'Active', 'Closing', 'Closed'].map((s, i) => (
                        <View key={s} style={styles.stageItem}>
                            <View style={[styles.stageDot, i === 0 && styles.stageDotActive]}/>
                            <Text style={[styles.stageLabel, i === 0 && styles.stageLabelActive]}>{s}</Text>
                        </View>
                    ))}
                </View>

                {/* Metric row */}
                <View style={styles.metricRow}>
                    {[
                        {l: 'Tasks', v: '—'},
                        {l: 'Deadlines', v: '—'},
                        {l: 'Docs', v: '—'},
                    ].map((m) => (
                        <View key={m.l} style={styles.metric}>
                            <Text style={styles.metricValue}>{m.v}</Text>
                            <Text style={styles.metricLabel}>{m.l}</Text>
                        </View>
                    ))}
                </View>

                {/* Section tabs */}
                <Text style={styles.sectionLabel}>Transaction sections</Text>
                <View style={styles.grid}>
                    {TABS.map((t) => (
                        <TouchableOpacity key={t} style={styles.gridItem} activeOpacity={0.7}>
                            <Text style={styles.gridLabel}>{t}</Text>
                            <Text style={styles.gridArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {flex: 1, backgroundColor: Colors.canvas},
    topBar: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sp4, paddingVertical: Spacing.sp2},
    backBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingRight: Spacing.sp2},
    backArrow: {fontSize: 22, color: Colors.navy},
    backLabel: {fontSize: Typography.sizeBody, color: Colors.navy, fontWeight: Typography.weightMedium},
    content: {paddingHorizontal: Spacing.sp4, paddingBottom: 100},
    hero: {backgroundColor: Colors.navyDeep, borderRadius: Radii.lg, padding: Spacing.sp5, marginBottom: Spacing.sp3},
    heroEyebrow: {
        fontSize: Typography.sizeEyebrow,
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 6
    },
    heroAddress: {fontSize: 22, fontWeight: Typography.weightBold, color: '#fff', letterSpacing: -0.3},
    heroCity: {fontSize: Typography.sizeCaption, color: 'rgba(255,255,255,0.55)', marginTop: 4},
    stageRail: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        padding: Spacing.sp3,
        justifyContent: 'space-between',
        marginBottom: Spacing.sp3
    },
    stageItem: {alignItems: 'center', gap: 4},
    stageDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.hairlineStrong},
    stageDotActive: {backgroundColor: Colors.gold},
    stageLabel: {fontSize: 9, color: Colors.ink3, textAlign: 'center', maxWidth: 50},
    stageLabelActive: {color: Colors.gold, fontWeight: Typography.weightSemibold},
    metricRow: {flexDirection: 'row', gap: Spacing.sp2, marginBottom: Spacing.sp4},
    metric: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        padding: Spacing.sp3,
        alignItems: 'center'
    },
    metricValue: {fontSize: 24, fontWeight: Typography.weightBold, color: Colors.ink},
    metricLabel: {fontSize: 10, color: Colors.ink3, marginTop: 2},
    sectionLabel: {
        fontSize: Typography.sizeEyebrow,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink3,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: Spacing.sp2
    },
    grid: {gap: Spacing.sp2},
    gridItem: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        paddingHorizontal: Spacing.sp4,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44
    },
    gridLabel: {fontSize: Typography.sizeBody, color: Colors.ink, fontWeight: Typography.weightMedium},
    gridArrow: {fontSize: 20, color: Colors.ink3},
});
