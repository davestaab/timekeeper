# Design: Dead Time

## Approach
Dead time is implemented as a reserved category value, `DEAD_TIME = 'deadTime'`, that is never written to a day's persisted `categories` array. Instead, it is injected at three computed boundaries: the chart's internal category list (always includes it, always positioned as the bottom row), the "Total By Category" widget (split out of the tracked total), and the entries list (its category rendered as an em dash). This keeps `Timeline.vue`, `src/utils.ts` (storage), and the `DayData`/`TimelineEntry` types completely untouched — the feature is additive logic layered on existing data, not a data-model or migration change.

The one substantive new piece of logic — turning a day's entries into the line segments the chart draws — is written as a pure, testable function in `src/timeline/utils.ts` rather than inline in the D3 rendering code. This matches the project's existing testing boundary: `src/timeline/utils.ts` is unit tested and mutation tested, while `src/timeline/TimeLineChart.ts` and `src/components/TimeLineChart.vue` are excluded from both (see `vite.config.ts` and `stryker.config.json`) because they're D3/DOM wiring. Keeping the branching logic in `utils.ts` and leaving `TimeLineChart.ts` to just consume the already-computed segments preserves that boundary instead of adding untested complexity to the excluded files.

**Revision:** the chart originally rendered one continuous step-line (d3's `curveStepAfter`) across all entries, split into colored sub-paths only where a run entered or left dead time — so a tracked category's time was still visually connected to the next entry via a vertical riser between rows. That was replaced with the current model: every category's time is drawn as an **isolated horizontal line**, one per pair of consecutive entries, with **no vertical connector** between rows at all. `splitByDeadTime` (which grouped entries into multi-point dead/non-dead runs for a single continuous path) was removed and replaced with `toHorizontalSegments`, which produces one two-point `{ from, to, isDead }` segment per consecutive pair — this is a strictly simpler model (no path-generator/curve machinery needed at all, since a two-point same-height line is just an SVG `<line>`) and it naturally applies the "no verticals" rule to every category, not just dead time.

## Files Changed

| File | Change |
|------|--------|
| `src/timeline/utils.ts` | Add `DEAD_TIME` constant, `withDeadTime()`, `categoryLabel()`, `toHorizontalSegments()`, `HorizontalSegment` type; update `formatCategory()` to return `''` for dead time |
| `src/timeline/TimeLineChart.ts` | `categories()` setter injects `DEAD_TIME` via `withDeadTime()`; `updateLine()` renders one `<line>` per consecutive entry pair (red-400 when the pair starts on dead time), each purely horizontal at the starting entry's row — no vertical connector between rows; `updatePoints()` applies a `point--dead` class to dead-time points and now excludes the last entry; new `updateMarker()` renders the last entry as a grey dashed vertical line spanning the full chart height instead of a point |
| `src/components/TimeLineChart.vue` | Add `.segment`/`.segment--dead` (red-400), `.marker` (grey, dashed), and `.point--dead` (red-400) CSS rules |
| `src/components/Categories.vue` | Block creating a category literally named `deadTime` |
| `src/components/summary/ByCategory.vue` | Exclude dead time from the total; render its line below the Total line, labeled with an em dash |
| `src/components/summary/Entries.vue` | Render dead-time entries' category as an em dash |
| `tests/unit/utils.spec.ts` | Add coverage for `withDeadTime`, `categoryLabel`, `toHorizontalSegments`, and the `formatCategory` dead-time case |
| `tests/unit/ByCategory.spec.ts` | Add coverage for dead-time exclusion from total and its display below Total |
| `tests/unit/Entries.spec.ts` | Add coverage for the em-dash label on dead-time entries |
| `tests/unit/Categories.spec.ts` | Add coverage for the reserved-name creation block |

No files are created; no changes to `src/types.ts`, `src/utils.ts` (storage), `src/components/Timeline.vue`, or `src/components/DatePicker.vue`.

## Data Model
No changes to `DayData` or `TimelineEntry` (`src/types.ts`). `TimelineEntry.category` simply takes the value `'deadTime'` for dead-time entries, using the existing `string` type — no new field, no schema version bump.

One new internal type, local to `src/timeline/utils.ts` and consumed by `src/timeline/TimeLineChart.ts`:

```ts
export interface HorizontalSegment {
  from: TimelineEntry;
  to: TimelineEntry;
  isDead: boolean;
}
```

## Component / Module Design

### `src/timeline/utils.ts` (new exports)

```ts
export const DEAD_TIME = 'deadTime';

// Always puts DEAD_TIME first in the resulting array (see Key Implementation
// Details for why "first" = bottom row), de-duping if it's already present.
export function withDeadTime(categories: string[]): string[] {
  return [DEAD_TIME, ...categories.filter((c) => c !== DEAD_TIME)];
}

// Display label for entries/summary lists (em dash instead of the raw value).
export function categoryLabel(category: string): string {
  return category === DEAD_TIME ? '—' : category;
}

// One horizontal segment per pair of consecutive entries, drawn at the
// row of the earlier entry (`from`) — no vertical connector to the next
// row. This is what makes each category run render as an isolated
// horizontal line rather than a connected step-line across rows.
export function toHorizontalSegments(
  entries: TimelineEntry[],
): HorizontalSegment[] {
  const segments: HorizontalSegment[] = [];
  for (let i = 0; i < entries.length - 1; i++) {
    segments.push({
      from: entries[i],
      to: entries[i + 1],
      isDead: entries[i].category === DEAD_TIME,
    });
  }
  return segments;
}
```

`formatCategory` (existing function) gains one branch:

```ts
export function formatCategory(d: string): string {
  if (d === DEAD_TIME) return '';
  return d.length > CAT_DISPLAY_LENGTH ? d.substring(0, CAT_DISPLAY_LENGTH) : d;
}
```

### `src/timeline/TimeLineChart.ts`

- **`categories()` setter**: currently `categories = _!; updateCategories();`. Change to `categories = withDeadTime(_!); updateCategories();`. This is the single injection point — `yScale.domain(categories)` (row order/position), `removeUnknownCategories(data, categories)` (keeps dead-time entries instead of stripping them as unknown), and the y-axis tick rendering all read from this same `categories` variable, so they all automatically account for dead time without further changes. The module-level default `let categories = ['red', 'blue', 'one', 'two']` is also wrapped in `withDeadTime(...)` at declaration for consistency, though in practice `onMounted` in `TimeLineChart.vue` always calls `.categories(props.categories)` before the chart is attached to the DOM, so the default is never actually rendered.
- **`updateLine(entries)`**: replace the single static `<path class="line">` (currently created once in the `chart(selection)` setup function and only having its `d` attribute updated) with a D3 join over `toHorizontalSegments(entries)`, rendering plain SVG `<line>` elements instead of a `<path>` — no curve generator needed since each segment is just two same-height points:
  ```ts
  function updateLine(entries: TimelineEntry[]): void {
    const segments = toHorizontalSegments(entries);
    const lines = lineGrp.selectAll('line.segment').data(segments);
    lines.exit().remove();
    const merged = lines.enter().append('line').merge(lines);
    merged.attr('class', (s: HorizontalSegment) => s.isDead ? 'segment segment--dead' : 'segment');
    addTransitions(merged)
      .attr('x1', (s: HorizontalSegment) => X(s.from))
      .attr('y1', (s: HorizontalSegment) => Y(s.from))
      .attr('x2', (s: HorizontalSegment) => X(s.to))
      .attr('y2', (s: HorizontalSegment) => Y(s.from)); // same y as from — purely horizontal
  }
  ```
  The old `chartLine = line<TimelineEntry>().x(X).y(Y).curve(curveStepAfter)` generator, and the `line`/`curveStepAfter` imports from `d3`, are removed entirely — nothing else used them.

  Removing the single static `<path class="line">` (previously appended once, first, in the `chart(selection)` setup block, before the axes/hover circle) changes paint order if not handled: `updateLine` now creates elements lazily, which would otherwise put them *after* the axes/hover/points in the DOM and thus on top of them. To preserve the original stacking (line behind axes and hover, points on top of everything, matching pre-existing behavior), a persistent `lineGrp = chartGrp.append('g').attr('class', 'lines')` container is created in the setup block at the same position the old static path used to occupy, and `updateLine` joins against `lineGrp.selectAll('line.segment')` rather than `chartGrp` directly.
- **`updatePoints(entries)`**: class attribute becomes a function instead of the constant `'point'`, applied on both the update selection and the enter selection:
  ```ts
  const pointClass = (d: TimelineEntry) => d.category === DEAD_TIME ? 'point point--dead' : 'point';
  ```
  used in place of `.attr('class', 'point')` in both places it currently appears in `updatePoints`. It also now binds to `entries.slice(0, -1)` instead of `entries` — the last entry no longer gets a circle (see `updateMarker` below).
- **`updateMarker(entries)`** (new function): renders the *last* entry (`entries[entries.length - 1]`, or nothing if `entries` is empty) as a vertical `<line>` instead of a circle, since it has no outgoing horizontal segment yet. It spans the *entire chart height* (`y1 = 0` to `y2 = chartHeight`) rather than being centered on the point, and does not vary by category (no `--dead` modifier) — it reads as a generic "this is where tracked data currently ends" guide line, not a category indicator:
  ```ts
  function updateMarker(entries: TimelineEntry[]): void {
    const last = entries.length > 0 ? [entries[entries.length - 1]] : [];
    const update = svg.select('.all').selectAll('.marker').data(last, identity);
    addTransitions(update).attr('x1', X).attr('x2', X).attr('y1', 0).attr('y2', chartHeight);
    addTransitions(
      update.enter().append('line').attr('class', 'marker')
        .attr('x1', X).attr('x2', X).attr('y1', chartHeight / 2).attr('y2', chartHeight / 2),
    ).attr('y1', 0).attr('y2', chartHeight);
    addTransitions(update.exit())
      .attr('y1', chartHeight / 2).attr('y2', chartHeight / 2).remove();
  }
  ```
  Entering/exiting markers animate from/to a zero-height line centered vertically (mirroring how points grow/shrink their radius), and it's called from `liveUpdateChart` alongside `updatePoints`. Since only one entry in the whole dataset is ever "last," this selection always binds to a 0-or-1-element array — same technique the file already uses for the single `hover` circle.

### `src/components/TimeLineChart.vue`
The `.line` rule is renamed `.segment` (the element is now an SVG `<line>`, not a `<path>`, so `fill: none` and `stroke-linejoin` — both meaningless on a `<line>` — are dropped), plus a dead-time modifier and the marker rule, following the existing `.hover--off` modifier-class naming convention:
```css
.segment {
  stroke: blueviolet;
  stroke-width: 5px;
  stroke-linecap: round;
}
.segment--dead {
  stroke: #f87171; /* tailwind red-400 */
}
.marker {
  stroke: #d1d5db; /* tailwind gray-300 */
  stroke-width: 1px;
  stroke-dasharray: 4 3;
}
.point--dead {
  stroke: #f87171; /* tailwind red-400 */
  fill: rgba(248, 113, 113, 0.15);
}
```
`.segment--dead` relies on cascade order (declared after `.segment`) to override `stroke: blueviolet`; `stroke-width`/`stroke-linecap` are inherited unchanged since both classes are present together (`class="segment segment--dead"`). The dead-time color uses Tailwind's `red-400` (`#f87171`) rather than pure red — deliberately more subdued. `.marker` is a light grey (Tailwind `gray-300`), thin (`1px`, versus `.segment`'s `5px`), dashed line — a subtle "end of data" guide rather than a bold category-colored mark.

