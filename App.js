import { ThemeProvider } from './DarkMode/ThemeContext';
import { LanguageProvider } from './DarkMode/LanguageContext';
import { ChatAi } from './Pages/ChatAi';
const App = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <ChatAi />
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
