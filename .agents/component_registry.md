# Component Registry

## ui (atoms)
- **Button / buttonVariants:** src/components/ui/button.tsx
- **Input:** src/components/ui/input.tsx
- **Field (label, `*`, inline error, hint):** src/components/ui/field.tsx
- **Textarea (500 cap + live counter):** src/components/ui/textarea.tsx
- **PasswordStrength:** src/components/ui/password-strength.tsx
- **Card / Badge / Skeleton / Spinner:** src/components/ui/{card,badge,skeleton,spinner}.tsx

## shared (molecules)
- **Providers (theme, TanStack Query, Toaster):** src/components/shared/providers.tsx
- **SiteHeader / SiteFooter / ThemeToggle / OfflineBanner:** src/components/shared/
- **SearchBar (GET form + suggestions):** src/components/shared/search-bar.tsx
- **PaperCard / PaperList / PaperListSkeleton:** src/components/shared/paper-card.tsx, paper-list.tsx
- **Pagination (link based):** src/components/shared/pagination.tsx
- **Breadcrumbs (+JSON-LD) / JsonLdScript:** src/components/shared/breadcrumbs.tsx, json-ld.tsx
- **FaqAccordion (`<details>`):** src/components/shared/faq-accordion.tsx
- **EmptyState:** src/components/shared/empty-state.tsx
- **AuthCard / LoginForm / SignupForm / ForgotPasswordForm:** auth-card.tsx, auth-forms.tsx
- **TakedownForm:** src/components/shared/takedown-form.tsx
- **ProsePage (legal/static pages):** src/components/shared/prose-page.tsx

- **UserMenu / SignOutButton / DevLoginForm:** src/components/shared/{user-menu,sign-out-button,dev-login-form}.tsx
- **BookmarkButton / ReportDialog / PdfPreview:** src/components/shared/{bookmark-button,report-dialog,pdf-preview}.tsx
- **UploadForm / ContactForm:** src/components/shared/{upload-form,contact-form}.tsx

## admin (src/components/admin)
- **AdminNav, NoPermission, DataTable, StatCard, BarChart, StatusBadge, PageHeader, SearchForm, Select:** admin-nav.tsx, no-permission.tsx, data-table.tsx, ui.tsx
- **AdminAction (button -> API -> toast -> refresh):** admin-action.tsx
- **ReviewEditor, SourceCard, NewSourceForm, SettingsForm, UserControls, content-editors:** matching files

## Not built yet
YearTabs, AdSlot.
