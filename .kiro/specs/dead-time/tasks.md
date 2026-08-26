# Tasks: Dead Time

## Implementation Tasks

- [x] 1. Add dead-time utilities to `src/timeline/utils.ts`
  - **Files:** `src/timeline/utils.ts`
  - Add the `DEAD_TIME = 'deadTime'` constant, `withDeadTime()` (prepends `DEAD_TIME`, de-duping any existing occurrence — see design's note on why it must be *first* in the array, not last), `categoryLabel()` (em dash for `DEAD_TIME`, passthrough otherwise), `splitByDeadTime()` plus its `LineSegment { isDead, points }` interface (splits chronologically-sorted entries into runs only at dead/non-dead boundaries, duplicating the boundary point into both segments). Update the existing `formatCategory()` to return `''` when `d === DEAD_TIME`.

- [x] 2. Unit test the new utils functions
  - **Files:** `tests/unit/utils.spec.ts`
  - Add `describe` blocks for `withDeadTime` (prepends, dedupes an existing `deadTime` entry), `categoryLabel` (em dash vs. passthrough), and `splitByDeadTime` (empty input → `[]`; all-tracked → one non-dead segment; all-dead → one dead segment; a tracked/dead/tracked sequence → three segments with the boundary entries duplicated at segment edges). Extend the existing `formatCategory` describe block with the `DEAD_TIME` → `''` case.

- [x] 3. Make the chart's category handling always include dead time
  - **Files:** `src/timeline/TimeLineChart.ts`
  - In the `categories()` setter, wrap the incoming value with `withDeadTime()` before assigning to the local `categories` variable; wrap the module-level default (`let categories = [...]`) the same way for consistency. This single change is what makes `yScale.domain(categories)` (row position), `removeUnknownCategories(data, categories)` (stops dead-time entries from being filtered out as unknown), and the y-axis tick rendering all correctly account for dead time — no other function in this file needs to change for the row to appear, be positioned at the bottom, or be clickable.

- [x] 4. Render dead-time line segments and points in red
  - **Files:** `src/timeline/TimeLineChart.ts`, `src/components/TimeLineChart.vue`
  - In `TimeLineChart.ts`: remove the one-time `chartGrp.append('path').attr('class', 'line')` from the `chart(selection)` setup block; rewrite `updateLine(entries)` to compute `splitByDeadTime(entries)` and run a D3 enter/update/exit join on `chartGrp.selectAll('path.line')`, setting `class` to `'line line--dead'` when a segment's `isDead` is true and `'line'` otherwise, then setting `d` via `chartLine(segment.points)` on the merged selection. In `updatePoints(entries)`, change the hardcoded `.attr('class', 'point')` (both the update and enter selections) to a function that appends `' point--dead'` when `d.category === DEAD_TIME`. In `TimeLineChart.vue`'s existing unscoped `<style>` block, add `.line--dead { stroke: red; }` and `.point--dead { stroke: red; fill: rgba(255, 0, 0, 0.15); }`, following the existing `.hover--off` modifier-class naming convention.

- [x] 5. Block creating a category named "deadTime"
  - **Files:** `src/components/Categories.vue`, `tests/unit/Categories.spec.ts`
  - Import `DEAD_TIME` from `@/timeline/utils`. At the top of `createCategory()`, add a guard: if `cat === DEAD_TIME`, clear `newCat.value` and `return` without emitting `createCategory`. Exact case-sensitive match only — no trimming/normalizing, consistent with existing category-name handling. Add a test that sets the input to `'deadTime'`, triggers `keyup.enter`, and asserts no `createCategory` event was emitted and the input was cleared.

- [x] 6. Split dead time out of the category total
  - **Files:** `src/components/summary/ByCategory.vue`, `tests/unit/ByCategory.spec.ts`
  - Import `DEAD_TIME, categoryLabel` from `@/timeline/utils`. Add a `trackedTimes` computed that shallow-copies `props.times` and `delete`s the `DEAD_TIME` key (not destructuring-and-discarding, to avoid an oxlint unused-var warning), a `total` computed derived from `trackedTimes` instead of `times`, and a `deadTimeHours` computed reading `props.times[DEAD_TIME]`. Update the template to loop over `trackedTimes` for the category rows, keep the `Total` row as-is, and add a row below it — `v-if="deadTimeHours !== undefined"` — showing `{{ deadTimeHours }} hr(s): {{ categoryLabel(DEAD_TIME) }}`. Add tests: a `deadTime` key is excluded from the computed total, its line renders below the `Total` line with an em dash, and the line is absent when `times` has no `deadTime` key.

- [x] 7. Label dead-time entries with an em dash
  - **Files:** `src/components/summary/Entries.vue`, `tests/unit/Entries.spec.ts`
  - Import `categoryLabel` from `@/timeline/utils` and replace `{{ e.category }}` in the template with `{{ categoryLabel(e.category) }}`. Add a test with an entry whose `category` is `'deadTime'` asserting the rendered row contains the em dash instead of the raw value.

- [x] 8. Full verification pass
  - **Files:** none (verification only)
  - Run `pnpm lint`, `pnpm type-check`, and `pnpm test` (coverage thresholds must still pass). Then `pnpm serve` and manually check: the bottom chart row renders with no axis label; clicking inside it adds a red point; adding a dead-time entry adjacent to a tracked one renders the connecting segment red only where it touches dead time and default-colored elsewhere; the "Total By Category" widget excludes dead time from the total and shows it below with an em dash; the Entries list shows an em dash for that entry; typing `deadTime` into the new-category input and pressing enter does nothing.

## Revision: horizontal-only line segments

After completing the above, the connected step-line visual (task 4) was replaced: every category now renders as isolated horizontal segments with no vertical connector between rows, not just dead time. `splitByDeadTime`/`LineSegment` (task 1) were removed and replaced with `toHorizontalSegments`/`HorizontalSegment` (one two-point segment per consecutive entry pair, colored by the *starting* entry's category). `TimeLineChart.ts`'s `updateLine` now renders plain SVG `<line>` elements instead of `<path>`s built from a `curveStepAfter` generator, and the CSS class `.line`/`.line--dead` was renamed `.segment`/`.segment--dead`. See [design.md](design.md)'s "Revision" note and updated sections for the current, accurate description — tasks 1–4's descriptions above are left as the historical record of the original implementation and no longer describe the shipped code exactly. Covered by the same lint/type-check/test/manual-browser verification as task 8, re-run after the change.

## Revision: last entry renders as a marker, not a point

`updatePoints` in `TimeLineChart.ts` now excludes the last (most recent) entry — it has no outgoing horizontal segment yet, so drawing it as a circle like the others was misleading. A new `updateMarker()` renders that one entry as a thin vertical `<line>` (`.marker`/`.marker--dead`, 2px stroke vs. the 5px `.segment` lines) centered on its point, animating in/out the same way points grow/shrink. See design.md's updated `updatePoints`/`updateMarker` description. Verified with the same lint/type-check/test/manual-browser pass as task 8 — this file remains outside automated coverage by existing project convention, so verification here is manual only.

## Revision: subtler dead-time red, and the marker as a full-height grey dashed guide

Two follow-up tweaks to the visuals above: (1) the dead-time red (`.segment--dead`, `.point--dead`) changed from pure red to Tailwind's `red-400` (`#f87171`) — less bold. (2) `.marker` (the last-entry indicator) is no longer category-colored (`.marker--dead` removed) — it's now a uniform light grey (Tailwind `gray-300`), dashed, thin (1px) line that spans the *entire chart height* (`y1=0` to `y2=chartHeight`) rather than being centered on the point, reading as a generic "tracked data ends here" guide instead of a category-colored mark. See design.md's updated `updateMarker`/CSS sections. Same manual-only verification as the prior marker revision.
