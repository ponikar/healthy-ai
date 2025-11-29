import { NextRequest } from "next/server";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { agent } from "~/server/agent";
import { createSupabaseServer } from "~/server/supabase/server";

export const runtime = "nodejs";

type StreamChunk = {
	type: "agent" | "tool" | "error";
	node?: string;
	content?: string;
	data?: any;
	toolCalls?: Array<{ name: string; args: any; id: string }>;
};

export async function POST(req: NextRequest) {
	// Check authentication
	const supabase = await createSupabaseServer();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { messages } = await req.json();

	console.log("MESSAGES", messages);

	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const sendEvent = async (chunk: StreamChunk) => {
		await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
	};

	(async () => {
		try {
			const langchainMessages = messages.map(
				(m: { role: string; content: string }) => {
					if (m.role === "user") {
						return new HumanMessage(m.content);
					}
					return new AIMessage(m.content);
				},
			);

			const graphStream = await agent.stream(
				{ messages: langchainMessages },
				{ streamMode: "updates" },
			);

			console.log("GRAPH stream DONE", graphStream);

			for await (const update of graphStream) {
				console.log("UPDATE", update);
				const [nodeName, nodeOutput] = Object.entries(update)[0] || [];
				if (!nodeName || !nodeOutput) continue;

				const output = nodeOutput as any;

				if (nodeName === "agent" && output?.messages) {
					// Handle agent node
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

				console.log("NODE NAME", nodeName, output.messages);

				if (nodeName === "search_crisis_data" && output?.messages) {
					const toolMessage = output.messages[output.messages.length - 1];

					let toolData: any;
					try {
						const parsed =
							typeof toolMessage.content === "string"
								? JSON.parse(toolMessage.content)
								: toolMessage.content;

						toolData = parsed.output || parsed;
					} catch (e) {
						toolData = toolMessage.content;
					}

					await sendEvent({
						type: "tool",
						node: "search_crisis_data",
						data: toolData,
					});
				}
			}

			await writer.close();
		} catch (error: any) {
			console.log("SOMETHING WRONG!", error);
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
