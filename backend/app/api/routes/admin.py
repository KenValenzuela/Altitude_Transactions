"""Admin-only org settings: checklist templates and contact roles.

Core rows are protected: templates can be deactivated but not deleted; core
contact roles cannot be removed. Changes affect future transactions only.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.api.deps import AuthContext, require_admin
from app.db.session import get_session
from app.models import ContactRole, DocumentType, DocumentTypeTemplate
from app.schemas import ContactRoleCreate, ContactRoleOut, TemplateCreate, TemplateOut, TemplatePatch
from app.services.audit import record as audit
from app.services.checklist import SECTION_LABELS

router = APIRouter(prefix="/admin", tags=["admin"])


def _template_out(t: DocumentTypeTemplate) -> TemplateOut:
    return TemplateOut(
        id=t.id,
        name=t.name,
        section=t.section,
        sort_order=t.sort_order,
        required=t.required,
        is_core=t.is_core,
        active=t.active,
        document_type=t.document_type.value if t.document_type else None,
    )


@router.get("/templates", response_model=list[TemplateOut])
def list_templates(
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> list[TemplateOut]:
    templates = session.exec(
        select(DocumentTypeTemplate)
        .where(DocumentTypeTemplate.organization_id == ctx.organization_id)
        .order_by(DocumentTypeTemplate.sort_order)  # type: ignore[arg-type]
    ).all()
    return [_template_out(t) for t in templates]


@router.post("/templates", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    body: TemplateCreate,
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> TemplateOut:
    if body.section not in SECTION_LABELS:
        raise HTTPException(422, f"Unknown section '{body.section}'")
    doc_type: DocumentType | None = None
    if body.document_type:
        try:
            doc_type = DocumentType(body.document_type)
        except ValueError:
            raise HTTPException(422, f"Invalid document_type '{body.document_type}'")

    max_order = session.exec(
        select(func.max(DocumentTypeTemplate.sort_order)).where(
            DocumentTypeTemplate.organization_id == ctx.organization_id
        )
    ).one()
    template = DocumentTypeTemplate(
        organization_id=ctx.organization_id,
        name=body.name,
        section=body.section,
        sort_order=(max_order or 0) + 1,
        required=body.required,
        is_core=False,
        document_type=doc_type,
    )
    session.add(template)
    audit(
        session,
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        event_type="template_created",
        entity_type="document_type_template",
        entity_id=template.id,
        new_value=template.name,
    )
    session.commit()
    session.refresh(template)
    return _template_out(template)


@router.patch("/templates/{template_id}", response_model=TemplateOut)
def patch_template(
    template_id: str,
    body: TemplatePatch,
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> TemplateOut:
    template = session.get(DocumentTypeTemplate, template_id)
    if template is None or template.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template not found")
    if body.section is not None and body.section not in SECTION_LABELS:
        raise HTTPException(422, f"Unknown section '{body.section}'")

    old = template.name
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(template, key, value)
    session.add(template)
    audit(
        session,
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        event_type="template_updated",
        entity_type="document_type_template",
        entity_id=template.id,
        old_value=old,
        new_value=template.name,
    )
    session.commit()
    session.refresh(template)
    return _template_out(template)


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: str,
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> None:
    template = session.get(DocumentTypeTemplate, template_id)
    if template is None or template.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template not found")
    if template.is_core:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Core templates cannot be deleted; deactivate instead",
        )
    audit(
        session,
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        event_type="template_deleted",
        entity_type="document_type_template",
        entity_id=template.id,
        old_value=template.name,
    )
    session.delete(template)
    session.commit()


# ─── Contact roles ────────────────────────────────────────────────────────────

@router.get("/contact-roles", response_model=list[ContactRoleOut])
def list_contact_roles(
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> list[ContactRoleOut]:
    roles = session.exec(
        select(ContactRole)
        .where(ContactRole.organization_id == ctx.organization_id)
        .order_by(ContactRole.sort_order)  # type: ignore[arg-type]
    ).all()
    return [ContactRoleOut.model_validate(r) for r in roles]


@router.post("/contact-roles", response_model=ContactRoleOut, status_code=status.HTTP_201_CREATED)
def create_contact_role(
    body: ContactRoleCreate,
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> ContactRoleOut:
    existing = session.exec(
        select(ContactRole).where(
            ContactRole.organization_id == ctx.organization_id, ContactRole.key == body.key
        )
    ).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Contact role '{body.key}' already exists")

    max_order = session.exec(
        select(func.max(ContactRole.sort_order)).where(
            ContactRole.organization_id == ctx.organization_id
        )
    ).one()
    role = ContactRole(
        organization_id=ctx.organization_id,
        key=body.key,
        label=body.label,
        is_core=False,
        sort_order=(max_order or 0) + 1,
    )
    session.add(role)
    audit(
        session,
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        event_type="contact_role_created",
        entity_type="contact_role",
        entity_id=role.id,
        new_value=role.label,
    )
    session.commit()
    session.refresh(role)
    return ContactRoleOut.model_validate(role)


@router.delete("/contact-roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_role(
    role_id: str,
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> None:
    role = session.get(ContactRole, role_id)
    if role is None or role.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact role not found")
    if role.is_core:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Core contact roles cannot be deleted")
    audit(
        session,
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        event_type="contact_role_deleted",
        entity_type="contact_role",
        entity_id=role.id,
        old_value=role.label,
    )
    session.delete(role)
    session.commit()
