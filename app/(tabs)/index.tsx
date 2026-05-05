import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import { supabase } from'../../supabaseClient'
import Home from '../Home.js'
import { KeyboardAvoidingView, Platform } from 'react-native'

export default function App() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    const signUp = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) Alert.alert('Error', error.message)
        else Alert.alert('Success', 'Check your email!')
    }

    const signIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) Alert.alert('Error', error.message)
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    if (user) {
            return <Home user={user} signOut={signOut} />
        
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.title}>Car Deal Scanner</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#666"
            />

            <View style={{ height: 15 }} />
            <Button title="Sign Up" onPress={signUp} />
            <View style={{ height: 10 }} />
            <Button title="Login" onPress={signIn} />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#000', // black background
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#fff', // white text
    },
    label: {
        marginBottom: 5,
        fontWeight: '600',
        color: '#fff', // white labels
    },
    input: {
        backgroundColor: '#fff', // white textbox
        borderWidth: 1,
        borderColor: '#444',
        padding: 12,
        marginBottom: 20,
        borderRadius: 8,
        color: '#000', // black typing text
    },
    loggedInText: {
        marginBottom: 20,
        color: '#fff',
    },
})
