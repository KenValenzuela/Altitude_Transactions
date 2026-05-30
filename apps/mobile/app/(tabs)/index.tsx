import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Radii, Spacing, Typography} from '@/constants/AltitudeTheme';

export default function TodayScreen() {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>Colorado Real Estate</Text>
                    <Text style={styles.title}>Today</Text>
                </View>

                {/* Summary chips */}
                <View style={styles.chipRow}>
                    {[
                        {label: 'Active files', value: '—'},
                        {label: 'Due this week', value: '—'},
                        {label: 'Pending review', value: '—'},
                    ].map((c) => (
                        <View key={c.label} style={styles.chip}>
                            <Text style={styles.chipValue}>{c.value}</Text>
                            <Text style={styles.chipLabel}>{c.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Active transactions */}
                <Text style={styles.sectionLabel}>Active transactions</Text>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No active transactions yet</Text>
                    <Text style={styles.emptyBody}>
                        Upload a CTME contract PDF to get started.{'\n'}
                        Your transaction workspace will appear here.
                    </Text>
                </View>

                {/* Upcoming deadlines */}
                <Text style={styles.sectionLabel}>Upcoming deadlines</Text>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No deadlines yet</Text>
                    <Text style={styles.emptyBody}>
                        Deadlines are extracted from your contract and tracked here.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {flex: 1, backgroundColor: Colors.canvas},
    scroll: {flex: 1},
    content: {paddingHorizontal: Spacing.sp4, paddingBottom: Spacing.sp12},
    header: {paddingTop: Spacing.sp5, paddingBottom: Spacing.sp4},
    eyebrow: {
        fontSize: Typography.sizeEyebrow,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink3,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        marginBottom: 4,
    },
    title: {
        fontSize: 36,
        fontWeight: Typography.weightBold,
        color: Colors.ink,
        letterSpacing: -0.5,
    },
    chipRow: {flexDirection: 'row', gap: Spacing.sp2, marginBottom: Spacing.sp5},
    chip: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        padding: Spacing.sp3,
        alignItems: 'center',
    },
    chipValue: {fontSize: 22, fontWeight: Typography.weightBold, color: Colors.ink},
    chipLabel: {
        fontSize: 10,
        fontWeight: Typography.weightMedium,
        color: Colors.ink3,
        marginTop: 2,
        textAlign: 'center',
    },
    sectionLabel: {
        fontSize: Typography.sizeEyebrow,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink3,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: Spacing.sp2,
        marginTop: Spacing.sp2,
    },
    emptyCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        padding: Spacing.sp5,
        marginBottom: Spacing.sp4,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: Typography.sizeBody,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink2,
        marginBottom: 6,
    },
    emptyBody: {
        fontSize: Typography.sizeCaption,
        color: Colors.ink3,
        textAlign: 'center',
        lineHeight: 20,
    },
});
