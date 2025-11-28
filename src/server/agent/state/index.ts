import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const AgentState = {
	initialState: Annotation.Root({
		...MessagesAnnotation.spec,
		retry_count: Annotation<number>({
			reducer: (prev, next) => next,
			default: () => 0,
		}),
	}),
};
