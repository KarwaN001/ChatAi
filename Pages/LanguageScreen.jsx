import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import { useLanguage } from '../DarkMode/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { translations } from '../translations';

const LanguageScreen = () => {
    const { theme } = useTheme();
    const { currentLanguage, changeLanguage } = useLanguage();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();

    const t = translations[currentLanguage].profile;

    const handleLanguageChange = (languageCode) => {
        changeLanguage(languageCode);
    };

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
        { code: 'ckb', name: 'Kurdish-Sorani', nativeName: 'کوردی-سۆرانی' },
    ];

    return (
        <View style={{ flex: 1 }}>
            {/* Custom Header */}
            <View style={[
                styles.header,
                { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }
            ]}>
                <Pressable
                    onPress={() => navigation.navigate('Profile')}
                    style={styles.backButton}
                >
                    <Icon
                        name="arrow-left"
                        size={24}
                        color={isLightTheme ? '#000' : '#fff'}
                    />
                </Pressable>
                <Text style={[
                    styles.headerTitle,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    {t.language}
                </Text>
            </View>

            <ScrollView
                style={[
                    styles.container,
                    { backgroundColor: isLightTheme ? '#f5f5f5' : '#1A1A1A' }
                ]}
            >
                {languages.map((language) => (
                    <Pressable
                        key={language.code}
                        style={[
                            styles.languageItem,
                            { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }
                        ]}
                        android_ripple={{ color: isLightTheme ? '#eee' : '#333' }}
                        onPress={() => handleLanguageChange(language.code)}
                    >
                        <View style={styles.languageTextContainer}>
                            <Text style={[
                                styles.languageName,
                                { color: isLightTheme ? '#000' : '#fff' }
                            ]}>
                                {language.name}
                            </Text>
                            <Text style={[
                                styles.nativeName,
                                { color: isLightTheme ? '#666' : '#aaa' }
                            ]}>
                                {language.nativeName}
                            </Text>
                        </View>
                        {currentLanguage === language.code && (
                            <Icon
                                name="check"
                                size={24}
                                color={isLightTheme ? '#1a73e8' : '#64B5F6'}
                            />
                        )}
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
    },
    container: {
        flex: 1,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginBottom: 1,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    nativeName: {
        fontSize: 14,
    },
});

export default LanguageScreen; 