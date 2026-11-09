"use client";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Inisialisasi koneksi socket ke backend
const socket: Socket = io("http://localhost:8000");

interface ChatMessage {
  user: string;
  text: string;
  time: string;
}

export default function LiveChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState("Pelanggan Warmad Mart");
  const [text, setText] = useState("");

  useEffect(() => {
    // Mendengarkan pesan masuk secara real-time dari server
    socket.on("receiveMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      user,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Kirim event sendMessage ke backend
    socket.emit("sendMessage", newMsg);
    setText("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 font-bold flex justify-between items-center">
          <span>💬 Live Chat - Warmad Mart</span>
          <span className="text-xs bg-emerald-500 px-2 py-1 rounded-full">
            Online
          </span>
        </div>

        {/* Input Nama User */}
        <div className="p-3 bg-slate-50 border-b flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Nama:</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="border rounded px-2 py-1 text-sm flex-1 outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Area Pesan */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 text-sm mt-20">
              Belum ada pesan. Yuk ngobrol!
            </p>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.user === user;
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="text-xs text-slate-500 mb-1">
                    {msg.user}
                  </span>
                  <div
                    className={`p-3 rounded-lg max-w-[80%] text-sm shadow-sm ${
                      isMe
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1 text-right ${isMe ? "text-emerald-100" : "text-slate-400"}`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form Kirim Pesan */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t flex gap-2"
        >
          <input
            type="text"
            placeholder="Ketik pesan produk..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}