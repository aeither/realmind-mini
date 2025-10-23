// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {RetentionSystem} from "../src/RetentionSystem.sol";

contract RetentionSystemTest is Test {
    RetentionSystem public retention;

    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    // Constants from contract
    uint256 constant ONE_DAY = 1 days;
    uint256 constant BASE_EGGS = 1;
    uint256 constant STREAK_3_EGGS = 2;
    uint256 constant STREAK_7_EGGS = 3;
    uint256 constant REFERRAL_BONUS = 5;

    function setUp() public {
        retention = new RetentionSystem();
    }

    // ============ Basic Check-In Tests ============

    function testFirstCheckIn() public {
        vm.prank(user1);
        retention.checkIn();

        assertEq(retention.currentStreak(user1), 1);
        assertEq(retention.totalEggs(user1), BASE_EGGS);
        assertGt(retention.lastCheckIn(user1), 0);
    }

    function testCheckInEmitsEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit RetentionSystem.CheckedIn(user1, 1, BASE_EGGS, block.timestamp);
        retention.checkIn();
    }

    function testCannotCheckInTwiceInSameDay() public {
        vm.prank(user1);
        retention.checkIn();

        // Try to check in again immediately
        vm.prank(user1);
        vm.expectRevert(RetentionSystem.AlreadyCheckedInToday.selector);
        retention.checkIn();
    }

    function testCanCheckInAfter24Hours() public {
        vm.prank(user1);
        retention.checkIn();

        // Advance time by 24 hours
        vm.warp(block.timestamp + ONE_DAY);

        vm.prank(user1);
        retention.checkIn();

        assertEq(retention.currentStreak(user1), 2);
        assertEq(retention.totalEggs(user1), BASE_EGGS + BASE_EGGS);
    }

    // ============ Streak Tests ============

    function testStreakBuildsUp() public {
        vm.startPrank(user1);

        // Day 1
        retention.checkIn();
        assertEq(retention.currentStreak(user1), 1);
        assertEq(retention.totalEggs(user1), 1);

        // Day 2
        skip(ONE_DAY);
        retention.checkIn();
        assertEq(retention.currentStreak(user1), 2);
        assertEq(retention.totalEggs(user1), 2); // 1 + 1

        // Day 3 - should get 2 eggs now
        skip(ONE_DAY);
        retention.checkIn();
        assertEq(retention.currentStreak(user1), 3);
        assertEq(retention.totalEggs(user1), 4); // 1 + 1 + 2

        // Day 4 - still 2 eggs
        skip(ONE_DAY);
        retention.checkIn();
        assertEq(retention.currentStreak(user1), 4);
        assertEq(retention.totalEggs(user1), 6); // 1 + 1 + 2 + 2

        vm.stopPrank();
    }

    function testStreakReaches7Days() public {
        vm.startPrank(user1);

        uint256 expectedEggs = 0;

        for (uint256 i = 1; i <= 7; i++) {
            if (i > 1) {
                vm.warp(block.timestamp + ONE_DAY);
            }

            retention.checkIn();

            // Calculate expected eggs
            if (i >= 7) {
                expectedEggs += STREAK_7_EGGS;
            } else if (i >= 3) {
                expectedEggs += STREAK_3_EGGS;
            } else {
                expectedEggs += BASE_EGGS;
            }

            assertEq(retention.currentStreak(user1), i);
            assertEq(retention.totalEggs(user1), expectedEggs);
        }

        vm.stopPrank();
    }

    function testStreakCapsAt7() public {
        vm.startPrank(user1);

        // Check in for 10 days
        for (uint256 i = 1; i <= 10; i++) {
            if (i > 1) {
                vm.warp(block.timestamp + ONE_DAY);
            }
            retention.checkIn();
        }

        // Streak should cap at 7
        assertEq(retention.currentStreak(user1), 7);

        vm.stopPrank();
    }

    function testStreakBreaksAfter48Hours() public {
        vm.startPrank(user1);

        uint256 startTime = block.timestamp;

        // Build a 3-day streak
        retention.checkIn();
        vm.warp(startTime + ONE_DAY);
        retention.checkIn();
        vm.warp(startTime + (2 * ONE_DAY));
        retention.checkIn();

        assertEq(retention.currentStreak(user1), 3);
        uint256 eggsBeforeBreak = retention.totalEggs(user1);

        // Wait more than 48 hours (from day 2 to day 5 = more than 48 hours gap)
        uint256 nextCheckInTime = startTime + (5 * ONE_DAY) + 1;
        vm.warp(nextCheckInTime);

        // Expect streak broken event
        vm.expectEmit(true, false, false, true);
        emit RetentionSystem.StreakBroken(user1, 3, nextCheckInTime);
        retention.checkIn();

        // Streak should reset to 1
        assertEq(retention.currentStreak(user1), 1);
        assertEq(retention.totalEggs(user1), eggsBeforeBreak + BASE_EGGS);

        vm.stopPrank();
    }

    function testStreakContinuesWithin48Hours() public {
        vm.startPrank(user1);

        // Day 1
        retention.checkIn();
        assertEq(retention.currentStreak(user1), 1);

        // Wait exactly 48 hours (2 days) - should still continue
        vm.warp(block.timestamp + (2 * ONE_DAY));
        retention.checkIn();

        // Streak should continue
        assertEq(retention.currentStreak(user1), 2);

        vm.stopPrank();
    }

    // ============ Referral Tests ============

    function testReferralSuccess() public {
        // User1 checks in first (becomes active)
        vm.prank(user1);
        retention.checkIn();

        // User2 uses referral code from user1
        vm.prank(user2);
        vm.expectEmit(true, true, false, true);
        emit RetentionSystem.ReferralCompleted(user1, user2, REFERRAL_BONUS, block.timestamp);
        retention.checkInWithReferral(user1);

        // Check user2 state
        assertEq(retention.currentStreak(user2), 1);
        assertEq(retention.totalEggs(user2), BASE_EGGS + REFERRAL_BONUS); // 1 + 5 = 6
        assertEq(retention.referredBy(user2), user1);
        assertTrue(retention.hasBeenReferred(user2));

        // Check user1 received bonus
        assertEq(retention.totalEggs(user1), BASE_EGGS + REFERRAL_BONUS); // 1 + 5 = 6
        assertEq(retention.referralCount(user1), 1);
    }

    function testCannotReferSelf() public {
        vm.prank(user1);
        vm.expectRevert(RetentionSystem.CannotReferSelf.selector);
        retention.checkInWithReferral(user1);
    }

    function testCannotBeReferredTwice() public {
        // User1 becomes active
        vm.prank(user1);
        retention.checkIn();

        // User2 uses referral from user1
        vm.prank(user2);
        retention.checkInWithReferral(user1);

        // User3 becomes active
        vm.prank(user3);
        retention.checkIn();

        // User2 tries to use another referral
        vm.warp(block.timestamp + ONE_DAY);
        vm.prank(user2);
        vm.expectRevert(RetentionSystem.AlreadyReferred.selector);
        retention.checkInWithReferral(user3);
    }

    function testReferrerMustBeActive() public {
        // User1 has never checked in
        vm.prank(user2);
        vm.expectRevert(RetentionSystem.ReferrerNotActive.selector);
        retention.checkInWithReferral(user1);
    }

    function testMultipleReferrals() public {
        // User1 becomes active
        vm.prank(user1);
        retention.checkIn();

        // User2 uses referral from user1
        vm.prank(user2);
        retention.checkInWithReferral(user1);

        // User3 also uses referral from user1
        vm.prank(user3);
        retention.checkInWithReferral(user1);

        // User1 should have 2 referrals and bonus from both
        assertEq(retention.referralCount(user1), 2);
        assertEq(retention.totalEggs(user1), BASE_EGGS + (REFERRAL_BONUS * 2)); // 1 + 10 = 11
    }

    // ============ View Functions Tests ============

    function testGetUserStats() public {
        vm.prank(user1);
        retention.checkIn();

        (
            uint256 lastCheck,
            uint256 streak,
            uint256 eggs,
            address referrer,
            uint256 referrals,
            bool canCheckIn
        ) = retention.getUserStats(user1);

        assertEq(lastCheck, block.timestamp);
        assertEq(streak, 1);
        assertEq(eggs, BASE_EGGS);
        assertEq(referrer, address(0));
        assertEq(referrals, 0);
        assertFalse(canCheckIn); // Just checked in
    }

    function testGetUserStatsWithReferral() public {
        // User1 checks in
        vm.prank(user1);
        retention.checkIn();

        // User2 uses referral
        vm.prank(user2);
        retention.checkInWithReferral(user1);

        (
            ,
            ,
            ,
            address referrer,
            ,

        ) = retention.getUserStats(user2);

        assertEq(referrer, user1);
    }

    function testCanCheckInAfterOneDay() public {
        vm.prank(user1);
        retention.checkIn();

        (, , , , , bool canCheckIn) = retention.getUserStats(user1);
        assertFalse(canCheckIn);

        vm.warp(block.timestamp + ONE_DAY);

        (, , , , , canCheckIn) = retention.getUserStats(user1);
        assertTrue(canCheckIn);
    }

    function testGetNextReward() public {
        vm.startPrank(user1);

        // Day 1 - next reward should be 1
        uint256 nextReward = retention.getNextReward(user1);
        assertEq(nextReward, BASE_EGGS);

        retention.checkIn();

        // Day 2 - next reward should still be 1
        skip(ONE_DAY);
        nextReward = retention.getNextReward(user1);
        assertEq(nextReward, BASE_EGGS);

        retention.checkIn();

        // Day 3 - next reward should be 2 (3-day streak)
        skip(ONE_DAY);
        nextReward = retention.getNextReward(user1);
        assertEq(nextReward, STREAK_3_EGGS);

        retention.checkIn();

        // Continue to day 7
        for (uint256 i = 4; i <= 6; i++) {
            skip(ONE_DAY);
            retention.checkIn();
        }

        // Day 7 - next reward should be 3
        skip(ONE_DAY);
        nextReward = retention.getNextReward(user1);
        assertEq(nextReward, STREAK_7_EGGS);

        vm.stopPrank();
    }

    function testGetNextRewardAfterStreakBreak() public {
        vm.startPrank(user1);

        // Build a 5-day streak
        for (uint256 i = 1; i <= 5; i++) {
            if (i > 1) vm.warp(block.timestamp + ONE_DAY);
            retention.checkIn();
        }

        assertEq(retention.currentStreak(user1), 5);

        // Wait more than 48 hours
        vm.warp(block.timestamp + (3 * ONE_DAY));

        // Next reward should be 1 (streak will reset)
        uint256 nextReward = retention.getNextReward(user1);
        assertEq(nextReward, BASE_EGGS);

        vm.stopPrank();
    }

    function testWillStreakBreak() public {
        vm.startPrank(user1);

        // First check-in
        retention.checkIn();

        // Initially should not break
        assertFalse(retention.willStreakBreak(user1));

        // After 24 hours, still won't break
        skip(ONE_DAY);
        assertFalse(retention.willStreakBreak(user1));

        // After 48 hours total, still won't break
        skip(ONE_DAY);
        assertFalse(retention.willStreakBreak(user1));

        // After 48 hours + 1 second, will break
        skip(1);
        assertTrue(retention.willStreakBreak(user1));

        vm.stopPrank();
    }

    function testTimeUntilNextCheckIn() public {
        uint256 startTime = block.timestamp;

        vm.prank(user1);
        retention.checkIn();

        // Immediately after check-in, should be 24 hours
        uint256 timeRemaining = retention.timeUntilNextCheckIn(user1);
        assertEq(timeRemaining, ONE_DAY);

        // After 12 hours
        vm.warp(startTime + 12 hours);
        timeRemaining = retention.timeUntilNextCheckIn(user1);
        assertEq(timeRemaining, 12 hours);

        // After 24 hours
        vm.warp(startTime + 24 hours);
        timeRemaining = retention.timeUntilNextCheckIn(user1);
        assertEq(timeRemaining, 0);
    }

    function testTimeUntilNextCheckInForNewUser() public view {
        // New user should have 0 time until check-in
        uint256 timeRemaining = retention.timeUntilNextCheckIn(user1);
        assertEq(timeRemaining, 0);
    }

    // ============ Edge Cases ============

    function testMultipleUsersIndependent() public {
        // User1 checks in
        vm.prank(user1);
        retention.checkIn();

        // Wait 12 hours
        vm.warp(block.timestamp + 12 hours);

        // User2 checks in
        vm.prank(user2);
        retention.checkIn();

        // Each should have independent streaks
        assertEq(retention.currentStreak(user1), 1);
        assertEq(retention.currentStreak(user2), 1);

        // Wait another 13 hours (25 hours total from user1's check-in)
        vm.warp(block.timestamp + 13 hours);

        // User1 can check in again
        vm.prank(user1);
        retention.checkIn();
        assertEq(retention.currentStreak(user1), 2);

        // User2 cannot check in yet (only 13 hours since their check-in)
        vm.prank(user2);
        vm.expectRevert(RetentionSystem.AlreadyCheckedInToday.selector);
        retention.checkIn();
    }

    function testCompleteJourney() public {
        vm.startPrank(user1);

        uint256 totalEggs = 0;

        // Day 1-2: 1 egg each
        for (uint256 i = 1; i <= 2; i++) {
            if (i > 1) skip(ONE_DAY);
            retention.checkIn();
            totalEggs += BASE_EGGS;
            assertEq(retention.totalEggs(user1), totalEggs);
        }

        // Day 3-6: 2 eggs each
        for (uint256 i = 3; i <= 6; i++) {
            skip(ONE_DAY);
            retention.checkIn();
            totalEggs += STREAK_3_EGGS;
            assertEq(retention.totalEggs(user1), totalEggs);
        }

        // Day 7+: 3 eggs each
        for (uint256 i = 7; i <= 10; i++) {
            skip(ONE_DAY);
            retention.checkIn();
            totalEggs += STREAK_7_EGGS;
            assertEq(retention.totalEggs(user1), totalEggs);
        }

        // Total should be: 2*1 + 4*2 + 4*3 = 2 + 8 + 12 = 22 eggs
        assertEq(retention.totalEggs(user1), 22);
        assertEq(retention.currentStreak(user1), 7); // Capped at 7

        vm.stopPrank();
    }

    function testReferralChain() public {
        // User1 is the first active user
        vm.prank(user1);
        retention.checkIn();

        // User2 is referred by user1
        vm.prank(user2);
        retention.checkInWithReferral(user1);

        // User3 is referred by user2 (who is now active)
        vm.prank(user3);
        retention.checkInWithReferral(user2);

        // Check all referral relationships
        assertEq(retention.referredBy(user2), user1);
        assertEq(retention.referredBy(user3), user2);

        // Check referral counts
        assertEq(retention.referralCount(user1), 1);
        assertEq(retention.referralCount(user2), 1);
        assertEq(retention.referralCount(user3), 0);

        // Check eggs
        assertEq(retention.totalEggs(user1), BASE_EGGS + REFERRAL_BONUS); // 6
        assertEq(retention.totalEggs(user2), BASE_EGGS + REFERRAL_BONUS + REFERRAL_BONUS); // 11
        assertEq(retention.totalEggs(user3), BASE_EGGS + REFERRAL_BONUS); // 6
    }
}
