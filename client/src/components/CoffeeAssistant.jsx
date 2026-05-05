import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CoffeeAssistant = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'quiz'

    // Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId] = useState(() => 'user-session-' + Date.now());
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Quiz state
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [quizResults, setQuizResults] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);

    // Scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Initial greeting if chat is empty
    useEffect(() => {
        if (isOpen && activeTab === 'chat' && messages.length === 0) {
            setMessages([{ role: 'assistant', text: 'Hello! ☕ I am your AI coffee assistant. How can I help you find the perfect brew today?' }]);
        }
    }, [isOpen, activeTab, messages.length]);

    // Fetch quiz questions
    useEffect(() => {
        if (isOpen && activeTab === 'quiz' && questions.length === 0) {
            fetch('/api/quiz/questions')
                .then(res => res.json())
                .then(data => setQuestions(data.questions || []))
                .catch(err => console.error(err));
        }
    }, [isOpen, activeTab, questions.length]);

    const sendChatMessage = async (overrideMsg) => {
        const msg = overrideMsg || input.trim();
        if (!msg) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: msg }]);
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, sessionId })
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: data.text,
                quickReplies: data.quickReplies,
                recommendations: data.recommendations
            }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Oops, something went wrong. Please try again later.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuizOption = (optionIndex) => {
        const qId = questions[currentQ].id;
        const newAnswers = [...answers, { questionId: qId, optionIndex }];
        setAnswers(newAnswers);

        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers) => {
        setQuizLoading(true);
        try {
            const payload = { answers: finalAnswers };
            if (user?._id) payload.userId = user._id;

            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setQuizResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setQuizLoading(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQ(0);
        setAnswers([]);
        setQuizResults(null);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Main Window */}
            {isOpen && (
                <div className="glass rounded-2xl w-80 sm:w-[22rem] h-[500px] mb-4 flex flex-col overflow-hidden shadow-2xl animate-fadeInUp border border-white/10">
                    {/* Header */}
                    <div className="bg-primary/20 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10">
                        <div className="flex gap-4">
                            <button onClick={() => setActiveTab('chat')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-primary text-primary-light' : 'border-transparent text-secondary/60 hover:text-white'}`}>💬 Chat AI</button>
                            <button onClick={() => setActiveTab('quiz')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-primary text-primary-light' : 'border-transparent text-secondary/60 hover:text-white'}`}>🧪 Taste Quiz</button>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-secondary/60 hover:text-white transition-colors">✖</button>
                    </div>

                    {/* Chat Tab Content */}
                    {activeTab === 'chat' && (
                        <div className="flex-1 flex flex-col bg-background/50">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-secondary/20 text-secondary rounded-bl-none'}`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                            
                                            {msg.quickReplies && msg.quickReplies.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {msg.quickReplies.map((qr, j) => (
                                                        <button key={j} onClick={() => sendChatMessage(qr)} className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors border border-white/10">
                                                            {qr}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {msg.recommendations && msg.recommendations.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {msg.recommendations.map((rec, j) => (
                                                        <Link key={j} to={`/menu`} className="block bg-black/20 hover:bg-black/40 p-2 rounded-xl border border-white/5 transition-colors">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-primary-light">{rec.name}</span>
                                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{rec.similarity}% Match</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-secondary/20 rounded-2xl rounded-bl-none p-4 flex gap-1.5">
                                            <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-3 bg-secondary/10 border-t border-white/5">
                                <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="flex gap-2">
                                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..." className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    <button type="submit" disabled={!input.trim() || isTyping} className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                                        ➤
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Quiz Tab Content */}
                    {activeTab === 'quiz' && (
                        <div className="flex-1 overflow-y-auto p-5 bg-background/50 flex flex-col">
                            {quizLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-secondary/60">
                                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                    <p>Analyzing your coffee DNA...</p>
                                </div>
                            ) : quizResults ? (
                                <div className="flex-1 animate-fadeInUp">
                                    <div className="text-center mb-6">
                                        <span className="text-5xl block mb-2">{quizResults.personality.emoji}</span>
                                        <h3 className="text-xl font-bold text-primary-light">{quizResults.personality.label}</h3>
                                        <p className="text-sm text-secondary/70 mt-2">{quizResults.personality.description}</p>
                                    </div>
                                    <h4 className="font-bold text-secondary mb-3 text-sm">Top Recommendations</h4>
                                    <div className="space-y-3 mb-6">
                                        {quizResults.topMatches.map((match, idx) => (
                                            <div key={idx} className="bg-secondary/20 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-secondary text-sm">{match.product.name}</p>
                                                    <p className="text-xs text-secondary/50">₺{match.product.price}</p>
                                                </div>
                                                <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{match.similarity}% Match</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={resetQuiz} className="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-bold">Retake Quiz</button>
                                </div>
                            ) : questions.length > 0 ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between text-xs text-secondary/50 mb-4">
                                        <span>Question {currentQ + 1} of {questions.length}</span>
                                        <span>{Math.round((currentQ / questions.length) * 100)}%</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-secondary mb-6">{questions[currentQ].question}</h3>
                                    <div className="space-y-3 flex-1">
                                        {questions[currentQ].options.map((opt, idx) => (
                                            <button key={idx} onClick={() => handleQuizOption(idx)} className="w-full text-left bg-secondary/10 hover:bg-primary/20 border border-white/5 hover:border-primary/50 p-4 rounded-xl transition-all flex items-center gap-3 group">
                                                <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                                                <span className="text-sm font-medium text-secondary">{opt.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-secondary/50">Loading quiz...</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center text-2xl hover:scale-105 transition-all hover:bg-primary-dark btn-shimmer">
                {isOpen ? '✖' : '☕'}
            </button>
        </div>
    );
};

export default CoffeeAssistant;
