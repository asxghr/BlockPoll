/**
 * BlockPoll Frontend Stage 1 Sample Data
 * 
 * NOTE: This is local preview data for UI component structuring and review.
 * No simulated transaction hashes, fake block numbers, fake Merkle roots,
 * countdown timers, or zero-knowledge claims are included.
 */

export const INITIAL_ELECTION_DATA = {
  electionName: "College Student Council Election 2026",
  adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  // 0 = NotStarted, 1 = Ongoing, 2 = Ended
  state: 1, 
  candidates: [
    {
      id: 1,
      name: "Alice Johnson",
      department: "Computer Science & Engineering",
      manifesto: "Focusing on transparent student funding, 24/7 campus lab access, and modernized peer tutoring initiatives.",
      voteCount: 18,
      accentColor: "#3156D3"
    },
    {
      id: 2,
      name: "Bob Smith",
      department: "Electronics & Communication",
      manifesto: "Advocating for sustainable campus energy, expanded maker spaces, and student inter-department research grants.",
      voteCount: 12,
      accentColor: "#EF5B3E"
    },
    {
      id: 3,
      name: "Charlie Davis",
      department: "Mechanical Engineering",
      manifesto: "Committed to workshop equipment modernization, industrial mentorship programs, and annual engineering expos.",
      voteCount: 7,
      accentColor: "#3A5100"
    }
  ],
  registeredVoters: [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
  ]
};

export const MOCK_USER_ROLES = {
  GUEST: {
    id: "guest",
    label: "Public Guest (Read-Only)",
    address: null,
    isRegistered: false,
    hasVoted: false,
    votedCandidateId: 0
  },
  VOTER_UNVOTED: {
    id: "voter_unvoted",
    label: "Registered Voter (Eligible)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    isRegistered: true,
    hasVoted: false,
    votedCandidateId: 0
  },
  VOTER_VOTED: {
    id: "voter_voted",
    label: "Registered Voter (Already Voted)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    isRegistered: true,
    hasVoted: true,
    votedCandidateId: 1
  },
  ADMIN: {
    id: "admin",
    label: "Election Administrator",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    isRegistered: true,
    hasVoted: false,
    votedCandidateId: 0
  }
};
