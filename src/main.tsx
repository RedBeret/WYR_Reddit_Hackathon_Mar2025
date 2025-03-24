import { Devvit, useState } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Would You Rather',
  render: () => {
    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
    const [votes, setVotes] = useState({ A: 0, B: 0 });

    const handleVote = (option: 'A' | 'B') => {
      if (selectedOption === null) {
        setSelectedOption(option);
        setVotes((prev) => ({ ...prev, [option]: prev[option] + 1 }));
      }
    };

    return (
      <vstack alignment="center middle" padding="large" gap="large">
        {/* Title */}
        <text size="xxlarge" weight="bold">🎉 Would You Rather? 🎉</text>
        {/* Question */}
        <text size="large">🚗 Flying Car vs 🤖 Personal Robot</text>

        {selectedOption ? (
          <vstack alignment="center middle" gap="small">
            <text>You chose: {selectedOption === 'A' ? '🚗 Flying Car' : '🤖 Personal Robot'}</text>
            <text>🚗 Flying Car has {votes.A} vote(s)</text>
            <text>🤖 Personal Robot has {votes.B} vote(s)</text>
            <text>💬 What would you do first? Share in the comments!</text>
          </vstack>
        ) : (
          <vstack gap="medium" alignment="center middle">
            <button appearance="primary" onPress={() => handleVote('A')}>🚗 Flying Car</button>
            <button appearance="primary" onPress={() => handleVote('B')}>🤖 Personal Robot</button>
            <text align="center" size="small">Can't decide? Toss a coin! 🪙</text>
          </vstack>
        )}
      </vstack>
    );
  }
});

export default Devvit;
