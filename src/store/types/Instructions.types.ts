export interface Classification {
  name:
    | 'duplicate'
    | 'conflicting'
    | 'ambiguity'
    | 'lack_of_clarity'
    | 'incorrect';
  reason: string;
}
export interface InstructionSuggestedByAI {
  suggestionApplied: string;
  data: {
    instruction: string;
    classification: Classification[] | [];
    suggestion: string;
  };
  status: 'loading' | 'complete' | 'error' | null;
}
