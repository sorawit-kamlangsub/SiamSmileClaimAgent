# Survey

`แบบประเมินความพึงพอใจ` — post-service customer satisfaction survey (rating + suggestions +
remarks), reached via an SMS link after a payment/transfer, followed by a thank-you summary
screen. **Real API**, but via its own local API file, not the shared layer. **Public route**
(no auth) — see [`_auth.md`](_auth.md#public-routes) for what "public" means here. Routes:
`/survey`, `/survey/:id`, `/survey/summary/:id` under `LayoutPublic` — see [routes.md](../routes.md).

## pages/

- `SurveyPage.tsx` — full-screen fixed background, locks body scroll on non-mobile; renders
  `HeaderSurvey` + `HeaderDetailSurveyBox` (the actual form)
- `SurveySummaryPage.tsx` — post-submit thank-you page; reads `id` from route, calls
  `useGetPaymentDetails(id)` directly, links to `/slip/${id}` (→ `TransferSlips`)

## components/

- `HeaderSurvey.tsx` — static logo/title
- `HeaderDetailSurveyBox.tsx` — main container: `useSurveyHook()`, renders employee card,
  `SurveyQuestions`, payment detail card (`HeaderDetailBox`), customer card; `Backdrop` while any
  of 3 API calls loading
- `HeaderDetailBox.tsx` — reusable payment summary card, **also used directly by `SurveySummaryPage`**
- `Summary/HeaderSummary.tsx` — static "ขอบคุณ" header for the summary page
- `SurveyQuestions.tsx` — rating `ToggleButtonGroup` (`answerId` 54–58 mapped to Thai
  labels/colors/icons, "ควรปรับปรุง"→"ดีมาก"), conditional suggestion checkboxes when rating is
  low (54/55), remarks field, submit — **hardcoded `answerId` magic numbers**

## hooks/

`useSurvey.hook.tsx` — orchestrates: fetch/create survey id (`useGetSurveyId`), fetch questions
(`useGetSurveyQuestion`), fetch payment/transaction (`useGetPayTransferTransactionId`,
`useGetPaymentDetails`), submit (`useSaveSurvey`), link survey id back to the SMS transaction
(`useUpdateSurveyId`); auto-navigates to summary if already submitted; builds the 3-answer
payload via array-index assumptions (`getAnswer?.[0/1/2]`).

## `surveyAPI.ts` (module root, not under `hooks/`) — own local API file

Plain axios + react-query hitting `API_CLAIM_FUND_URL`/`API_SURVEY_URL` directly (**not**
`src/app/api/claimFundApi.ts`, which has different hooks e.g. `useCreatePayment`):
`useGetPayTransferTransactionId`, `useGetSurveyId`, `useGetSurveyQuestion`, `useSaveSurvey`,
`useUpdateSurveyId`, `useGetPaymentDetails`.

**⚠ Cross-module dependency**: `useGetPaymentDetails` is reused by both `SurveySummaryPage.tsx`
and `TransferSlips/hooks/useGetPaymentData.tsx` — see [TransferSlips.md](TransferSlips.md).

## store/ — none

## API hooks called — none from `src/app/api/*`

Duplicate-pattern local API file instead (see above).

## Gotchas

`getPaymentDetailsKey` (react-query key) is **not parameterized by `ref`/`id`** — cache can go
stale/collide across different ids, affecting both this module and `TransferSlips`. Survey
question index-based lookups are fragile if the backend reorders/adds questions.
