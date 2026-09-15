# ClaimAgent — Project Instructions

## Startup

Read this file first. Do **not** load the whole `.opencode-ai/` directory.

1. Identify the task type.
2. Read only the relevant Skill / domain document.
3. Read only the relevant AUN knowledge section when coding style guidance is needed.
4. Read the real source files needed for the task.
5. Do not reread files already available in the current context unless they may have changed.

`FOCUS.md` may be loaded globally by `opencode.json`. If it is already in context, do not read it again.

## Routing

### React

- API / Axios / React Query / NSwag → `skills/ssd-react-api/SKILL.md` + `knowledge/aun/05.md`
- Form / Formik / Zod / MUI Form → `skills/ssd-react-form/SKILL.md` + `knowledge/aun/04.md`
- Redux / state → `skills/ssd-react-state/SKILL.md` + `knowledge/aun/08.md`
- Component / dialog / props → `skills/ssd-react-component/SKILL.md` + `knowledge/aun/03.md`
- Table / DataTable → `knowledge/aun/06.md`
- Notification / Swal → `knowledge/aun/07.md`
- Date / enum / authorization → `knowledge/aun/08.md`
- Data-fetching page → `knowledge/aun/09.md`
- Commit / PR → `knowledge/aun/10.md`

### ClaimFund

- Refund → `skills/claimfund-refund/SKILL.md` and, only when current implementation/history is needed, `state/claimfund-refund.md`
- IncreaseLimitTransfer / AdditionalTransfer → `domain/ClaimFundAdditionalTransfer.md`
- BankStatus / Inquiry → `domain/ClaimFundInquiry.md`
- PayTransfer / Transfer/v1 / Setting / Notification → `domain/ClaimFundPayTransfer.md`
- ClaimFund APIGW `/api/ClaimFund/*` → `domain/ClaimFundApi.md`

## AUN knowledge

`AUN.md` is an index only. Do not read `knowledge/AUN.full.md` during normal work.

- General mindset / stack / global principles → `knowledge/aun/00-02.md`
- Component → `knowledge/aun/03.md`
- Form → `knowledge/aun/04.md`
- API → `knowledge/aun/05.md`
- Table → `knowledge/aun/06.md`
- Notification → `knowledge/aun/07.md`
- Date / enum / authorization → `knowledge/aun/08.md`
- Data-fetching page → `knowledge/aun/09.md`
- Commit / PR → `knowledge/aun/10.md`
- Do-not list / observed style → `knowledge/aun/11.md` / `knowledge/aun/12.md`

If several sections are clearly required, read only those sections.

## Source-of-truth rules

- Source of truth: `D:\source\repo\ClaimAgent\src\app\modules\...` via `read` / `edit`.
- Do not trust byte content resolved through bash/git when it conflicts with `read`.
- When editing, use the exact `oldString` returned by `read`.
- Typecheck with `npx tsc --noEmit`.
- Do not expand the scope of the requested change.

## Important

Rules are loaded on demand. Do not read every Skill, every ClaimFund document, or the full AUN just to understand the project.
