import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        position: 'relative',
    },
    menuButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: Platform.OS === 'ios' ? 22 : 20,
        fontWeight: '600',
        marginLeft: 16,
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 26 : 22,
            },
            android: {
                fontSize: Platform.isPad ? 24 : 20,
            },
        }),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: Platform.OS === 'ios' ? 20 : 18,
        fontWeight: 'bold',
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 24 : 20,
            },
            android: {
                fontSize: Platform.isPad ? 22 : 18,
            },
        }),
    },
    languageModal: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        marginBottom: 5,
    },
    languageItemContent: {
        flex: 1,
    },
    languageName: {
        fontSize: Platform.OS === 'ios' ? 16 : 15,
        fontWeight: '500',
        marginBottom: 4,
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 18 : 16,
            },
            android: {
                fontSize: Platform.isPad ? 17 : 15,
            },
        }),
    },
    nativeName: {
        fontSize: Platform.OS === 'ios' ? 14 : 13,
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 16 : 14,
            },
            android: {
                fontSize: Platform.isPad ? 15 : 13,
            },
        }),
    },
    selectedLanguageItem: {
        backgroundColor: 'rgba(255, 153, 51, 0.1)',
    },
    robotIcon: {
        marginBottom: 20,
        opacity: 0.9,
    },
    messageIcon: {
        width: Platform.OS === 'ios' ? 30 : 26,
        height: Platform.OS === 'ios' ? 30 : 26,
        marginRight: 14,
        ...Platform.select({
            ios: {
                width: Platform.isPad ? 34 : 30,
                height: Platform.isPad ? 34 : 30,
            },
            android: {
                width: Platform.isPad ? 30 : 26,
                height: Platform.isPad ? 30 : 26,
            },
        }),
    },
    typingIndicator: {
        padding: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginLeft: 10,
        marginBottom: 16,
        maxWidth: '50%',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 4,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyStateIcon: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: Platform.OS === 'ios' ? 24 : 22,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 28 : 24,
            },
            android: {
                fontSize: Platform.isPad ? 26 : 22,
            },
        }),
    },
    emptyStateSubtitle: {
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: Platform.OS === 'ios' ? 22 : 20,
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 18 : 16,
                lineHeight: Platform.isPad ? 26 : 22,
            },
            android: {
                fontSize: Platform.isPad ? 16 : 14,
                lineHeight: Platform.isPad ? 24 : 20,
            },
        }),
    },
    errorMessage: {
        borderWidth: 1,
        borderColor: '#ef5350',
    },
    themeToggle: {
        position: 'absolute',
        right: 16,
        top: 45,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    themeToggleIcon: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newChatButton: {
        padding: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
    },
    emptyContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageContainer: {
        maxWidth: '80%',
        padding: Platform.OS === 'ios' ? 12 : 10,
        paddingHorizontal: Platform.OS === 'ios' ? 16 : 14,
        borderRadius: 16,
        marginBottom: Platform.OS === 'ios' ? 16 : 12,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                padding: Platform.isPad ? 14 : 12,
                paddingHorizontal: Platform.isPad ? 18 : 16,
                marginBottom: Platform.isPad ? 20 : 16,
            },
            android: {
                padding: Platform.isPad ? 12 : 10,
                paddingHorizontal: Platform.isPad ? 16 : 14,
                marginBottom: Platform.isPad ? 16 : 12,
            },
        }),
    },
    userMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
        marginLeft: 45,
    },
    aiMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        marginRight: 45,
    },
    messageText: {
        fontSize: Platform.OS === 'ios' ? 15.5 : 14.5,
        lineHeight: Platform.OS === 'ios' ? 21 : 20,
        flexShrink: 1,
        ...Platform.select({
            ios: {
                fontSize: Platform.isPad ? 17 : 15.5,
                lineHeight: Platform.isPad ? 24 : 21,
            },
            android: {
                fontSize: Platform.isPad ? 16 : 14.5,
                lineHeight: Platform.isPad ? 22 : 20,
            },
        }),
    },
    inputContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        padding: Platform.OS === 'ios' ? 16 : 12,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                padding: Platform.isPad ? 20 : 16,
            },
            android: {
                padding: Platform.isPad ? 16 : 12,
            },
        }),
    },
    input: {
        flex: 1,
        borderRadius: 20,
        padding: Platform.OS === 'ios' ? 12 : 10,
        marginRight: 8,
        maxHeight: Platform.OS === 'ios' ? 100 : 80,
        minHeight: Platform.OS === 'ios' ? 40 : 36,
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        ...Platform.select({
            ios: {
                padding: Platform.isPad ? 14 : 12,
                fontSize: Platform.isPad ? 18 : 16,
                maxHeight: Platform.isPad ? 120 : 100,
                minHeight: Platform.isPad ? 44 : 40,
            },
            android: {
                padding: Platform.isPad ? 12 : 10,
                fontSize: Platform.isPad ? 16 : 14,
                maxHeight: Platform.isPad ? 100 : 80,
                minHeight: Platform.isPad ? 40 : 36,
            },
        }),
    },
    sendButton: {
        padding: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typingIcon: {
        width: 35,
        height: 35,
        marginRight: 8,
    },
    streamingMessage: {
        opacity: 1,
        transform: [{scale: 1}],
    },
}); 