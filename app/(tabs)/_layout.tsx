import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1f2933',
                    borderTopColor: '#333'
                },
                tabBarActiveTintColor: '#60a5fa',
                tabBarInactiveTintColor: '#888'
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="AnalyzeDeal"
                options={{
                    title: 'Analyze',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="analytics" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="SavedDeals"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bookmark" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="About"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}