### `src/components/Categories.vue`
`createCategory()` gains a guard as its first line:
```ts
import { DEAD_TIME } from '@/timeline/utils';

function createCategory(cat: string) {
  if (cat === DEAD_TIME) {
    newCat.value = '';
    return;
  }
  emit('createCategory', cat);
  newCat.value = '';
}
```
Exact, case-sensitive string match — consistent with the fact that category names aren't trimmed or normalized anywhere else in the app today. This is the only call site that creates categories, so no corresponding guard is needed in `Timeline.vue`.

### `src/components/summary/ByCategory.vue`
```ts
import { computed } from 'vue';
import { DEAD_TIME, categoryLabel } from '@/timeline/utils';

const props = defineProps<{ times: Record<string, number> }>();

const trackedTimes = computed(() => {
  const rest = { ...props.times };
  delete rest[DEAD_TIME];
  return rest;
});

const total = computed(() =>
  Object.values(trackedTimes.value).reduce((sum, v) => sum + v, 0),
);

const deadTimeHours = computed(() => props.times[DEAD_TIME]);
```
Template:
```html
<ul>
  <li v-for="(val, key) in trackedTimes" :key="key" class="m-1">
    {{ val }} hr(s): {{ key }}
  </li>
  <li class="m-1 font-bold">{{ total }}: Total</li>
  <li v-if="deadTimeHours !== undefined" class="m-1">
    {{ deadTimeHours }} hr(s): {{ categoryLabel(DEAD_TIME) }}
  </li>
</ul>
```
`delete rest[DEAD_TIME]` on a shallow copy is used instead of destructuring-and-discarding a key, to avoid an unused-variable oxlint warning that the destructuring pattern would otherwise produce.

