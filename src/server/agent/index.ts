import {
	AIMessage,
	BaseMessage,
	HumanMessage,
	type MessageStructure,
	type MessageType,
} from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";

import {
	StateGraph,
	START,
	END,
	type StateType,
	BinaryOperatorAggregate,
	type Messages,
} from "@langchain/langgraph";
import { Model } from "./model";
import { AgentState } from "./state";
import {
	searchCrisisDataTool,
	decideComponents,
	getComponentDocs,
	generateComponent,
} from "./tools";
import type { DynamicStructuredTool } from "@langchain/core/tools";

const tools = [
	searchCrisisDataTool,
	decideComponents,
	getComponentDocs,
	generateComponent,
];

const llm = Model.llm.bindTools(tools);

const handleToolError = (state: any, toolName: string) => {
	if ((state.retry_count || 0) > 0) {
		if (state.retry_count > 2) {
			console.log(`Max retries for ${toolName}. Ending.`);
			return END;
		}
		console.log(`Retrying ${toolName}...`);
		return toolName;
	}
	return "agent";
};

const createToolNode =
	(tool: DynamicStructuredTool) =>
	async (
		state: StateType<{
			retry_count: BinaryOperatorAggregate<number, number>;
			messages: BinaryOperatorAggregate<
				BaseMessage<MessageStructure, MessageType>[],
				Messages
			>;
		}>,
	) => {
		const toolNode = new ToolNode([tool]);
		const result = await toolNode.invoke(state);

		const lastMessage = result.messages[result.messages.length - 1];
		try {
			const toolResponse = JSON.parse(lastMessage.content);
			if (toolResponse.error) {
				console.log(`${tool.name} failed.`);
				return {
					...result,
					retry_count: (state.retry_count || 0) + 1,
				};
			}
		} catch (e) {
			// content is not valid JSON, treat as error
			console.log(`${tool.name} failed with invalid output.`);
			return {
				...result,
				retry_count: (state.retry_count || 0) + 1,
			};
		}

		return { ...result, retry_count: 0 };
	};

const graph = new StateGraph(AgentState.initialState)
	.addNode("agent", async (state) => {
		console.log("[agent -> node]:");
		const { messages } = state;
		const response = await llm.invoke(messages);
		return { messages: [response], retry_count: 0 };
	})
	.addNode("search_crisis_data", createToolNode(searchCrisisDataTool))
	.addNode("decide_components", createToolNode(decideComponents))
	.addNode("get_component_docs", createToolNode(getComponentDocs))
	.addNode("generate_component", createToolNode(generateComponent))
	.addConditionalEdges("agent", (state) => {
		const { messages } = state;
		const lastMessage = messages[messages.length - 1];

		if (
			lastMessage &&
			lastMessage instanceof AIMessage &&
			lastMessage.tool_calls?.length &&
			lastMessage.tool_calls.length > 0
		) {
			const toolName = lastMessage?.tool_calls[0]?.name;
			if (toolName) {
				console.log(`[routing]: ${toolName}`);
				return toolName;
			}
		}
		return END;
	})
	.addEdge(START, "agent")
	.addConditionalEdges("search_crisis_data", (state) =>
		handleToolError(state, "search_crisis_data"),
	)
	.addEdge("decide_components", "get_component_docs")
	.addEdge("get_component_docs", "generate_component")
	.addEdge("generate_component", "agent");

const agent = graph.compile({
	interruptBefore: [],
});

const result = await agent.invoke({
	messages: [
		Model.systemPrompt,
		new HumanMessage(
			"Hi, can you please list out all the past historical data of mumbai andheri, ganpati festival",
		),
	],
});

// 6. Get response
const lastMessage = result.messages[result.messages.length - 1];
console.log("🏥 Healthcare Agent:", lastMessage?.content);
