"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sql?: string;
  data?: any;
  timestamp: Date;
}

interface ChatPanelProps {
  onQueryResult: (data: any) => void;
}

export function ChatPanel({ onQueryResult }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "Olá! Sou seu assistente de dados geoespaciais. Pergunte sobre rodovias, estados, cidades e dados espaciais do Brasil. Exemplos:\n\n• Quantas rodovias tem em cada estado?\n• Qual a distância entre São Paulo e Rio de Janeiro?\n• Quais cidades estão próximas da BR-101?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Erro na requisição");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        sql: data.sql,
        data: data.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Send data to map for visualization
      if (data.data) {
        onQueryResult(data.data);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatData = (data: any) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return (
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-xs border border-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-2 py-1 text-left font-medium text-gray-700 border-b"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {Object.values(row).map((value: any, i) => (
                  <td key={i} className="px-2 py-1 border-b text-gray-600">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <p className="text-xs text-gray-500 mt-1">
            Mostrando 10 de {data.length} resultados
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Consultas SQL via IA
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Perguntas em português → SQL automático
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.role === "system"
                    ? "bg-gray-100 text-gray-700 border border-gray-200"
                    : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>

                {message.sql && (
                  <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono text-green-400 overflow-x-auto">
                    {message.sql}
                  </div>
                )}

                {message.data && formatData(message.data)}

                <div
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-blue-200"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre dados geoespaciais..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          💡 Dica: Seja específico nas perguntas para melhores resultados
        </p>
      </div>
    </div>
  );
}