### `src/components/summary/Entries.vue`
```ts
import { categoryLabel } from '@/timeline/utils';
```
Template change: `{{ formatDate(e.time) }} - {{ e.category }}` becomes `{{ formatDate(e.time) }} - {{ categoryLabel(e.category) }}`.

## Key Implementation Details
- **Why `DEAD_TIME` is prepended, not appended**: the chart builds `yScale = scalePoint().domain(categories).rangeRound([chartHeight, 0])`. In d3, `domain[0]` maps to `range[0]` (`chartHeight`, the visually lowest point in the SVG since y grows downward) and the last domain entry maps to `range[1]` (`0`, the top). So the bottom-most row is `categories[0]`, not the last element — `withDeadTime` must put `DEAD_TIME` at index 0 to satisfy "dead time is always the bottom row."
- `withDeadTime` filters out any existing `'deadTime'` entry before prepending, so hand-edited or pre-existing localStorage data that happens to already contain that literal string can't produce two rows.
- Every consecutive pair of entries gets its own horizontal segment, colored by whether the *earlier* entry (`from`) is dead time — not the later one (`to`). A segment ending on a dead-time entry is not itself colored dead; only the segment that *starts* there is. This matches d3's old `curveStepAfter` semantics (a horizontal run stays at the earlier point's height) without needing the curve generator at all.
- There is deliberately no vertical connector between rows anymore, for any category, not just dead time — that's the whole point of the redesign the user asked for after seeing the original stepped/connected version. A gap between one row's horizontal segment and the next row's is expected, not a bug.
- `formatCategory` (chart y-axis tick text, truncates to 10 chars) and `categoryLabel` (em dash for list displays) are deliberately separate functions with different outputs for `DEAD_TIME` (`''` vs `'—'`) — the two display contexts have different requirements and shouldn't be conflated into one function.
- No change to `removeUnknownCategories`, `timesByCategory`, `cleanData`, `removeDupCategories`, `removeDupTimes`, `addPoint`, or `invertY` — all of them are generic over the `category` string field or the categories list, and already do the right thing once the categories list passed to them includes `DEAD_TIME`. This is what makes clicking inside the dead-time row, deduping consecutive dead-time entries, and computing `times.deadTime` all work with zero code changes in those functions.

