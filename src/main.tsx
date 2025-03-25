import { Devvit, useState, JSONValue } from '@devvit/public-api';

Devvit.configure({ kvStore: true });

type VoteData = {
  votes: { A: number; B: number };
  userVotes: Record<string, JSONValue>;
};

const questions = [
  { optionA: '🚗 Flying Car', optionB: '🤖 Personal Robot' },
  { optionA: '🌌 Travel to Space', optionB: '🌊 Live Underwater' },
  { optionA: '🍕 Unlimited Pizza', optionB: '🍦 Unlimited Ice Cream' },
  { optionA: '👽 Meet Aliens', optionB: '🦸‍♀️ Become a Superhero' },
];

Devvit.addCustomPostType({
  name: 'Would You Rather',
  render: (context) => {
    const { postId, kvStore, userId = 'anonymous' } = context;
    const now = new Date();
    const fiveMinIndex = Math.floor(now.getMinutes() / 5);
    const question = questions[fiveMinIndex % questions.length];
    const kvKey = `${postId}-${now.getHours()}-${fiveMinIndex}`;

    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
    const [votes, setVotes] = useState({ A: 0, B: 0 });
    const [fetched, setFetched] = useState(false);
    const [lastKey, setLastKey] = useState('');

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

    // Function to handle voting
    const handleVote = async (option: 'A' | 'B') => {
      if (selectedOption === null) {
        setSelectedOption(option);
        const data = await fetchVotes();
        if (!data.userVotes[userId]) {
          data.votes[option]++;
          data.userVotes[userId] = option;
          await kvStore.put(kvKey, data as JSONValue);
        }
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
