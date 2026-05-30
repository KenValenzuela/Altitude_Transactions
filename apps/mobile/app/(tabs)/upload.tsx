import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Radii, Spacing, Typography} from '@/constants/AltitudeTheme';

export default function UploadScreen() {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>New transaction</Text>
                    <Text style={styles.title}>Upload contract</Text>
                </View>

                {/* Upload zone */}
                <View style={styles.uploadZone}>
                    {/* Document icon */}
                    <View style={styles.docIcon}>
                        <View style={styles.docIconInner}/>
                    </View>
                    <Text style={styles.uploadTitle}>CTME contract PDF</Text>
                    <Text style={styles.uploadBody}>
                        Export your contract from CTME as a PDF, then upload it here.
                        Altitude will extract deadlines, parties, and transaction details for your review.
                    </Text>

                    <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
                        <Text style={styles.primaryBtnLabel}>Choose file</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
                        <Text style={styles.secondaryBtnLabel}>Use camera</Text>
                    </TouchableOpacity>
                </View>

                {/* Reassurance */}
                <View style={styles.note}>
                    <Text style={styles.noteText}>
                        Every extracted field is presented for your review before anything is confirmed.
                        AI extraction is a starting point, not a final answer.
                    </Text>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {flex: 1, backgroundColor: Colors.canvas},
    container: {flex: 1, paddingHorizontal: Spacing.sp4},
    header: {paddingTop: Spacing.sp5, paddingBottom: Spacing.sp5},
    eyebrow: {
        fontSize: Typography.sizeEyebrow,
        fontWeight: Typography.weightSemibold,
        color: Colors.ink3,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        marginBottom: 4
    },
    title: {fontSize: 28, fontWeight: Typography.weightBold, color: Colors.ink, letterSpacing: -0.4},
    uploadZone: {
        backgroundColor: Colors.navyTint,
        borderRadius: Radii.lg,
        borderWidth: 1.5,
        borderColor: Colors.navyFill,
        borderStyle: 'dashed',
        padding: Spacing.sp6,
        alignItems: 'center'
    },
    docIcon: {
        width: 56,
        height: 64,
        backgroundColor: Colors.surface,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.hairline,
        marginBottom: Spacing.sp4,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 8
    },
    docIconInner: {width: 30, height: 3, backgroundColor: Colors.hairlineStrong, borderRadius: 2},
    uploadTitle: {
        fontSize: Typography.sizeHeading,
        fontWeight: Typography.weightSemibold,
        color: Colors.navy,
        marginBottom: 8,
        textAlign: 'center'
    },
    uploadBody: {
        fontSize: Typography.sizeCaption,
        color: Colors.ink3,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.sp5
    },
    primaryBtn: {
        backgroundColor: Colors.navy,
        paddingHorizontal: Spacing.sp8,
        paddingVertical: 13,
        borderRadius: Radii.pill,
        minHeight: 44,
        justifyContent: 'center',
        marginBottom: Spacing.sp2,
        width: '100%',
        alignItems: 'center'
    },
    primaryBtnLabel: {color: '#fff', fontSize: 15, fontWeight: Typography.weightSemibold},
    secondaryBtn: {
        backgroundColor: 'transparent',
        paddingHorizontal: Spacing.sp8,
        paddingVertical: 12,
        borderRadius: Radii.pill,
        minHeight: 44,
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.navy,
        width: '100%',
        alignItems: 'center'
    },
    secondaryBtnLabel: {color: Colors.navy, fontSize: 15, fontWeight: Typography.weightMedium},
    note: {
        marginTop: Spacing.sp4,
        padding: Spacing.sp4,
        backgroundColor: Colors.surface,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.hairline
    },
    noteText: {fontSize: 12, color: Colors.ink3, lineHeight: 18, textAlign: 'center'},
});
