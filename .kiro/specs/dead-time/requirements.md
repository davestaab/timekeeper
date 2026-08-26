# Requirements: Dead Time

## Overview
Timekeeper currently tracks a user-defined set of categories on a timeline chart, where each category is a row and a step-line traces which category is active over the course of the day. This feature adds a built-in, always-present "dead time" pseudo-category representing time the user does not want counted toward their tracked total (e.g. personal time, breaks, or untracked gaps). It behaves like a normal category for the purpose of logging time on the chart, but is visually distinct (drawn in red), cannot be created or removed by the user, is excluded from the category total, and is labeled with an em dash (—) wherever it appears in lists rather than a normal category name. The reserved category value `deadTime` is applied implicitly at render/interaction time — it is never written into the per-day `categories` array in storage. `TimelineEntry` records with `category: 'deadTime'` are the only persisted trace of it; the row itself, its position, and its exclusion from Categories widget editing are all computed rather than stored.

## User Stories

### Log dead time on the timeline
**As a** user tracking my day
**I want** to record personal or untracked time on the timeline the same way I record any other category
**So that** I can account for gaps in my day without having to invent a throwaway category

#### Acceptance Criteria
- [ ] Given the timeline chart for any day, when it renders, then a dead-time row is present at the bottom of the chart even if the user has never added a category named for it, and even for days saved before this feature existed.
- [ ] Given the dead-time row on the chart, when the user clicks within it the same way they would click within any other category's row, then a timeline entry is added to the dead-time category at that time.
- [ ] Given a day that has no existing categories or entries, when the timeline chart renders, then the dead-time row is still present.
- [ ] Given the Categories widget, when the user views their list of categories, then dead time is not listed as a deletable/editable category and has no delete control. This holds without any filtering logic in the Categories widget itself, because `deadTime` is never written into the persisted `categories` array it renders from.
- [ ] Given the Categories widget, when the user types `deadTime` (the reserved internal category value) as a new category name, then the creation is rejected/ignored rather than creating a duplicate or colliding category.

### Visually distinguish dead time on the chart
**As a** user reviewing my timeline
**I want** dead time to be immediately visible as different from tracked categories
**So that** I can tell at a glance how much of my day was untracked versus tracked

#### Acceptance Criteria
- [ ] Given the timeline chart, when dead time is rendered, then the row and/or line segments for dead time use a distinct color (red) not used by any tracked category.
- [ ] Given the y-axis of the timeline chart, when the axis ticks are drawn, then the dead-time row has no text label (unlike tracked categories, which show their name).
- [ ] Given the dead-time row's position, when categories are added, removed, or reordered by the user, then dead time remains the bottom-most row on the chart. This is enforced by the chart's rendering logic (it always appends `deadTime` last when building the y-axis row order from whatever `categories` it receives), not by anything stored in the persisted `categories` array.

### Exclude dead time from the tracked total
**As a** user reviewing my time-by-category summary
**I want** dead time shown separately from my tracked categories
**So that** my total reflects only the time I actually intended to track

#### Acceptance Criteria
- [ ] Given the "Total By Category" widget, when dead time has logged minutes for the day, then its amount is displayed as its own line, labeled with an em dash (—) instead of `deadTime`.
- [ ] Given the "Total By Category" widget, when the total is calculated, then dead-time minutes are not included in that total.
- [ ] Given the "Total By Category" widget, when dead time has logged minutes, then its line is displayed below the Total line (not intermixed with tracked categories above it).
- [ ] Given the "Total By Category" widget, when dead time has zero logged minutes for the day, then it is not shown (consistent with how other zero-time categories behave, if applicable).

### Identify dead time in the entries list
**As a** user reviewing my raw entries list
**I want** dead-time entries to be clearly distinguishable from entries with real category names
**So that** I don't mistake dead time for an actual tracked category

#### Acceptance Criteria
- [ ] Given the Entries list, when an entry belongs to dead time, then its category label is displayed as an em dash (—) instead of `deadTime`.
- [ ] Given the Entries list, when entries are listed in time order, then dead-time entries appear inline in that same chronological order (not grouped separately).
- [ ] Given consecutive dead-time entries with no other category between them, when the data is cleaned/de-duplicated, then dead time collapses the same way consecutive entries of any other single category do today (existing `cleanData`/`removeDupCategories` behavior, no special-casing).

## Out of Scope
- Making the dead-time color configurable or user-selectable (hardcoded to red for now).
- Allowing the user to rename, relabel, or otherwise customize the dead-time category.
- Supporting more than one built-in "untracked time" category.
- Any changes to data export/import formats beyond what's needed to store dead-time entries.
- Any migration of stored data — since `deadTime` is never persisted in the `categories` array, no existing saved days need to be modified for this feature to work.

## Open Questions
(none — all resolved)
