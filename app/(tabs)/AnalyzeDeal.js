import { useState } from 'react'
import { ScrollView, Text, TextInput, Button, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../supabaseClient'

const API_URL = 'https://car-deal-scanner-backend.onrender.com'

export default function AnalyzeDeal() {
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [engineSize, setEngineSize] = useState('')
    const [price, setPrice] = useState('')
    const [mileage, setMileage] = useState('')
    const [url, setUrl] = useState('')
    const [description, setDescription] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)

    const inputStyle = {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        color: '#000'
    }

    async function analyzeDeal() {
        if (!make || !model || !engineSize || !price || !mileage) {
            alert('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/analyze-deal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    make: make.toLowerCase(),
                    model,
                    engine_size: parseFloat(engineSize),
                    mileage: parseInt(mileage),
                    price: parseInt(price),
                    year: year ? parseInt(year) : null,
                    description
                })
            })

            const data = await response.json()
            setAnalysis(data)
        } catch (error) {
            alert('Could not connect to backend')
            console.log(error)
        }

        setLoading(false)
    }

    async function saveDeal() {
        if (!analysis) {
            alert('Please analyze the deal before saving')
            return
        }

        const { data: userData } = await supabase.auth.getUser()
        const currentUser = userData.user

        if (!currentUser) {
            alert('You must be logged in')
            return
        }

        const { error } = await supabase
            .from('saved_deals')
            .insert([{
                user_id: currentUser.id,
                make,
                model,
                year: year ? parseInt(year) : null,
                engine_size: parseFloat(engineSize),
                price_numeric: parseInt(price),
                mileage_numeric: parseInt(mileage),
                description,
                source_url: url || null
            }])

        if (error) {
            console.log(error)
            alert('Could not save deal')
        } else {
            alert('Deal saved')
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#000' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={20}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            >
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

                <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}>
                    Analyze Deal
                </Text>

                <TextInput placeholder="Make" placeholderTextColor="#666" value={make} onChangeText={setMake} style={inputStyle} />
                <TextInput placeholder="Model" placeholderTextColor="#666" value={model} onChangeText={setModel} style={inputStyle} />
                <TextInput placeholder="Year" placeholderTextColor="#666" value={year} onChangeText={setYear} keyboardType="numeric" style={inputStyle} />
                <TextInput placeholder="Engine Size e.g. 1.4" placeholderTextColor="#666" value={engineSize} onChangeText={setEngineSize} keyboardType="numeric" style={inputStyle} />
                <TextInput placeholder="Price" placeholderTextColor="#666" value={price} onChangeText={setPrice} keyboardType="numeric" style={inputStyle} />
                <TextInput placeholder="Mileage" placeholderTextColor="#666" value={mileage} onChangeText={setMileage} keyboardType="numeric" style={inputStyle} />
                <TextInput placeholder="Listing URL (optional)" placeholderTextColor="#666" value={url} onChangeText={setUrl} style={inputStyle} />

                <TextInput
                    placeholder="Description / notes"
                    placeholderTextColor="#666"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                    style={[inputStyle, { height: 120 }]}
                />

                <Button title={loading ? 'Analyzing...' : 'Analyze Deal'} onPress={analyzeDeal} />

                {analysis && (
                    <View style={{
                        marginTop: 25,
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
                            Deal score: {analysis.deal_analysis?.score ?? 'N/A'}
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

                        <View style={{ height: 12 }} />
                        <Button title="Save Deal" onPress={saveDeal} />
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
