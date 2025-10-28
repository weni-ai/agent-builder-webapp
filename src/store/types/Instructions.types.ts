export interface Classification {
  name:
    | 'duplicate'
    | 'conflict'
    | 'ambiguity'
    | 'lack_of_clarity'
    | 'incorrect';
  reason: string;
}
export interface InstructionSuggestedByAI {
  suggestionApplied: boolean;
  data: {
    instruction: string;
    classification: Classification[] | [];
    suggestion: string;
  };
  status: 'loading' | 'complete' | 'error' | null;
}
