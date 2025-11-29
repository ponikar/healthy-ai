import { NextRequest } from "next/server";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { agent } from "~/server/agent";

export const runtime = "nodejs";

type StreamChunk = {
	type: "agent" | "tool" | "error";
	node?: string;
	content?: string;
	data?: any;
	toolCalls?: Array<{ name: string; args: any; id: string }>;
};

export async function POST(req: NextRequest) {
	const { message } = await req.json();

	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const sendEvent = async (chunk: StreamChunk) => {
		await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
	};

	(async () => {
		try {
			const graphStream = await agent.stream(
				{ messages: [new HumanMessage(message)] },
				{ streamMode: "updates" },
			);

			for await (const update of graphStream) {
				const [nodeName, nodeOutput] = Object.entries(update)[0] || [];
				if (!nodeName || !nodeOutput) continue;

				const output = nodeOutput as any;

				// Handle agent node
				if (nodeName === "agent" && output?.messages) {
					const lastMessage = output.messages[output.messages.length - 1];

					if (lastMessage instanceof AIMessage) {
						if (lastMessage.content) {
							await sendEvent({
								type: "agent",
								node: "agent",
								content:
									typeof lastMessage.content === "string"
										? lastMessage.content
										: JSON.stringify(lastMessage.content),
							});
						}

						if (lastMessage.tool_calls?.length) {
							await sendEvent({
								type: "agent",
								node: "agent",
								toolCalls: lastMessage.tool_calls.map((tc) => ({
									name: tc.name,
									args: tc.args,
									id: tc.id,
								})),
							});
						}
					}
				}

				// Handle search_crisis_data tool
				if (nodeName === "search_crisis_data" && output?.messages) {
					const toolMessage = output.messages[output.messages.length - 1];
					await sendEvent({
						type: "tool",
						node: "search_crisis_data",
						data:
							typeof toolMessage.content === "string"
								? JSON.parse(toolMessage.content)
								: toolMessage.content,
					});
				}
			}

			await writer.close();
		} catch (error: any) {
			await sendEvent({
				type: "error",
				content: error.message,
			});
			await writer.close();
		}
	})();

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
