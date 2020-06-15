import React, { useState } from 'react'

import { Feather as Icon } from '@expo/vector-icons'

import { ImageBackground, View, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native'

import { RectButton } from 'react-native-gesture-handler'
 
import { useNavigation } from '@react-navigation/native'

const Home = () => {
    const [state, setState] = useState('')
    const [city, setCity] = useState('')

    const navigation = useNavigation()

    function handleNavigateToPoints() {
        navigation.navigate('Points', {
            state, city
        })
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
            <ImageBackground 
                source={require('../../assets/home-background.png')}
                imageStyle={{width: 274, height: 368}}
                style={styles.container}
            >
                <View style={styles.main}>
                    <Image source={require('../../assets/logo.png')} />
                    <View>
                        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Digite o UF" 
                        value={state} 
                        maxLength={2}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        onChangeText={setState} 
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Digite a cidade"
                        value={city}
                        autoCorrect={false}
                        onChangeText={setCity}
                    />

                    <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                        <View style={styles.buttonIcon}>
                            <Text>
                                <Icon name="arrow-right" color="#fff" size={24} />
                            </Text>
                        </View>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </RectButton>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 40
    },
    main: {
        flex: 1,
        justifyContent: "center"
    },
    title: {
        color: '#322153',
        fontSize: 32,
        maxWidth: 260,
        marginTop: 64,
        fontFamily: 'Ubuntu_700Bold'
    },
    description: {
        color: '#6c6c80',
        fontSize: 16,
        maxWidth: 260,
        lineHeight: 24,
        fontFamily: 'Roboto_400Regular'
    },

    footer: {},

    select: {},

    input: {
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
      },
    
      buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
      },
    
      buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
      }
})

export default Home