## Edge Cases & Error Handling
- Day with no entries at all: the dead-time row still renders (unlabeled, empty), since `withDeadTime` injects it into the chart's categories regardless of what `props.categories` or the day's entries contain.
- A day whose entries are *only* dead time: `ByCategory` renders just the `0: Total` line plus the dead-time line below it; `Entries` renders every row with an em dash.
- A single entry with nothing before or after it (e.g. the only entry in a day) produces zero segments from `toHorizontalSegments` — there's no pair to draw a line between, and that lone entry is also the "last" entry, so it renders only as a marker, no circle. Same for the very last entry of a multi-entry day: nothing is drawn after it, matching the original chart's behavior of never extending a line past the final point.
- `updateMarker` uses `entries.length > 0 ? [entries[entries.length - 1]] : []` rather than assuming at least one entry — a day with zero entries renders no marker at all, not an error.
- `times[DEAD_TIME] === 0` (rounds to exactly 0.00 hours): still rendered as its own line, since the check is presence (`!== undefined`), not truthiness — consistent with how any other category's line already renders today regardless of value.
- Pre-existing localStorage data that already contains the literal string `deadTime` in a day's `categories` array: `withDeadTime` prevents it from producing a duplicate chart row, but it would still show up as an ordinary, deletable entry in the Categories widget in that specific case. This is an accepted limitation of the "no migration" decision, not something this feature actively cleans up.
- Typing `deadtime`, `DeadTime`, or `" deadTime"` (different case or whitespace) into the new-category input is *not* blocked — the guard is an exact match, consistent with the app doing no trimming/normalization of category names anywhere else.

## Testing Approach
- **`tests/unit/utils.spec.ts`**: new `describe` blocks for `withDeadTime` (dedupes, prepends), `categoryLabel` (em dash vs passthrough), `toHorizontalSegments` (no entries → `[]`; single entry → `[]`; N entries → N-1 segments, each keyed off the earlier entry; a segment is marked dead only when it *starts* on a dead-time entry, not when it ends on one), and a case added to the existing `formatCategory` block for `DEAD_TIME` → `''`. Follows the existing plain-function-call testing style already used for `cleanData`, `timesByCategory`, etc.
- **`tests/unit/ByCategory.spec.ts`**: extend with cases for `times` containing a `deadTime` key — assert the total excludes it, assert its line renders below the `Total` line with the em-dash label, and assert it's absent when `times` has no `deadTime` key. Uses the existing `shallowMount` + props pattern.
- **`tests/unit/Entries.spec.ts`**: extend with an entry whose `category` is `'deadTime'` and assert the rendered text contains `— ` (em dash) instead of `deadTime`.
- **`tests/unit/Categories.spec.ts`**: extend with a case that sets the input to `'deadTime'`, triggers `keyup.enter`, and asserts no `createCategory` event was emitted and the input was cleared.
- **`src/timeline/TimeLineChart.ts` / `src/components/TimeLineChart.vue`**: no new automated tests, consistent with their existing exclusion from `vitest` coverage (`vite.config.ts`) and Stryker mutation testing (`stryker.config.json`). Verify manually via `pnpm serve`: confirm the bottom row has no axis label, click within it to add a red point, click a few more points across different rows and confirm each renders as an isolated horizontal segment (red when it starts on dead time, no vertical line connecting one row to the next), and confirm the "Total By Category"/"Entries" widgets behave as specified above.
