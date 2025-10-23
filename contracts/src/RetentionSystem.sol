// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RetentionSystem
 * @notice Handles daily check-ins with streak bonuses and referral rewards
 * @dev Combines daily rewards and referral system in a single contract
 */
contract RetentionSystem {
    // ============ State Variables ============

    /// @notice Tracks the last check-in timestamp for each user
    mapping(address => uint256) public lastCheckIn;

    /// @notice Tracks the current streak count for each user (max 7 days)
    mapping(address => uint256) public currentStreak;

    /// @notice Tracks who referred each user (one-time only)
    mapping(address => address) public referredBy;

    /// @notice Tracks if a user has already been referred
    mapping(address => bool) public hasBeenReferred;

    /// @notice Tracks total eggs earned by each user
    mapping(address => uint256) public totalEggs;

    /// @notice Tracks total referrals made by each user
    mapping(address => uint256) public referralCount;

    // ============ Constants ============

    /// @notice 1 day in seconds (86400)
    uint256 public constant ONE_DAY = 1 days;

    /// @notice Base eggs per check-in
    uint256 public constant BASE_EGGS = 1;

    /// @notice Eggs for 3+ day streak
    uint256 public constant STREAK_3_EGGS = 2;

    /// @notice Eggs for 7 day streak
    uint256 public constant STREAK_7_EGGS = 3;

    /// @notice Referral bonus for both parties
    uint256 public constant REFERRAL_BONUS = 5;

    /// @notice Streak threshold for 2 eggs
    uint256 public constant STREAK_THRESHOLD_2 = 3;

    /// @notice Maximum streak count
    uint256 public constant MAX_STREAK = 7;

    // ============ Events ============

    event CheckedIn(
        address indexed user,
        uint256 streak,
        uint256 eggsEarned,
        uint256 timestamp
    );

    event ReferralCompleted(
        address indexed referrer,
        address indexed referred,
        uint256 bonusEggs,
        uint256 timestamp
    );

    event StreakBroken(
        address indexed user,
        uint256 previousStreak,
        uint256 timestamp
    );

    // ============ Errors ============

    error AlreadyCheckedInToday();
    error CannotReferSelf();
    error AlreadyReferred();
    error ReferrerNotActive();

    // ============ Main Functions ============

    /**
     * @notice Check in for the day and earn eggs based on streak
     * @dev Calculates streak based on timestamp difference
     */
    function checkIn() external {
        _processCheckIn(msg.sender);
    }

    /**
     * @notice First-time check-in with a referral
     * @param referrer Address of the user who referred you
     * @dev Can only be called once per user, rewards both parties
     */
    function checkInWithReferral(address referrer) external {
        if (referrer == msg.sender) revert CannotReferSelf();
        if (hasBeenReferred[msg.sender]) revert AlreadyReferred();
        if (lastCheckIn[referrer] == 0) revert ReferrerNotActive();

        // Mark user as referred
        hasBeenReferred[msg.sender] = true;
        referredBy[msg.sender] = referrer;

        // Process regular check-in
        _processCheckIn(msg.sender);

        // Award referral bonus to both parties
        totalEggs[msg.sender] += REFERRAL_BONUS;
        totalEggs[referrer] += REFERRAL_BONUS;
        referralCount[referrer]++;

        emit ReferralCompleted(
            referrer,
            msg.sender,
            REFERRAL_BONUS,
            block.timestamp
        );
    }

    /**
     * @notice Internal function to process daily check-in
     * @param user The user checking in
     */
    function _processCheckIn(address user) internal {
        uint256 timeSinceLastCheckIn = block.timestamp - lastCheckIn[user];

        // Check if user already checked in today
        if (lastCheckIn[user] > 0 && timeSinceLastCheckIn < ONE_DAY) {
            revert AlreadyCheckedInToday();
        }

        uint256 newStreak;

        // First time checking in
        if (lastCheckIn[user] == 0) {
            newStreak = 1;
        }
        // Check if streak continues (checked in within 48 hours)
        else if (timeSinceLastCheckIn <= 2 * ONE_DAY) {
            newStreak = currentStreak[user] + 1;
            if (newStreak > MAX_STREAK) {
                newStreak = MAX_STREAK;
            }
        }
        // Streak broken (more than 48 hours)
        else {
            uint256 oldStreak = currentStreak[user];
            emit StreakBroken(user, oldStreak, block.timestamp);
            newStreak = 1;
        }

        // Update state
        lastCheckIn[user] = block.timestamp;
        currentStreak[user] = newStreak;

        // Calculate eggs based on streak
        uint256 eggsEarned = _calculateEggs(newStreak);
        totalEggs[user] += eggsEarned;

        emit CheckedIn(user, newStreak, eggsEarned, block.timestamp);
    }

    /**
     * @notice Calculate eggs to award based on current streak
     * @param streak The current streak count
     * @return Number of eggs to award
     */
    function _calculateEggs(uint256 streak) internal pure returns (uint256) {
        if (streak >= MAX_STREAK) {
            return STREAK_7_EGGS;
        } else if (streak >= STREAK_THRESHOLD_2) {
            return STREAK_3_EGGS;
        } else {
            return BASE_EGGS;
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get user's complete stats
     * @param user The user address to query
     * @return lastCheck Last check-in timestamp
     * @return streak Current streak count
     * @return eggs Total eggs earned
     * @return referrer Address of referrer (if any)
     * @return referrals Number of successful referrals
     * @return canCheckIn Whether user can check in now
     */
    function getUserStats(address user)
        external
        view
        returns (
            uint256 lastCheck,
            uint256 streak,
            uint256 eggs,
            address referrer,
            uint256 referrals,
            bool canCheckIn
        )
    {
        lastCheck = lastCheckIn[user];
        streak = currentStreak[user];
        eggs = totalEggs[user];
        referrer = referredBy[user];
        referrals = referralCount[user];

        // User can check in if never checked in or last check-in was >= 1 day ago
        canCheckIn = (lastCheck == 0) || (block.timestamp - lastCheck >= ONE_DAY);
    }

    /**
     * @notice Calculate next egg reward for a user
     * @param user The user address to query
     * @return Number of eggs user will earn on next check-in
     */
    function getNextReward(address user) external view returns (uint256) {
        uint256 timeSinceLastCheckIn = block.timestamp - lastCheckIn[user];
        uint256 nextStreak;

        if (lastCheckIn[user] == 0) {
            nextStreak = 1;
        } else if (timeSinceLastCheckIn <= 2 * ONE_DAY) {
            nextStreak = currentStreak[user] + 1;
            if (nextStreak > MAX_STREAK) {
                nextStreak = MAX_STREAK;
            }
        } else {
            nextStreak = 1;
        }

        return _calculateEggs(nextStreak);
    }

    /**
     * @notice Check if user's streak will break on next check-in
     * @param user The user address to query
     * @return True if streak will break
     */
    function willStreakBreak(address user) external view returns (bool) {
        if (lastCheckIn[user] == 0) return false;
        uint256 timeSinceLastCheckIn = block.timestamp - lastCheckIn[user];
        return timeSinceLastCheckIn > 2 * ONE_DAY;
    }

    /**
     * @notice Get time remaining until user can check in
     * @param user The user address to query
     * @return Seconds until next check-in is available (0 if available now)
     */
    function timeUntilNextCheckIn(address user) external view returns (uint256) {
        if (lastCheckIn[user] == 0) return 0;

        uint256 timeSinceLastCheckIn = block.timestamp - lastCheckIn[user];
        if (timeSinceLastCheckIn >= ONE_DAY) return 0;

        return ONE_DAY - timeSinceLastCheckIn;
    }
}
