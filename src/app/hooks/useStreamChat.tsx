import { useState, useCallback } from "react";

type ToolCall = { name: string; args: any; id: string };
type ToolResult = { node: string; data: any };

type StreamChunk = {
    type: "agent" | "tool" | "error";
    node?: string;
    content?: string;
    data?: any;
    toolCalls?: ToolCall[];
};

export function useAgentStream() {
    const [content, setContent] = useState("");
    const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
    const [toolResults, setToolResults] = useState<ToolResult[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (messages: { role: string; content: string }[]) => {
        setIsStreaming(true);
        setError(null);
        setContent("");
        setToolCalls([]);
        setToolResults([]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages }),
            });

            if (!response.ok) throw new Error("Stream failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split("\n").filter((line) => line.startsWith("data: "));

                for (const line of lines) {
                    const chunk: StreamChunk = JSON.parse(line.slice(6));

                    if (chunk.type === "agent") {
                        if (chunk.content) {
                            setContent((prev) => prev + chunk.content);
                        }
                        if (chunk.toolCalls) {
                            setToolCalls(chunk.toolCalls);
                        }
                    } else if (chunk.type === "tool") {
                        console.log("🔧 Tool result received:", chunk.node);
                        setToolResults((prev) => [
                            ...prev,
                            {
                                node: chunk.node!,
                                data: chunk.data,
                            },
                        ]);
                    } else if (chunk.type === "error") {
                        setError(chunk.content || "Unknown error");
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsStreaming(false);
        }
    }, []);

    const reset = useCallback(() => {
        setContent("");
        setToolCalls([]);
        setToolResults([]);
        setError(null);
    }, []);

    return {
        content,
        toolCalls,
        toolResults,
        isStreaming,
        error,
        sendMessage,
        reset,
    };
}
