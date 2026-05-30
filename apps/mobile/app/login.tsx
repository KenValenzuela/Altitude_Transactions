import {KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Colors, Radii, Spacing, Typography} from '@/constants/AltitudeTheme';

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Brand mark */}
                <View style={styles.brand}>
                    <View style={styles.logoMark}>
                        {/* Mountain silhouette */}
                        <View style={styles.mountainPeak}/>
                    </View>
                    <Text style={styles.logoWord}>Altitude</Text>
                    <Text style={styles.tagline}>Elevated service. Intelligence systems.</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="broker@brokerage.com"
                            placeholderTextColor={Colors.ink4}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.ink4}
                            secureTextEntry
                            returnKeyType="done"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.signInBtn}
                        activeOpacity={0.85}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={styles.signInBtnLabel}>Sign in</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer note */}
                <Text style={styles.footerNote}>
                    CTME remains the official contract platform.{'\n'}
                    Altitude is your operational workflow layer.
                </Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {flex: 1, backgroundColor: Colors.navyDeep},
    container: {flex: 1, paddingHorizontal: Spacing.sp5, justifyContent: 'center', gap: Spacing.sp8},
    brand: {alignItems: 'center', gap: Spacing.sp3},
    logoMark: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: Colors.gold,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mountainPeak: {
        width: 0,
        height: 0,
        borderLeftWidth: 18,
        borderRightWidth: 18,
        borderBottomWidth: 28,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'rgba(255,255,255,0.9)'
    },
    logoWord: {
        fontSize: 32,
        fontWeight: Typography.weightBold,
        color: '#fff',
        letterSpacing: 2,
        textTransform: 'uppercase'
    },
    tagline: {fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5},
    form: {gap: Spacing.sp4},
    fieldWrap: {gap: 6},
    fieldLabel: {
        fontSize: Typography.sizeLabel,
        fontWeight: Typography.weightSemibold,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.8
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: Radii.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        paddingHorizontal: Spacing.sp4,
        paddingVertical: 14,
        fontSize: Typography.sizeBody,
        color: '#fff',
        minHeight: 50
    },
    signInBtn: {
        backgroundColor: Colors.gold,
        borderRadius: Radii.pill,
        paddingVertical: 15,
        alignItems: 'center',
        minHeight: 50,
        marginTop: Spacing.sp2
    },
    signInBtnLabel: {fontSize: Typography.sizeBody, fontWeight: Typography.weightSemibold, color: Colors.navyDeep},
    footerNote: {textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 17},
});
