import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import {useColorScheme} from 'react-native';
import 'react-native-reanimated';

export {ErrorBoundary} from 'expo-router';

export const unstable_settings = {
    initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        // No custom fonts loaded yet — using system defaults.
        // Add expo-font loading here when Geist TTF files are bundled.
        SplashScreen.hideAsync();
    }, []);

    const colorScheme = useColorScheme();

    return (
        <>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="login" options={{headerShown: false, presentation: 'fullScreenModal'}}/>
                <Stack.Screen name="transaction/[id]" options={{headerShown: false}}/>
                <Stack.Screen name="+not-found"/>
            </Stack>
        </>
    );
}
