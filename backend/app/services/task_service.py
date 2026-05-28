"""Generate a domain checklist (Tasks) derived from extracted deadlines.

Tasks are grouped like the domain: Contract & Deadlines, Title, Loan &
Appraisal, Inspection, Owners Association, Closing. Each task is seeded from
contract deadlines with reasonable initial states (COMPLETED -> done, etc.).
"""
from __future__ import annotations

from sqlmodel import Session, select

from app.models import Task, TaskState
from app.schemas import TaskGroupOut, TaskOut
from app.services.extraction_service import ExtractedDeadline, ExtractionResult

# Map deadline category -> checklist group.
_CATEGORY_GROUP = {
    "General": "Contract & Deadlines",
    "Title": "Title",
    "Seller Disclosures": "Contract & Deadlines",
    "Loan and Credit": "Loan & Appraisal",
    "Appraisal": "Loan & Appraisal",
    "Survey": "Title",
    "Inspection and Due Diligence": "Inspection",
    "Owners Association": "Owners Association",
    "Closing and Possession": "Closing",
}

_GROUP_ORDER = [
    "Contract & Deadlines",
    "Title",
    "Loan & Appraisal",
    "Inspection",
    "Owners Association",
    "Closing",
]


def _initial_state(dl: ExtractedDeadline) -> TaskState:
    if dl.raw_value.upper() == "COMPLETED":
        return TaskState.done
    return TaskState.todo


def _due_label(dl: ExtractedDeadline) -> str:
    if dl.date is not None:
        return dl.date.strftime("%b %d")
    return dl.raw_value


def build_tasks(session: Session, transaction_id: str, result: ExtractionResult) -> list[Task]:
    rows: list[Task] = []
    for dl in result.deadlines:
        group = _CATEGORY_GROUP.get(dl.category or "", "Contract & Deadlines")
        ai_note = None
        if dl.is_urgent:
            ai_note = "Flagged urgent — nearest critical deadline."
        elif dl.raw_value.upper() == "COMPLETED":
            ai_note = "AI: marked COMPLETED in contract."
        task = Task(
            transaction_id=transaction_id,
            group=group,
            title=dl.event,
            due=_due_label(dl),
            state=_initial_state(dl),
            ai_note=ai_note,
            is_post_close=False,
        )
        session.add(task)
        rows.append(task)
    return rows


def list_tasks(session: Session, transaction_id: str) -> list[Task]:
    stmt = select(Task).where(Task.transaction_id == transaction_id)
    return list(session.exec(stmt))


def grouped_tasks(tasks: list[Task]) -> list[TaskGroupOut]:
    groups: dict[str, list[TaskOut]] = {}
    for t in tasks:
        groups.setdefault(t.group, []).append(TaskOut.model_validate(t))
    ordered: list[TaskGroupOut] = []
    # Known groups first in domain order, then any extras.
    for name in _GROUP_ORDER:
        if name in groups:
            ordered.append(TaskGroupOut(group=name, items=groups.pop(name)))
    for name, items in groups.items():
        ordered.append(TaskGroupOut(group=name, items=items))
    return ordered
