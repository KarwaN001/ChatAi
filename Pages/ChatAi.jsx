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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../DarkMode/ThemeContext';
import { useLanguage } from '../DarkMode/LanguageContext';
import { translations } from '../translations';
import axios from 'axios';
import { styles } from '../styles/ChatAiStyles';

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

    const t = translations[currentLanguage].chantai;

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

    const sendMessage = async () => {
        if (inputText.trim() && !isWaitingForResponse) {
            setIsWaitingForResponse(true);
            startSpinAnimation();

            try {
                const translatedMessage = await translate('ckb', 'en', inputText);

                const newMessage = {
                    id: Date.now().toString(),
                    text: inputText,
                    isUser: true
                };
                setMessages(prev => [
                    ...prev,
                    newMessage
                ]);
                animateNewMessage(newMessage.id);
                setInputText('');
                setIsTyping(true);

                // Send the message to the chat API
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


                console.log(response.data.choices[0].message.content)
                const aiResponseText = response.data.choices[0].message.content;
                const translatedBack = await translate('en', 'ckb', aiResponseText);

                console.log(translatedBack);

                // Updating messages in a transition to avoid UI suspension warning
                setTimeout(() => {
                    setIsTyping(false);

                    const aiResponse = {
                        id: (Date.now() + 1).toString(),
                        text: translatedBack,
                        isUser: false
                    };
                    setMessages(prev => [
                        ...prev,
                        aiResponse
                    ]);
                    animateNewMessage(aiResponse.id);
                    scrollToLatest();
                    setIsWaitingForResponse(false);
                    spinAnimation.stopAnimation();
                }, 2000);

            } catch (error) {
                console.error("Chat API error:", error);
                setIsWaitingForResponse(false);
                spinAnimation.stopAnimation();
            }
        }
    };

    // Add handler for Enter key
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
        }
    };

    const renderMessage = (message) => (<Animated.View
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
                opacity: messageAnimations[message.id]?.opacity || 0,
                transform: [
                    {
                        scale: messageAnimations[message.id]?.scale || 0.9
                    }
                ]
            }
        ]}
    >
        {!message.isUser && (<Icon
            name={message.isError ? "alert-circle" : "robot"}
            size={20}
            color={isLightTheme ? '#FF9933' : '#FFB84D'}
            style={styles.messageIcon}
        />)}
        <Text style={[
            styles.messageText,
            {
                color: message.isUser ? '#fff' : (isLightTheme ? '#000' : '#fff')
            }
        ]}>
            {message.text}
        </Text>
    </Animated.View>);

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

    // Add new animation value for theme toggle
    const themeToggleAnim = useRef(new Animated.Value(theme === 'light' ? 0 : 1)).current;
    const themeIconScale = useRef(new Animated.Value(1)).current;

    // Add effect to animate theme changes
    useEffect(() => {
        // Sequence of animations
        Animated.sequence([
            // First scale down
            Animated.timing(themeIconScale, {
                toValue: 0.7,
                duration: 150,
                useNativeDriver: true,
            }),
            // Then rotate and scale up
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

    return (<View style={[
        styles.container,
        {backgroundColor: isLightTheme ? '#fff' : '#1A1A1A'}
    ]}>
        {/* Header - Modified */}
        <View style={[
            styles.header,
            {backgroundColor: isLightTheme ? '#fff' : '#1A1A1A'}
        ]}>
            <Pressable onPress={toggleHistory} style={styles.menuButton}>
                <Icon
                    name="menu"
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
            
            {/* Add Theme Toggle Button */}
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

        {/* Chat Container */}
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
                <Icon
                    name="robot"
                    size={80}
                    color={isLightTheme ? '#FF9933' : '#FFB84D'}
                    style={styles.emptyStateIcon}
                />
                <Text style={[
                    styles.emptyStateTitle,
                    {color: isLightTheme ? '#000' : '#fff'}
                ]}>
                    How can I help you today?
                </Text>
                <Text style={[
                    styles.emptyStateSubtitle,
                    {color: isLightTheme ? '#666' : '#aaa'}
                ]}>
                    Ask me anything about your health records or medical questions
                </Text>
            </View>) : (<>
                {messages.map(renderMessage)}
                {isTyping && (<Animated.View
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
                    <Icon
                        name="robot"
                        size={18}
                        color={isLightTheme ? '#FF9933' : '#FFB84D'}
                        style={styles.messageIcon}
                    />
                    <View style={{flex: 1}}>
                        <Text style={{
                            color: isLightTheme ? '#666' : '#aaa',
                            fontSize: 14,
                            flexShrink: 1
                        }}>
                            ChatAi typing
                            <Animated.Text style={{
                                opacity: typingAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0, 1, 0]
                                })
                            }}>...</Animated.Text>
                        </Text>
                    </View>
                </Animated.View>)}
            </>)}
        </ScrollView>

        {/* Input Container - Updated positioning */}
        <View style={[
            styles.inputContainer,
            {
                backgroundColor: isLightTheme ? '#fff' : '#1A1A1A',
            }
        ]}>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: isLightTheme ? '#f5f5f5' : '#2A2A2A',
                        color: isLightTheme ? '#000' : '#fff',
                        opacity: isWaitingForResponse ? 0.5 : 1 // Show disabled state
                    }
                ]}
                placeholder="Type a message..."
                placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!isWaitingForResponse} // Disable input while waiting
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
                {isWaitingForResponse ? (<Animated.View
                    style={{
                        transform: [
                            {
                                rotate: spinAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [
                                        '0deg',
                                        '360deg'
                                    ]
                                })
                            }
                        ]
                    }}
                >
                    <Icon
                        name="loading"
                        size={24}
                        color={isLightTheme ? '#FF9933' : '#FFB84D'}
                    />
                </Animated.View>) : (<Icon
                    name="send"
                    size={24}
                    color={isLightTheme ? '#FF9933' : '#FFB84D'}
                />)}
            </Pressable>
        </View>

        {/* Modals */}
        <Modal
            visible={isHistoryVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={toggleHistory}
        >
            <Pressable style={styles.modalOverlay} onPress={toggleHistory}>
                <View style={[
                    styles.historyModal,
                    {backgroundColor: isLightTheme ? '#fff' : '#2A2A2A'}
                ]}>
                    <Text style={[
                        styles.historyTitle,
                        {color: isLightTheme ? '#1a73e8' : '#64B5F6'}
                    ]}>
                        {t.chatHistory}
                    </Text>
                    <ScrollView>
                        <Text style={{color: isLightTheme ? '#666' : '#aaa'}}>
                            {t.noHistory}
                        </Text>
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>

        <Modal
            visible={isLanguageModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={toggleLanguageModal}
        >
            <Pressable style={styles.modalOverlay} onPress={toggleLanguageModal}>
                <View style={[
                    styles.languageModal,
                    {backgroundColor: isLightTheme ? '#fff' : '#2A2A2A'}
                ]}>
                    {languages.map((language) => (<Pressable
                        key={language.code}
                        style={[
                            styles.languageItem,
                            {backgroundColor: isLightTheme ? '#fff' : '#2A2A2A'}
                        ]}
                        onPress={() => handleLanguageChange(language.code)}
                    >
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
                        {currentLanguage === language.code && (<Icon name="check" size={24} color="#1a73e8"/>)}
                    </Pressable>))}
                </View>
            </Pressable>
        </Modal>
    </View>);
};