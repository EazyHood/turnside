# Turnside

Status: project-specific design direction chosen under the user's standing authorization.

Turnside is a small print workshop, not a dashboard. The composition follows the task:
edit a question, see its position on a sheet, turn the sheet, prepare a print run.
Warm paper, dark indigo ink and terracotta selection marks distinguish the work surface
from the printable output. The paper itself stays white and aligned; a corner mark is
a genuine orientation cue, not decoration. System sans-serif labels contrast with a
Georgia question face, so no external font request is needed.

UI tokens are centralized in style.css. Motion is limited to the chosen binding edge:
the whole sheet turns together, interrupted safely by the next state, with no cursor
effects. Reduced motion makes the state switch immediate. On small screens, the two
work areas stack and the editor remains fully usable.

The direction draws task-specific lessons from Jhona's accepted TALLER (editable work
and preview) and FORMA (measurements with a purpose), without reusing their layouts.
No telemetry, remote fonts, stock assets or AI-generated illustration is included.
