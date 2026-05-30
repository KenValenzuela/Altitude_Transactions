import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Colors, Radii, Spacing, Typography} from '@/constants/AltitudeTheme';

export default function TransactionsScreen() {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>Your portfolio</Text>
                    <Text style={styles.title}>Transactions</Text>
                </View>
            </View>

            {/* Filter row */}
            <View style={styles.filterRow}>
                {['All', 'Active', 'Closing', 'Closed'].map((f, i) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, i === 0 && styles.filterChipActive]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterLabel, i === 0 && styles.filterLabelActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Empty state */}
            <View style={styles.emptyWrap}>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No transactions yet</Text>
                    <Text style={styles.emptyBody}>
                        Upload a CTME contract PDF from the Upload tab to create your first transaction workspace.
                    </Text>
                    <TouchableOpacity
                        style={styles.cta}
                        activeOpacity={0.8}
                        onPress={() => router.push('/(tabs)/upload')}
                    >
                        <Text style={styles.ctaLabel}>Upload a contract</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {flex: 1, backgroundColor: Colors.canvas},
    header: {
        paddingHorizontal: Spacing.sp4,
        paddingTop: Spacing.sp5,
        paddingBottom: Spacing.sp3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    eyebrow: {
        fontSize: Typography.sizeEyebrow,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink3,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        marginBottom: 4
    },
    title: {fontSize: 28, fontWeight: Typography.weightBold, color: Colors.ink, letterSpacing: -0.4},
    filterRow: {flexDirection: 'row', paddingHorizontal: Spacing.sp4, gap: Spacing.sp2, marginBottom: Spacing.sp3},
    filterChip: {
        paddingHorizontal: Spacing.sp3,
        paddingVertical: 6,
        borderRadius: Radii.pill,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.hairline
    },
    filterChipActive: {backgroundColor: Colors.navy, borderColor: Colors.navy},
    filterLabel: {fontSize: 13, fontWeight: Typography.weightMedium, color: Colors.ink2},
    filterLabelActive: {color: '#fff'},
    emptyWrap: {flex: 1, padding: Spacing.sp4, justifyContent: 'center'},
    emptyCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: Colors.hairline,
        padding: Spacing.sp6,
        alignItems: 'center'
    },
    emptyTitle: {
        fontSize: Typography.sizeHeading,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink2,
        marginBottom: 8,
        textAlign: 'center'
    },
    emptyBody: {
        fontSize: Typography.sizeCaption,
        color: Colors.ink3,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: Spacing.sp5
    },
    cta: {
        backgroundColor: Colors.navy,
        paddingHorizontal: Spacing.sp6,
        paddingVertical: 12,
        borderRadius: Radii.pill,
        minHeight: 44,
        justifyContent: 'center'
    },
    ctaLabel: {color: '#fff', fontSize: 15, fontWeight: Typography.weightSemibold},
});
