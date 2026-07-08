export interface InteractionState {
  hcpName: string;
  interactionType: string;
  date: string;
  time: string;
  attendees: string;
  topicsDiscussed: string;
  materialsShared: string[];
  samplesDistributed: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative' | '';
  outcomes: string;
  followUpActions: string;
}

export const initialState: InteractionState = {
  hcpName: '',
  interactionType: 'Meeting',
  date: '',
  time: '',
  attendees: '',
  topicsDiscussed: '',
  materialsShared: [],
  samplesDistributed: [],
  sentiment: '',
  outcomes: '',
  followUpActions: '',
};
