CAMPUS classroom staging data — corrected for app availability behavior

Files:
- cleaned_classroom_data.xlsx: four sheets (Rooms Cleaned, Schedule Slots, Validation Report, Exceptions to Review)
- rooms_cleaned.csv: classroom inventory for the Spaces page
- room_schedule_slots_cleaned.csv: one row per room/day/period
- validation_report.csv: structural checks and caveats
- exceptions_to_review.csv: remaining inventory classification questions and normalization note

Applied rules:
- Floor number is the first digit of the room code: 0=Ground, 1=First, 2=Second, 3=Third, 4=Fourth.
- A room code ending in A, B, or C is marked as having AC and charging points.
- A source room name explicitly marked [AC] is also treated as AC and having charging points, even without an A/B/C suffix.
- Display labels include [AC] whenever the room is marked AC.
- A schedule slot is free only when the original source slot type is exactly 'free'.
- All 82 source 'sametime' entries contain scheduled class text. They are normalized to app-facing slot_type='class' and is_scheduled_free=false. The original value is preserved in source_slot_type for audit/debugging. They are NOT synthetic entries and are NOT marked free.
- The user confirmed the 14 Sep 2026 timetable snapshot is current.
- Labs and special-purpose rooms remain excluded from the regular student classroom dataset.

Implementation guidance:
- For the Free Rooms filter, select rows where is_scheduled_free === true for the chosen day and period. Do not infer availability from an empty-looking display label or slot_type alone.
- For rendering a schedule, use slot_type for canonical values (free, class, lab, lab-continue) and source_slot_type only when displaying original source diagnostics.
- Do not create fake timetable rows to patch real availability.

Remaining caveats:
- Facility and floor labels follow user-defined rules and have not been independently checked against physical campus conditions.
- Two class-typed inventory names containing 'Lab' (115A, 115B), a VFX/Recording room, and one timetable-only room '404 Epst. Lab AERO' remain excluded pending classification confirmation.
- No Ground Floor regular classroom was found in the selected inventory.
- Student accessibility data was not supplied and remains unknown.
This is cleaned staging data; excluded-room classification still needs confirmation, but the 82 sametime entries no longer block reliable app availability filtering.
