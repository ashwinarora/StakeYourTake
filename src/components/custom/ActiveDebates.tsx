
import React from 'react'
import DebateGrid from './DebatesGrid';

const items = [
  { poster: 'Alex Rivera', question: 'Is AI taking over human jobs?', stake: '20 ETH', yesPercent: 60, noPercent: 40 },
  { poster: 'Maria Chen', question: 'Should crypto be regulated?', stake: '10 ETH', yesPercent: 30, noPercent: 70 },
  { poster: 'John Doe', question: 'Is remote work sustainable long-term?', stake: '5 ETH', yesPercent: 50, noPercent: 50 },
  { poster: '0x4B...fE2', question: 'Should AI development be open source?', stake: '100 DAO', yesPercent: 75, noPercent: 25 }
];

function ActiveDebate() {
  return (
    <div className="h-[600px] relative max-w-7xl mx-auto w-full">
      <DebateGrid  />
    </div>
  )
}

export default ActiveDebate