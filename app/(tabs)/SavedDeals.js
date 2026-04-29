import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { ScrollView, View, Text, Button, Pressable } from 'react-native'
import { supabase } from '../../supabaseClient'


const API_URL = 'http://192.168.1.244:8000'

export default function SavedDeals() {
    const [deals, setDeals] = useState([])
    const [analysis, setAnalysis] = useState(null)
    const [loadingId, setLoadingId] = useState(null)

    async function fetchDeals() {
        const { data: userData } = await supabase.auth.getUser()
        const currentUser = userData.user

        if (!currentUser) {
            console.log('No logged in user found')
            return
        }

        const { data, error } = await supabase
            .from('saved_deals')
            .select('*')
            .eq('user_id', currentUser.id)

        if (!error) setDeals(data)
        else console.log(error)
    }

    async function deleteDeal(id) {
        const { error } = await supabase
            .from('saved_deals')
            .delete()
            .eq('id', id)

        if (!error) fetchDeals()
        else console.log(error)
    }

    async function analyzeSavedDeal(deal) {
        setLoadingId(deal.id)

        try {
            const response = await fetch(`${API_URL}/analyze-deal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    make: deal.make.toLowerCase(),
                    model: deal.model,
                    engine_size: deal.engine_size,
                    mileage: deal.mileage_numeric,
                    price: deal.price_numeric,
                    description: deal.description || ''
                })
            })

            const data = await response.json()
            setAnalysis(data)
        } catch (error) {
            console.log(error)
            alert('Failed to analyze deal')
        }

        setLoadingId(null)
    }

    useEffect(() => {
        fetchDeals()
    }, [])

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

            <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}>
                Saved Deals
            </Text>

            {deals.map((deal) => (
                <View
                    key={deal.id}
                    style={{
                        backgroundColor: '#111',
                        padding: 15,
                        borderRadius: 12,
                        marginBottom: 15
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                        {deal.make} {deal.model}
                    </Text>

                    <Text style={{ color: '#aaa' }}>
                        £{deal.price_numeric} • {deal.mileage_numeric} miles
                    </Text>

                    <View style={{ height: 10 }} />

                    <Button
                        title={loadingId === deal.id ? 'Analyzing...' : 'Analyze'}
                        onPress={() => analyzeSavedDeal(deal)}
                    />

                    <View style={{ height: 6 }} />

                    <Button
                        title="Delete"
                        onPress={() => deleteDeal(deal.id)}
                        color="red"
                    />
                </View>
            ))}

            {analysis && (
                <View style={{ marginTop: 25, backgroundColor: '#111', padding: 16, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                        Analysis Result
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 10 }}>
                        Rating: {analysis.deal_analysis?.rating}
                    </Text>

                    <Text style={{ color: '#fff' }}>
                        Score: {analysis.deal_analysis?.score ?? 'N/A'}%
                    </Text>

                    <Text style={{ color: '#fff' }}>
                        Market Median: £{analysis.market_price_median ?? 'N/A'}
                    </Text>

                    <Text style={{ color: '#fff' }}>
                        Market Average: £{analysis.market_price_average ?? 'N/A'}
                    </Text>

                    <Text style={{ color: '#fff' }}>
                        Comparable Cars: {analysis.samples}
                    </Text>

                    <Text style={{ color: '#fff' }}>
                        Confidence: {analysis.deal_analysis?.confidence}
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 10 }}>
                        Red Flags: {analysis.description_analysis?.red_flags?.length > 0
                            ? analysis.description_analysis.red_flags.join(', ')
                            : 'None found'}
                    </Text>

                    <Text style={{ color: '#fff' }}>
                        Positives: {analysis.description_analysis?.positives?.length > 0
                            ? analysis.description_analysis.positives.join(', ')
                            : 'None found'}
                    </Text>
                </View>
            )}
        </ScrollView>
    )
}
