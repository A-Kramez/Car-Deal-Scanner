import { View, Text, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'

export default function About() {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 20 }}>
            <Pressable
                onPress={() => router.back()}
                style={{
                    backgroundColor: '#222',
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    alignSelf: 'flex-start',
                    marginBottom: 20
                }}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>? Back</Text>
            </Pressable>

            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 }}>
                About Car Deal Scanner
            </Text>

            <Text style={{ color: '#ddd', fontSize: 16, lineHeight: 24 }}>
                Car Deal Scanner helps users check whether a used car listing appears to be a good deal.
            </Text>

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 25 }}>
                How it works
            </Text>

            <Text style={{ color: '#aaa', fontSize: 15, lineHeight: 23, marginTop: 10 }}>
                The app compares the entered vehicle details against a database of UK used car listings. It uses similar cars based on make, model, engine size and mileage.
            </Text>

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 25 }}>
                Deal score
            </Text>

            <Text style={{ color: '#aaa', fontSize: 15, lineHeight: 23, marginTop: 10 }}>
                The backend calculates a market median price and compares it against the listing price. It also shows how many comparable vehicles were found and gives a confidence level.
            </Text>

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 25 }}>
                Description analysis
            </Text>

            <Text style={{ color: '#aaa', fontSize: 15, lineHeight: 23, marginTop: 10 }}>
                The description is checked for positive signals such as service history and possible red flags such as write-offs, faults or warning lights.
            </Text>

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 25 }}>
                Limitations
            </Text>

            <Text style={{ color: '#aaa', fontSize: 15, lineHeight: 23, marginTop: 10 }}>
                The valuation is an estimate based on available market data. It should support decision-making, not replace a full mechanical inspection or vehicle history check.
            </Text>
        </ScrollView>
    )
}
