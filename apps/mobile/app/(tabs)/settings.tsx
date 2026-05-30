import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Radii, Spacing, Typography} from '@/constants/AltitudeTheme';

type SettingRow = { label: string; value?: string; action?: string };

const SECTIONS: { title: string; rows: SettingRow[] }[] = [
    {
        title: 'Account',
        rows: [
            {label: 'Broker name', value: 'Not signed in'},
            {label: 'Brokerage', value: '—'},
            {label: 'License number', value: '—'},
        ],
    },
    {
        title: 'Notifications',
        rows: [
            {label: 'Deadline alerts', value: 'Off'},
            {label: 'Task reminders', value: 'Off'},
            {label: 'Weekly digest', value: 'Off'},
        ],
    },
    {
        title: 'App',
        rows: [
            {label: 'Version', value: '1.0.0 (shell)'},
            {label: 'API endpoint', value: 'localhost:8000'},
        ],
    },
];

export default function SettingsScreen() {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>Preferences</Text>
                    <Text style={styles.title}>Settings</Text>
                </View>

                {/* Sign in CTA */}
                <TouchableOpacity style={styles.signInCard} activeOpacity={0.8}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>—</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.signInPrimary}>Sign in</Text>
                        <Text style={styles.signInSub}>Access your transaction workspace</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                {/* Setting sections */}
                {SECTIONS.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.card}>
                            {section.rows.map((row, i) => (
                                <View
                                    key={row.label}
                                    style={[styles.row, i < section.rows.length - 1 && styles.rowBorder]}
                                >
                                    <Text style={styles.rowLabel}>{row.label}</Text>
                                    <Text style={styles.rowValue}>{row.value ?? '—'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

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
        marginBottom: 4
    },
    title: {fontSize: 28, fontWeight: Typography.weightBold, color: Colors.ink, letterSpacing: -0.4},
    signInCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        padding: Spacing.sp4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sp3,
        marginBottom: Spacing.sp4
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.navyFill,
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarText: {fontSize: 16, color: Colors.navy, fontWeight: Typography.weightBold},
    signInPrimary: {fontSize: Typography.sizeBody, fontWeight: Typography.weightSemibold, color: Colors.navy},
    signInSub: {fontSize: Typography.sizeCaption, color: Colors.ink3, marginTop: 2},
    chevron: {fontSize: 22, color: Colors.ink3},
    section: {marginBottom: Spacing.sp4},
    sectionTitle: {
        fontSize: Typography.sizeEyebrow,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink3,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: Spacing.sp2
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        overflow: 'hidden'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.sp4,
        paddingVertical: 13
    },
    rowBorder: {borderBottomWidth: 0.5, borderBottomColor: Colors.hairline},
    rowLabel: {fontSize: Typography.sizeBody, color: Colors.ink},
    rowValue: {fontSize: Typography.sizeBody, color: Colors.ink3},
});
