import {Tabs} from 'expo-router';
import {ColorValue, useColorScheme, View} from 'react-native';
import {Colors} from '@/constants/AltitudeTheme';

// Inline tab icons (no icon library needed for the shell)
function TodayIcon({color, size}: { color: ColorValue; size: number }) {
    const s = size;
    return (
        <View style={{width: s, height: s, alignItems: 'center', justifyContent: 'center'}}>
            {/* Calendar glyph */}
            <View style={{width: s * 0.75, height: s * 0.7, borderWidth: 1.5, borderColor: color, borderRadius: 3}}>
                <View style={{
                    height: s * 0.2,
                    borderBottomWidth: 1,
                    borderBottomColor: color,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center'
                }}>
                    <View style={{width: 1.5, height: '60%', backgroundColor: color, borderRadius: 1}}/>
                    <View style={{width: 1.5, height: '60%', backgroundColor: color, borderRadius: 1}}/>
                </View>
                <View style={{flex: 1, padding: 2}}>
                    <View style={{
                        width: s * 0.18,
                        height: s * 0.18,
                        borderRadius: 2,
                        backgroundColor: color,
                        opacity: 0.9
                    }}/>
                </View>
            </View>
        </View>
    );
}

function TransactionsIcon({color, size}: { color: ColorValue; size: number }) {
    const s = size;
    return (
        <View style={{width: s, height: s, alignItems: 'center', justifyContent: 'center', gap: 3}}>
            {[0.9, 0.7, 0.5].map((w, i) => (
                <View key={i} style={{width: s * w, height: 1.5, backgroundColor: color, borderRadius: 1}}/>
            ))}
        </View>
    );
}

function UploadIcon({color, size}: { color: ColorValue; size: number }) {
    const s = size;
    return (
        <View style={{width: s, height: s, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{alignItems: 'center', gap: 2}}>
                {/* Up arrow */}
                <View style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: s * 0.28,
                    borderRightWidth: s * 0.28,
                    borderBottomWidth: s * 0.3,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: color
                }}/>
                <View style={{width: 2, height: s * 0.22, backgroundColor: color, borderRadius: 1}}/>
                <View style={{width: s * 0.6, height: 1.5, backgroundColor: color, borderRadius: 1}}/>
            </View>
        </View>
    );
}

function SettingsIcon({color, size}: { color: ColorValue; size: number }) {
    const s = size;
    return (
        <View style={{width: s, height: s, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{
                width: s * 0.55,
                height: s * 0.55,
                borderRadius: s * 0.275,
                borderWidth: 1.5,
                borderColor: color
            }}>
                <View style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: s * 0.2,
                    height: s * 0.2,
                    borderRadius: s * 0.1,
                    backgroundColor: color,
                    transform: [{translateX: -s * 0.1}, {translateY: -s * 0.1}]
                }}/>
            </View>
        </View>
    );
}

export default function TabLayout() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';

    const tabBarBg = Colors.navyDeep;
    const active = Colors.gold;
    const inactive = 'rgba(255,255,255,0.45)';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: active,
                tabBarInactiveTintColor: inactive,
                tabBarStyle: {
                    backgroundColor: tabBarBg,
                    borderTopColor: 'rgba(255,255,255,0.08)',
                    borderTopWidth: 0.5,
                    paddingTop: 6,
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Today',
                    tabBarIcon: ({color, size}) => <TodayIcon color={color} size={size}/>,
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({color, size}) => <TransactionsIcon color={color} size={size}/>,
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Upload',
                    tabBarIcon: ({color, size}) => <UploadIcon color={color} size={size}/>,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({color, size}) => <SettingsIcon color={color} size={size}/>,
                }}
            />
        </Tabs>
    );
}
