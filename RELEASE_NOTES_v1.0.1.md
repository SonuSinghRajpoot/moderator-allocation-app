# Moderator Allocation App v1.0.1

## Moderator Allocation Fix

### Issue
When a file had multiple evaluators (e.g., A, B, C), the previous greedy allocation algorithm could leave one evaluator without an assigned moderator. For example:
- A's booklets → assigned to B
- B's booklets → assigned to A
- C's booklets → **no available moderator** (A and B already used)

This caused silent data loss: C's selected booklets were never written to the output.

### Solution
Replaced the greedy algorithm with a **pre-computed derangement mapping**:
- Before assigning moderators, the app now computes a valid evaluator→moderator mapping for all evaluators
- Uses Sattolo's algorithm to generate a random derangement (permutation with no fixed points)
- Guarantees every evaluator gets a different moderator, with no one left unassigned
- Works correctly for any number of evaluators (2, 3, 4, or more)

### Technical Changes
- Added `randomDerangement` and `computeEvaluatorModeratorMapping` in `processingUtils.ts`
- Refactored `assignModerators` to use the mapping instead of greedy selection
- Each evaluator's booklets are now consistently assigned to exactly one moderator
