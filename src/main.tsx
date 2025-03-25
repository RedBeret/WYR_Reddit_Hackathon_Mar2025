import { Devvit, useState, JSONValue } from '@devvit/public-api';
import questionsData from './questions.json'; 
Devvit.configure({ kvStore: true });

type VoteData = {
  votes: { A: number; B: number };
  userVotes: Record<string, JSONValue>;
};

type StoredChoice = {
  option: 'A' | 'B';
  label: string;
};

const questions = questionsData;

Devvit.addCustomPostType({
  name: 'Would You Rather',
  render: (context) => {
    const { postId, kvStore, userId = 'anonymous' } = context;
    const now = new Date();
    const dayIndex = now.getDate();
    const question = questions[dayIndex % questions.length]; 
    const kvKey = `${postId}-${now.getFullYear()}-${now.getMonth()}-${dayIndex}`; 
    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
    const [votes, setVotes] = useState({ A: 0, B: 0 });
    const [fetched, setFetched] = useState(false);
    const [lastKey, setLastKey] = useState('');
    const [previousChoice, setPreviousChoice] = useState<string | null>(null);

    if (lastKey !== kvKey) {
      setLastKey(kvKey);
      setSelectedOption(null);
      setVotes({ A: 0, B: 0 });
      setFetched(false);
    }

    const fetchVotes = async (): Promise<VoteData> => {
      const stored = await kvStore.get(kvKey);
      if (stored && typeof stored === 'object' && 'votes' in stored) {
        return stored as VoteData;
      }
      return { votes: { A: 0, B: 0 }, userVotes: {} };
    };

    if (!fetched) {
      fetchVotes().then((data) => {
        setVotes(data.votes);
        setFetched(true);
      });
    }

    const handleVote = async (option: 'A' | 'B') => {
      if (selectedOption === null) {
        setSelectedOption(option);
        const data = await fetchVotes();
        const existingChoice = data.userVotes[userId] as StoredChoice | undefined;
        if (existingChoice) {
          if (existingChoice.option !== option) {
            data.votes[existingChoice.option]--;
            data.votes[option]++;
            data.userVotes[userId] = {
              option,
              label: question[option === 'A' ? 'optionA' : 'optionB'],
            };
            setPreviousChoice(existingChoice.label);
          } else {
            setPreviousChoice(existingChoice.label);
          }
        } else {
          data.votes[option]++;
          data.userVotes[userId] = {
            option,
            label: question[option === 'A' ? 'optionA' : 'optionB'],
          };
        }
        await kvStore.put(kvKey, data as JSONValue);
        const updated = await fetchVotes();
        setVotes(updated.votes);
      }
    };

    return (
      <vstack alignment="center middle" padding="large" gap="large">
        <text size="xxlarge" weight="bold">🎉 Would You Rather? 🎉</text>
        <text size="large">
          {question.optionA} vs {question.optionB}
        </text>
        {selectedOption ? (
          <vstack alignment="center middle" gap="small">
            <text>
              You chose: {selectedOption === 'A' ? question.optionA : question.optionB}
            </text>
            <text>
              {question.optionA} has {votes.A} vote(s)
            </text>
            <text>
              {question.optionB} has {votes.B} vote(s)
            </text>
            <text>💬 What would you do first? Share in the comments!</text>
            {previousChoice && (
              <text>You previously chose: {previousChoice}</text>
            )}
          </vstack>
        ) : (
          <vstack gap="medium" alignment="center middle">
            <button appearance="primary" onPress={() => handleVote('A')}>
              {question.optionA}
            </button>
            <button appearance="primary" onPress={() => handleVote('B')}>
              {question.optionB}
            </button>
            <text size="small">Can't decide? Toss a coin! 🪙</text>
          </vstack>
        )}
      </vstack>
    );
  },
});

export default Devvit;
