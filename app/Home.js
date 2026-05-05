import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function Home({ user, signOut }) {
    const headerColor = '#1f2933'
    const cardColor = '#111'
    const borderColor = '#333'

    const Panel = ({ title, subtitle, route }) => (
        <Pressable
            onPress={() => router.push(route)}
            style={{
                backgroundColor: cardColor,
                borderWidth: 1,
                borderColor: borderColor,
                padding: 22,
                borderRadius: 18,
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
        <View style={{ flex: 1, backgroundColor: '#000' }}>

            <View
                style={{
                    backgroundColor: headerColor,
                    paddingTop: 55,
                    paddingBottom: 28,
                    paddingHorizontal: 20,
                    marginBottom: 22,
                    alignItems: 'center'
                }}
            >
                <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>
                    Car Deal Scanner
                </Text>
            </View>

            <View style={{ paddingHorizontal: 20, flex: 1 }}>
                <Text style={{ color: '#aaa', marginBottom: 28, textAlign: 'center' }}>
                    Profile: {user.email}
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

                <View style={{ marginTop: 'auto', marginBottom: 24 }}>
                    <Pressable
                        onPress={signOut}
                        style={{
                            backgroundColor: headerColor,
                            padding: 16,
                            borderRadius: 14,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            Sign Out
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}