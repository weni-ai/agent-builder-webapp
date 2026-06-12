export type RequestStatus = 'loading' | 'complete' | 'error' | null;

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
  status: RequestStatus;
}

export interface InstructionCategory {
  id: number | null;
  name: string;
}

export interface Instruction {
  id: number | string;
  text: string;
  category?: InstructionCategory | null;
  locked?: boolean;
}

export interface InstructionGroup {
  key: string;
  label: string;
  locked: boolean;
  instructions: Instruction[];
  categoryId?: number | null;
}

export interface FlatInstruction {
  id: number | string;
  text: string;
  categoryLabel: string;
  categoryLocked: boolean;
  locked: boolean;
}

export interface NewInstruction {
  text: string;
  category: InstructionCategory | null;
  status: RequestStatus;
}
