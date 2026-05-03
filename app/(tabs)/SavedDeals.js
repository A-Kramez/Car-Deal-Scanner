import { useEffect, useState } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { ScrollView, View, Text, Button, Pressable, Linking } from 'react-native'
import { supabase } from '../../supabaseClient'
import { useCallback } from 'react'

const API_URL = 'https://car-deal-scanner-backend.onrender.com'

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
            .order('created_at', { ascending: false })

        if (!error) setDeals(data)
        else console.log(error)
    }

    async function deleteDeal(id) {
        const { error } = await supabase
            .from('saved_deals')
            .delete()
            .eq('id', id)

        if (!error) {
            setAnalysis(null)
            fetchDeals()
        } else {
            console.log(error)
        }
    }

    async function analyzeSavedDeal(deal) {
        if (!deal.engine_size) {
            alert('This saved deal has no engine size. Please save a newer deal with engine size included.')
            return
        }

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

    useFocusEffect(
        useCallback(() => {
            fetchDeals()
        }, [])
    )

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>

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
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'< Back'}</Text>
            </Pressable>

            <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 6 }}>
                Saved Deals
            </Text>

            <Text style={{ color: '#aaa', marginBottom: 20 }}>
                Re-check previously saved listings.
            </Text>

            {deals.length === 0 && (
                <View style={{
                    backgroundColor: '#111',
                    padding: 18,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#333',
                    marginTop: 10
                }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                        No saved deals yet
                    </Text>
                    <Text style={{ color: '#aaa', marginTop: 8 }}>
                        Analyze a car and press Save Deal to see it here.
                    </Text>
                </View>
            )}

            {deals.map((deal) => (
                <View
                    key={deal.id}
                    style={{
                        backgroundColor: '#111',
                        padding: 16,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#333',
                        marginBottom: 15
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                        {deal.make} {deal.model}
                    </Text>

                    <Text style={{ color: '#aaa', marginTop: 6 }}>
                        {deal.year ? `${deal.year} | ` : ''}
                        {deal.engine_size ? `${deal.engine_size}L | ` : ''}
                        GBP {deal.price_numeric} | {deal.mileage_numeric} miles
                    </Text>

                    {deal.source_url && (
                        <Pressable onPress={() => Linking.openURL(deal.source_url)}>
                            <Text style={{ color: '#60a5fa', marginTop: 8 }}>
                                Open listing URL
                            </Text>
                        </Pressable>
                    )}

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
                <View style={{
                    marginTop: 15,
                    backgroundColor: '#111',
                    padding: 18,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#333'
                }}>
                    <Text style={{ color: '#aaa', fontSize: 14 }}>
                        Analysis Result
                    </Text>

                    <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 6 }}>
                        {analysis.deal_analysis?.rating}
                    </Text>

                    <Text style={{ color: '#aaa', marginTop: 4 }}>
                        Deal score: {analysis.deal_analysis?.score ?? 'N/A'}%
                    </Text>

                    <View style={{ height: 1, backgroundColor: '#333', marginVertical: 14 }} />

                    <Text style={{ color: '#fff' }}>
                        Market median: GBP {analysis.market_price_median ?? 'N/A'}
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 6 }}>
                        Market average: GBP {analysis.market_price_average ?? 'N/A'}
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 6 }}>
                        Comparable cars: {analysis.samples}
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 6 }}>
                        Confidence: {analysis.deal_analysis?.confidence}
                    </Text>

                    <View style={{ height: 1, backgroundColor: '#333', marginVertical: 14 }} />

                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        Description checks
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 8 }}>
                        Red flags: {analysis.description_analysis?.red_flags?.length > 0
                            ? analysis.description_analysis.red_flags.join(', ')
                            : 'None found'}
                    </Text>

                    <Text style={{ color: '#fff', marginTop: 6 }}>
                        Positives: {analysis.description_analysis?.positives?.length > 0
                            ? analysis.description_analysis.positives.join(', ')
                            : 'None found'}
                    </Text>
                </View>
            )}
        </ScrollView>
    )
}
