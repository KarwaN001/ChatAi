import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../DarkMode/ThemeContext';
import { useLanguage } from '../DarkMode/LanguageContext';
import { translations } from '../translations';
import axios from 'axios';
import { styles } from '../styles/ChatAiStyles';
import AiLogo from '../assets/Ai_logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ChatAi = () => {
    const {theme, toggleTheme} = useTheme();
    const {
        currentLanguage,
        changeLanguage
    } = useLanguage();
    const isLightTheme = theme === 'light';
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const scrollViewRef = useRef();

    const typingAnimation = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const messageAnimations = useRef({}).current;

    const t = translations[currentLanguage]?.chatai || translations.en.chatai;

    const languages = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English'
        },
        {
            code: 'ar',
            name: 'Arabic',
            nativeName: 'العربية'
        },
        {
            code: 'ckb',
            name: 'Kurdish-Sorani',
            nativeName: 'کوردی-سۆرانی'
        },
    ];

    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

    const spinAnimation = useRef(new Animated.Value(0)).current;

    const translate = async (sourceLanguage, destinationLanguage, text) => {
        try {
            const response = await axios.post('https://translate.googleapis.com/translate_a/single', null, {
                params: {
                    client: "gtx",
                    dt: "t",
                    sl: sourceLanguage,
                    tl: destinationLanguage,
                    q: text
                }
            });

            // Combine all translated segments
            const translatedText = response.data[0]
                .map(segment => segment[0])
                .join('');

            return translatedText;
        } catch (error) {
            console.error("Translation error:", error);
            return text;  // Return the original text if translation fails
        }
    };

    const startSpinAnimation = () => {
        spinAnimation.setValue(0);
        Animated.loop(Animated.timing(spinAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true
        })).start();
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            if (messages.length > 0) {
                scrollToLatest();
            }
        });
        const keyboardWillHide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
            setKeyboardHeight(0);
            if (messages.length > 0) {
                scrollToLatest();
            }
        });

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, [messages.length]);

    const toggleHistory = () => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    const toggleLanguageModal = () => {
        setIsLanguageModalVisible(!isLanguageModalVisible);
    };

    const handleLanguageChange = (languageCode) => {
        changeLanguage(languageCode);
        setIsLanguageModalVisible(false);
    };

    const startTypingAnimation = () => {
        setIsTyping(true);
        Animated.loop(Animated.sequence([
            Animated.timing(typingAnimation, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }),
            Animated.timing(typingAnimation, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true
            })
        ])).start();
    };

    const stopTypingAnimation = () => {
        setIsTyping(false);
        typingAnimation.stopAnimation();
        typingAnimation.setValue(0);
    };

    const scrollToLatest = () => {
        if (messages.length > 0) {
            scrollViewRef.current?.scrollToEnd({animated: true});
        }
    };

    const [streamedText, setStreamedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const sendMessage = async () => {
        if (inputText.trim() && !isWaitingForResponse) {
            setIsWaitingForResponse(true);
            startSpinAnimation();

            try {
                const translatedMessage = await translate(currentLanguage, 'en', inputText);

                const newMessage = {
                    id: Date.now().toString(),
                    text: inputText,
                    isUser: true,
                    timestamp: new Date(),
                    language: currentLanguage
                };
                
                const updatedMessages = [...messages, newMessage];
                setMessages(updatedMessages);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
                
                animateNewMessage(newMessage.id);
                setInputText('');
                setIsTyping(true);

                const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    "messages": [{"role": "user", "content": translatedMessage}],
                    "model": "llama3-70b-8192",
                    "temperature": 0.1,
                    "max_tokens": 4096,
                    "top_p": 1,
                    "stream": false,
                    "stop": null
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer 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`
                    }
                });

                const aiResponseText = response.data.choices[0].message.content;
                const translatedBack = await translate('en', currentLanguage, aiResponseText);

                setIsTyping(false);
                setIsStreaming(true);

                const words = translatedBack.split(' ');
                let currentText = '';

                for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 50)); // Adjust speed as needed
                    currentText += (i === 0 ? '' : ' ') + words[i];
                    setStreamedText(currentText);
                }

                const aiResponse = {
                    id: (Date.now() + 1).toString(),
                    text: translatedBack,
                    isUser: false,
                    timestamp: new Date(),
                    language: currentLanguage
                };

                const finalMessages = [...updatedMessages, aiResponse];
                setMessages(finalMessages);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
                
                animateNewMessage(aiResponse.id);
                scrollToLatest();
                setIsWaitingForResponse(false);
                setIsStreaming(false);
                setStreamedText('');
                spinAnimation.stopAnimation();

            } catch (error) {
                console.error("Chat API error:", error);
                setIsWaitingForResponse(false);
                spinAnimation.stopAnimation();
            }
        }
    };

    const handleKeyPress = ({nativeEvent}) => {
        if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
            sendMessage();
            return true;
        }
        return false;
    };

    const animateNewMessage = (messageId) => {
        if (!messageAnimations[messageId]) {
            messageAnimations[messageId] = {
                scale: new Animated.Value(0.9),
                opacity: new Animated.Value(0)
            };
        }

        Animated.parallel([
            Animated.spring(messageAnimations[messageId].scale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8
            }),
            Animated.timing(messageAnimations[messageId].opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            })
        ]).start();
    };

    const renderMessage = (message) => {
        if (!messageAnimations[message.id]) {
            messageAnimations[message.id] = {
                scale: new Animated.Value(1),
                opacity: new Animated.Value(1)
            };
        }

        return (
            <Animated.View
                key={message.id}
                style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.aiMessage,
                    message.isError && styles.errorMessage,
                    {
                        backgroundColor: isLightTheme ? 
                            (message.isUser ? '#FF9933' : message.isError ? '#ffebee' : '#f5f5f5') 
                            : 
                            (message.isUser ? '#FFB84D' : message.isError ? '#b71c1c' : '#2A2A2A'),
                        opacity: messageAnimations[message.id].opacity,
                        transform: [{
                            scale: messageAnimations[message.id].scale
                        }]
                    }
                ]}
            >
                {!message.isUser && (
                    <Image
                        source={AiLogo}
                        style={[styles.messageIcon, { width: 30, height: 30 }]}
                        resizeMode="contain"
                    />
                )}
                <Text style={[
                    styles.messageText,
                    {
                        color: message.isUser ? '#fff' : (isLightTheme ? '#000' : '#fff')
                    }
                ]}>
                    {message.text}
                </Text>
            </Animated.View>
        );
    };

    const typingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isTyping) {
            const dots = Animated.loop(Animated.sequence([
                Animated.timing(typingAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.linear
                }),
                Animated.timing(typingAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.linear
                })
            ]));
            dots.start();

            return () => dots.stop();
        }
    }, [isTyping]);

    const themeToggleAnim = useRef(new Animated.Value(theme === 'light' ? 0 : 1)).current;
    const themeIconScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(themeIconScale, {
                toValue: 0.7,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(themeToggleAnim, {
                    toValue: theme === 'light' ? 0 : 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(themeIconScale, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [theme]);

    const STORAGE_KEY = 'chat_messages';

    useEffect(() => {
        const loadInitialMessages = async () => {
            try {
                const savedMessages = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedMessages) {
                    const parsedMessages = JSON.parse(savedMessages);
                    parsedMessages.forEach(message => {
                        messageAnimations[message.id] = {
                            scale: new Animated.Value(1),
                            opacity: new Animated.Value(1)
                        };
                    });
                    setMessages(parsedMessages);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };
        loadInitialMessages();
    }, []);

    useEffect(() => {
        const saveMessages = async () => {
            if (messages.length > 0) {
                try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
                } catch (error) {
                    console.error('Error saving messages:', error);
                }
            }
        };
        saveMessages();
    }, [messages]);

    const startNewChat = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setMessages([]);
            setInputText('');
            setIsTyping(false);
            setIsWaitingForResponse(false);
        } catch (error) {
            console.error('Error clearing messages:', error);
        }
    };

    return (<View style={[
        styles.container,
        {backgroundColor: isLightTheme ? '#fff' : '#1A1A1A'}
    ]}>
        <View style={[
            styles.header,
            {backgroundColor: isLightTheme ? '#fff' : '#1A1A1A'}
        ]}>
            <Pressable onPress={toggleLanguageModal} style={styles.menuButton}>
                <Icon
                    name="translate"
                    size={24}
                    color={isLightTheme ? '#FF9933' : '#FFB84D'}
                />
            </Pressable>
            <Text style={[
                styles.headerTitle,
                {color: isLightTheme ? '#FF9933' : '#FFB84D'}
            ]}>
                ChatAI
            </Text>
            
            <Pressable 
                onPress={toggleTheme}
                style={styles.themeToggle}
            >
                <Animated.View style={[
                    styles.themeToggleIcon,
                    {
                        transform: [
                            {
                                rotate: themeToggleAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            },
                            {
                                scale: themeIconScale
                            }
                        ],
                        opacity: themeToggleAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 0.7, 1]
                        })
                    }
                ]}>
                    <Icon
                        name={isLightTheme ? 'weather-night' : 'white-balance-sunny'}
                        size={32}
                        color={isLightTheme ? '#FF9933' : '#FFB84D'}
                    />
                </Animated.View>
            </Pressable>
        </View>

        <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={[
                styles.chatContent,
                messages.length === 0 && styles.emptyContentContainer,
                {paddingBottom: 90}
            ]}
            showsVerticalScrollIndicator={false}
        >
            {messages.length === 0 ? (<View style={styles.emptyStateContainer}>
                <Image 
                    source={AiLogo}
                    style={styles.emptyStateIcon}
                    resizeMode="contain"
                />
                <Text style={[
                    styles.emptyStateTitle,
                    {color: isLightTheme ? '#FF9933' : '#FFB84D'}
                ]}>
                    {t.startConversation}
                </Text>
                <Text style={[
                    styles.emptyStateSubtitle,
                    {color: isLightTheme ? '#FF9933' : '#FFB84D'}
                ]}>
                    {t.emptyStateMessage}
                </Text>
            </View>) : (<>
                {messages.map(renderMessage)}
                {isTyping && (
                    <Animated.View
                        style={[
                            styles.typingIndicator,
                            {
                                backgroundColor: isLightTheme ? '#f5f5f5' : '#2A2A2A',
                                opacity: typingAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.4, 1, 0.4]
                                })
                            }
                        ]}
                    >
                        <Image
                            source={AiLogo}
                            style={[styles.typingIcon, { width: 35, height: 35 }]}
                            resizeMode="contain"
                        />
                        <View style={{flex: 1}}>
                            <Text style={{
                                color: isLightTheme ? '#666' : '#aaa',
                                fontSize: 14,
                                flexShrink: 1
                            }}>
                                {t.typing}
                                <Animated.Text style={{
                                    opacity: typingAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, 1, 0]
                                    })
                                }}>...</Animated.Text>
                            </Text>
                        </View>
                    </Animated.View>
                )}
                {isStreaming && (
                    <Animated.View
                        style={[
                            styles.messageContainer,
                            styles.aiMessage,
                            {
                                backgroundColor: isLightTheme ? '#f5f5f5' : '#2A2A2A',
                                opacity: 1,
                            }
                        ]}
                    >
                        <Image
                            source={AiLogo}
                            style={[styles.messageIcon, { width: 30, height: 30 }]}
                            resizeMode="contain"
                        />
                        <Text style={[
                            styles.messageText,
                            {
                                color: isLightTheme ? '#000' : '#fff'
                            }
                        ]}>
                            {streamedText}
                        </Text>
                    </Animated.View>
                )}
            </>)}
        </ScrollView>

        <View style={[
            styles.inputContainer,
            {
                backgroundColor: isLightTheme ? '#fff' : '#1A1A1A',
            }
        ]}>
            <Pressable
                onPress={startNewChat}
                style={[
                    styles.newChatButton,
                    {
                        backgroundColor: isLightTheme ? '#f5f5f5' : '#2A2A2A',
                        marginRight: 8,
                    }
                ]}
            >
                <Icon
                    name="message-plus"
                    size={24}
                    color={isLightTheme ? '#FF9933' : '#FFB84D'}
                />
            </Pressable>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: isLightTheme ? '#f5f5f5' : '#2A2A2A',
                        color: isLightTheme ? '#000' : '#fff',
                        opacity: isWaitingForResponse ? 0.5 : 1
                    }
                ]}
                placeholder={t.typePlaceholder}
                placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!isWaitingForResponse}
            />
            <Pressable
                onPress={sendMessage}
                disabled={isWaitingForResponse || !inputText.trim()}
                style={[
                    styles.sendButton,
                    {
                        opacity: (!inputText.trim()) ? 0.5 : 1,
                        backgroundColor: isLightTheme ? '#f5f5f5' : '#2A2A2A',
                    }
                ]}
            >
                {isWaitingForResponse ? (
                    <Animated.View
                        style={{
                            transform: [{
                                rotate: spinAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            }]
                        }}
                    >
                        <Icon
                            name="loading"
                            size={24}
                            color={isLightTheme ? '#FF9933' : '#FFB84D'}
                        />
                    </Animated.View>
                ) : (
                    <Icon
                        name="send"
                        size={24}
                        color={isLightTheme ? '#FF9933' : '#FFB84D'}
                    />
                )}
            </Pressable>
        </View>

        <Modal
            visible={isLanguageModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={toggleLanguageModal}
        >
            <Pressable style={styles.modalOverlay} onPress={toggleLanguageModal}>
                <View style={[
                    styles.languageModal,
                    {
                        backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                        borderRadius: 20,
                        width: '80%',
                    }
                ]}>
                    <View style={styles.modalHeader}>
                        <Text style={[
                            styles.modalTitle,
                            {color: isLightTheme ? '#FF9933' : '#FFB84D'}
                        ]}>
                            {translations[currentLanguage]?.chatai?.selectLanguage || 'Select Language'}
                        </Text>
                        <Pressable onPress={toggleLanguageModal}>
                            <Icon 
                                name="close" 
                                size={24} 
                                color={isLightTheme ? '#FF9933' : '#FFB84D'}
                            />
                        </Pressable>
                    </View>
                    
                    {languages.map((language) => (
                        <Pressable
                            key={language.code}
                            style={[
                                styles.languageItem,
                                {
                                    backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                    borderBottomColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                                },
                                currentLanguage === language.code && styles.selectedLanguageItem
                            ]}
                            onPress={() => handleLanguageChange(language.code)}
                        >
                            <View style={styles.languageItemContent}>
                                <Text style={[
                                    styles.languageName,
                                    {color: isLightTheme ? '#000' : '#fff'}
                                ]}>
                                    {language.name}
                                </Text>
                                <Text style={[
                                    styles.nativeName,
                                    {color: isLightTheme ? '#666' : '#aaa'}
                                ]}>
                                    {language.nativeName}
                                </Text>
                            </View>
                            {currentLanguage === language.code && (
                                <Icon 
                                    name="check-circle" 
                                    size={24} 
                                    color={isLightTheme ? '#FF9933' : '#FFB84D'}
                                />
                            )}
                        </Pressable>
                    ))}
                </View>
            </Pressable>
        </Modal>
    </View>);
};