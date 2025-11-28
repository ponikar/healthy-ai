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
				console.log(`${tool.name} failed. ${toolResponse.error}`);
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
		const { messages } = state;
		const llmWithTools = Model.llm.bindTools(tools);
		const response = await llmWithTools.invoke(messages);
		return { messages: [response], retry_count: 0 };
	})
	.addNode("search_crisis_data", createToolNode(searchCrisisDataTool))
	.addNode("agent_search_to_decide", async (state) => {
		const llm = Model.llm.bindTools([decideComponents]);
		const response = await llm.invoke(state.messages);
		return {
			messages: [
				{
					...response,
					tool_calls: [
						{
							type: "tool_call",
							id: "calling_tool_decide_components",
							name: "decide_components",
							args: {
								query: response.content,
								payload: {},
							},
						},
					],
				},
			],
		};
	})
	.addNode("decide_components", createToolNode(decideComponents))
	.addNode("agent_decide_to_docs", async (state) => {
		const llm = Model.llm.bindTools([getComponentDocs]);
		const response = await llm.invoke(state.messages);

		console.log("getComponentDocs ->", response);
		return {
			messages: [
				{
					...response,
					tool_calls: [
						{
							type: "tool_call",
							id: "calling_tool_get_component_docs",
							name: "get_component_docs",
							args: {
								components: ["button", "input", "form", "select"],
							},
						},
					],
				},
			],
		};
	})
	.addNode("get_component_docs", createToolNode(getComponentDocs))
	.addNode("agent_docs_to_generate", async (state) => {
		const llm = Model.llm.bindTools([generateComponent]);
		const response = await llm.invoke(state.messages);

		console.log("GENERATE COMPONENT", response);
		return {
			messages: [
				{
					...response,
					tool_calls: [
						{
							type: "tool_call",
							id: "calling_tool_generate_component",
							name: "generate_component",
							args: {
								query: response.content,
								payload: {},
								documentation: response.content,
							},
						},
					],
				},
			],
		};
	})
	.addNode("generate_component", createToolNode(generateComponent))

	.addConditionalEdges("agent", (state) => {
		const lastMessage = state.messages.at(-1);
		if (
			lastMessage instanceof AIMessage &&
			lastMessage.tool_calls?.[0]?.name === "search_crisis_data"
		) {
			return "search_crisis_data";
		}
		return END;
	})

	.addEdge("search_crisis_data", "agent_search_to_decide")
	.addEdge("agent_search_to_decide", "decide_components")
	.addEdge("decide_components", "agent_decide_to_docs")
	.addEdge("agent_decide_to_docs", "get_component_docs")
	.addEdge("get_component_docs", "agent_docs_to_generate")
	.addEdge("agent_docs_to_generate", "generate_component")
	.addEdge("generate_component", END) // Final output
	.addEdge(START, "agent");

const agent = graph.compile();

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
console.log("🏥 DONE:");
