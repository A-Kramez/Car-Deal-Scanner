import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function Home({ user, signOut }) {
    const Panel = ({ title, subtitle, route }) => (
        <Pressable
            onPress={() => router.push(route)}
            style={{
                backgroundColor: '#111',
                borderWidth: 1,
                borderColor: '#333',
                padding: 22,
                borderRadius: 16,
                marginBottom: 18
            }}
        >
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
                {title}
            </Text>
            <Text style={{ color: '#aaa', marginTop: 8 }}>
                {subtitle}
            </Text>
        </Pressable>
    )

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#000' }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                Car Deal Scanner
            </Text>

            <Text style={{ color: '#aaa', marginBottom: 30 }}>
                Logged in as {user.email}
            </Text>

            <Panel
                title="Analyze Deal"
                subtitle="Check a car against the market and get a deal score"
                route="/AnalyzeDeal"
            />

            <Panel
                title="Saved Deals"
                subtitle="View, delete and re-analyze your saved cars"
                route="/SavedDeals"
            />

            <Panel
                title="About"
                subtitle="How the app works"
                route="/About"
            />

            <View style={{ marginTop: 'auto' }}>
                <Pressable
                    onPress={signOut}
                    style={{
                        backgroundColor: '#222',
                        padding: 14,
                        borderRadius: 10,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#fff' }}>Sign Out</Text>
                </Pressable>
            </View>
        </View>
    )
}