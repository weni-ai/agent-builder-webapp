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
    suggested_category: string;
  };
  status: 'loading' | 'complete' | 'error' | null;
}

export interface InstructionCategory {
  id: number | null;
  name: string;
}

export interface GroupedInstructionItem {
  id: number | string;
  text: string;
  category?: InstructionCategory | null;
  locked?: boolean;
}

export interface InstructionGroup {
  key: string;
  label: string;
  locked: boolean;
  instructions: GroupedInstructionItem[];
}

export interface NewInstruction {
  text: string;
  category: InstructionCategory | null;
  status: 'loading' | 'complete' | 'error' | null;
}
