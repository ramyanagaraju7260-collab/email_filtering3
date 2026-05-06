/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, Mail, Send, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { classifyEmail, ClassificationResult } from './services/geminiService';

const EXAMPLES = [
  {
    title: "Urgent Offer",
    content: "CONGRATULATIONS! You have won a free lottery of $1,000,000! Urgent: Claim your money now by clicking this link!"
  },
  {
    title: "Meeting Request",
    content: "Hi Team,\n\nCan we schedule a quick sync tomorrow at 2 PM to discuss the project milestones?\n\nBest,\nAlex"
  },
  {
    title: "Work Update",
    content: "The latest report is ready for your review in the shared drive. Let me know if you have any questions."
  }
];

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async (textToClassify: string = input) => {
    if (!textToClassify.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await classifyEmail(textToClassify);
      setResult(res);
      if (textToClassify !== input) setInput(textToClassify);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="max-w-5xl w-full mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm"
        >
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Intelligent Email Filtering</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">MailShield AI</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Instantly classify incoming messages using advanced AI. Detect spam patterns and legitimate communication with precision.
        </p>
      </header>

      <main className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="email-input" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Raw Email Content
              </label>
              <button 
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                title="Clear input"
              >
                <RefreshCw className="w-3 h-3" />
                Clear
              </button>
            </div>
            
            <textarea
              id="email-input"
              rows={12}
              className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
              placeholder="Paste email content here or choose an example below..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={() => handleClassify()}
              disabled={loading || !input.trim()}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                loading || !input.trim() 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Content...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Classify Message
                </>
              )}
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Quick Examples
            </h3>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleClassify(example.content)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm whitespace-nowrap"
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Result Section */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-8"
        >
          <AnimatePresence mode="wait">
            {!result && !loading && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-600">Ready for Analysis</h2>
                <p className="text-gray-400 text-sm">Enter raw email text on the left to see the AI classification and breakdown.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100"
              >
                <div className="relative w-24 h-24 mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-blue-50 border-t-blue-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Analyzing Signal</h2>
                <p className="text-gray-400 text-sm">Scanning for keywords and patterns...</p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center"
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-red-900 font-semibold mb-2">System Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                {/* Result Header */}
                <div className={`p-8 text-center ${result.label === 'Spam' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${result.label === 'Spam' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {result.label === 'Spam' ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <h2 className={`text-sm font-bold uppercase tracking-[0.2em] mb-2 ${result.label === 'Spam' ? 'text-red-600' : 'text-emerald-600'}`}>
                    Decision
                  </h2>
                  <p className={`text-4xl font-black ${result.label === 'Spam' ? 'text-red-900' : 'text-emerald-900'}`}>
                    {result.label}
                  </p>
                </div>

                {/* Reasoning Section */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reasoning</h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed text-gray-700 italic">
                      "{result.reason}"
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Key Indicators Found</h3>
                    <ul className="space-y-3">
                      {result.label === 'Spam' ? (
                        <>
                          <li className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            Suspicious keywords detected
                          </li>
                          <li className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            High sense of urgency/pressure
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Professional/Conversation tone
                          </li>
                          <li className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Lack of malicious indicators
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                   <button 
                    onClick={() => setResult(null)}
                    className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors px-4 py-2"
                   >
                     Reset View
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>

      <footer className="mt-20 py-8 border-t border-gray-100 w-full max-w-5xl text-center text-gray-400 text-sm">
        <p>© 2026 MailShield AI • Built with Groq AI</p>
      </footer>
    </div>
  );
}
