"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "./ui";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I am your FoodHub assistant. How can I help you today?",
    },
  ]);

  // ১. অটো-স্কিনের জন্য Ref তৈরি
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ২. একদম নিচে স্ক্রোল করার ফাংশন
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ৩. নতুন মেসেজ আসলে, এআই টাইপ করলে বা চ্যাট উইন্ডো ওপেন হলে অটোমেটিক নিচে স্ক্রোল হবে
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput("");

    // আগের মেসেজগুলোর সাথে নতুন মেসেজ যোগ করে পুরো হিস্ট্রি রেডি করা
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", text: userMessageText },
    ];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      // ব্যাকএন্ডে পুরো চ্যাট হিস্ট্রি (messages) পাঠানো
      const data = await api.post<{ success: boolean; reply: string }>("/chat", {
        messages: updatedMessages,
      });

      // এআই-এর রিপ্লাই মেসেজ লিস্টে যোগ করা
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, Something went wrong!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enter চাপলে সেন্ড হবে, কিন্তু Shift + Enter চাপলে নতুন লাইন তৈরি হবে
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // নতুন লাইন তৈরি হওয়া আটকাবে
      handleSend();       // মেসেজ সেন্ড করবে
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* ১. ফ্লোটিং চ্যাট বাটন */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
        >
          💬 AI Support
        </Button>
      )}

      {/* ২. চ্যাট উইন্ডো বক্স */}
      {isOpen && (
        <div className="bg-white border rounded-2xl shadow-2xl w-[350px] sm:w-[380px] h-[480px] flex flex-col overflow-hidden">
          {/* চ্যাট হেডার */}
          <div className="bg-orange-500 text-white p-4 flex justify-between items-center font-bold">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span>FoodHub Assistant</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 font-bold text-lg"
            >
              ✕
            </Button>
          </div>

          {/* মেসেজ লিস্ট হিস্টোরি */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-br-none"
                      : "bg-white border text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border text-gray-400 p-3 rounded-2xl shadow-sm text-xs italic">
                  AI is typing...
                </div>
              </div>
            )}

            {/* 👈 অটো-স্ক্রোলের জন্য অদৃশ্য টার্গেট ডিভ */}
            <div ref={messagesEndRef} />
          </div>

          {/* ইনপুট ফর্ম */}
          <form onSubmit={handleSend} className="p-3 border-t bg-white flex gap-2 items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about food, menu, or order..."
              rows={1}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-500 text-black resize-none"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}