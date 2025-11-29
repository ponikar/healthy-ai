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
import { searchCrisisDataTool } from "./tools";
import type { DynamicStructuredTool } from "@langchain/core/tools";

const tools = [searchCrisisDataTool];

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
		} catch (_e) {
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

	.addConditionalEdges("agent", (state) => {
		const lastMessage = state.messages.at(-1);

		if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
			const toolName = lastMessage.tool_calls[0]?.name;
			if (toolName === "search_crisis_data") {
				return "search_crisis_data";
			}
		}
		return END;
	})

	.addEdge("search_crisis_data", END)
	.addEdge(START, "agent");

export const agent = graph.compile();
