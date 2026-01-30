import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { generateChatResponse } from '@/lib/gemini';
import { Mic, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: number;
    role: 'user' | 'ai';
    text: string;
}

const ChatbotPage = () => {
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: 'ai',
            text: "Hello! I'm your AI Agronomist. How can I help you with your crops today?"
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Voice Recognition Logic
    useEffect(() => {
        let recognition: any;
        if (isListening) {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech error", event);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.start();
            } else {
                alert("Voice input is not supported in this browser.");
                setIsListening(false);
            }
        }
        return () => {
            if (recognition) recognition.stop();
        };
    }, [isListening]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now(), role: 'user', text: inputText };
        setMessages((prev) => [...prev, userMsg]);
        const currentQuery = inputText;
        setInputText('');
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

            // We pass a generic context since we don't have a specific scan result
            const reply = await generateChatResponse(
                {
                    disease: "General Inquiry",
                    crop: "Various Crops",
                    history: messages.map(m => ({ role: m.role, text: m.text }))
                },
                currentQuery,
                apiKey
            );

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'ai',
                    text: reply
                }
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'ai',
                    text: "Sorry, I'm having trouble connecting to the server. Please try again later."
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={cn(
                                "flex gap-3",
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={16} className="text-green-500" />
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.role === 'user'
                                    ? 'bg-green-600 text-white rounded-br-none font-medium'
                                    : 'bg-card border border-border text-foreground rounded-bl-none'
                            )}>
                                {msg.text}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-muted-foreground" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 justify-start"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Sparkles size={16} className="text-green-500 animate-pulse" />
                            </div>
                            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-150" />
                                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-300" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Fixed at bottom */}
                <div className="absolute bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border">
                    <div className="max-w-[430px] mx-auto flex items-center gap-2 bg-muted/50 p-2 rounded-full border border-border focus-within:border-green-500/50 transition-all shadow-inner">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask about crops, diseases..."
                            className="flex-1 bg-transparent px-4 focus:outline-none text-sm h-10 min-w-0"
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsListening(!isListening)}
                            className={cn(
                                "rounded-full transition-all",
                                isListening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Mic size={20} className={cn(isListening && 'animate-pulse')} />
                        </Button>

                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="rounded-full bg-green-600 hover:bg-green-500 text-white shadow-lg disabled:opacity-50"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ChatbotPage;
