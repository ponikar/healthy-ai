"use client"
import { useAgentStream } from "../hooks/useStreamChat";

export default function Chat() {
    const { content, toolCalls, toolResults, isStreaming, error, sendMessage } = useAgentStream();

    return (
        <div>
            <div>{content}</div>

            {toolCalls.length > 0 && (
                <div>
                    <h3>Tool Calls:</h3>
                    {toolCalls.map(tc => (
                        <div key={tc.id}>
                            {tc.name}: {JSON.stringify(tc.args)}
                        </div>
                    ))}
                </div>
            )}

            {toolResults.map((result, i) => (
                <div key={i}>
                    <h3>{result.node} Result:</h3>
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
            ))}

            {error && <div>Error: {error}</div>}

            <button type="button" onClick={() => sendMessage('Give me all the historic data of andheri ganpati festival crisis. use generate_ui tool to generate UI, do not share raw text.')}>
                Send
            </button>
        </div>
    );
}
