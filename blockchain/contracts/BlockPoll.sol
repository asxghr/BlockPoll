// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BlockPoll
 * @dev Transparent, blockchain-based voting system for educational mini-project.
 *
 * Core Rules:
 * - Deployer is admin.
 * - Only admin can register candidates and voters.
 * - Registration allowed only before voting begins (state: NotStarted).
 * - Admin starts and ends the election.
 * - Candidate IDs start at 1.
 * - Only registered wallet addresses may vote.
 * - A voter can vote once only.
 * - Anyone can view candidates and results (transparent on-chain audit).
 * - No votes after election end.
 */
contract BlockPoll {
    enum ElectionState {
        NotStarted, // 0
        Ongoing,    // 1
        Ended       // 2
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    address public immutable admin;
    string public electionName;
    ElectionState public state;
    uint256 public candidateCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;
    address[] public registeredVotersList;

    event CandidateRegistered(uint256 indexed candidateId, string name);
    event VoterRegistered(address indexed voterAddress);
    event ElectionStarted();
    event ElectionEnded();
    event VoteCasted(address indexed voter, uint256 indexed candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier inState(ElectionState _expectedState) {
        require(state == _expectedState, "Invalid action for current election state");
        _;
    }

    constructor(string memory _electionName) {
        require(bytes(_electionName).length > 0, "Election name cannot be empty");
        admin = msg.sender;
        electionName = _electionName;
        state = ElectionState.NotStarted;
    }

    /**
     * @notice Registers a new candidate. IDs start at 1.
     * @param _name Name of candidate (cannot be empty).
     */
    function registerCandidate(string memory _name)
        public
        onlyAdmin
        inState(ElectionState.NotStarted)
    {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");

        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            voteCount: 0
        });

        emit CandidateRegistered(candidateCount, _name);
    }

    /**
     * @notice Registers a voter wallet address before election starts.
     * @param _voter Address of the voter.
     */
    function registerVoter(address _voter)
        public
        onlyAdmin
        inState(ElectionState.NotStarted)
    {
        require(_voter != address(0), "Invalid voter address");
        require(!voters[_voter].isRegistered, "Voter is already registered");

        voters[_voter].isRegistered = true;
        registeredVotersList.push(_voter);

        emit VoterRegistered(_voter);
    }

    /**
     * @notice Starts the election. Requires at least 2 candidates.
     */
    function startElection()
        external
        onlyAdmin
        inState(ElectionState.NotStarted)
    {
        require(candidateCount >= 2, "At least 2 candidates required to start election");
        state = ElectionState.Ongoing;
        emit ElectionStarted();
    }

    /**
     * @notice Casts a vote for a candidate. One vote per registered voter.
     * @param _candidateId The ID of the candidate (starts at 1).
     */
    function vote(uint256 _candidateId)
        external
        inState(ElectionState.Ongoing)
    {
        require(voters[msg.sender].isRegistered, "You are not registered to vote");
        require(!voters[msg.sender].hasVoted, "You have already cast your vote");
        require(_candidateId >= 1 && _candidateId <= candidateCount, "Invalid candidate ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCasted(msg.sender, _candidateId);
    }

    /**
     * @notice Ends the election.
     */
    function endElection()
        external
        onlyAdmin
        inState(ElectionState.Ongoing)
    {
        state = ElectionState.Ended;
        emit ElectionEnded();
    }

    /**
     * @notice Returns an array of all registered candidates.
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory items = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            items[i - 1] = candidates[i];
        }
        return items;
    }

    /**
     * @notice Returns the status of a specific voter address.
     */
    function getVoterStatus(address _voter)
        external
        view
        returns (
            bool isRegistered,
            bool hasVoted,
            uint256 votedCandidateId
        )
    {
        Voter memory v = voters[_voter];
        return (v.isRegistered, v.hasVoted, v.votedCandidateId);
    }

    /**
     * @notice Returns the total count of registered voters.
     */
    function getRegisteredVotersCount() external view returns (uint256) {
        return registeredVotersList.length;
    }
}
