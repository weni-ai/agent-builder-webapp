export interface InstructionSuggestedByAI {
  data: {
    instruction: string;
    classification: string;
    reason: string;
    suggestion: string;
  };
  status: 'loading' | 'complete' | 'error' | null;
}
