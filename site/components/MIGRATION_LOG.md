# Component Migration Log

**Date:** 2026-04-12  
**Purpose:** Reorganize flat `components/` directory into type-organized subdirectory structure.

## Summary

Moved 41 components from flat `site/components/` into typed subdirectories. Deleted 1 dead file. Updated all import paths. TypeScript check: 0 errors.

## File Moves

### ui/ (9 files)
- AutoRefresh.tsx
- Breadcrumb.tsx
- EmptyState.tsx
- FilterTabs.tsx
- MarkdownRenderer.tsx
- NavigationProgress.tsx
- RecentContent.tsx
- StatBadge.tsx
- TagPill.tsx

### layout/ (5 files)
- Header.tsx
- PageHeader.tsx
- PagePathStatic.tsx
- Sidebar.tsx
- ThemeProvider.tsx

Note: `PagePath.tsx` was listed in the mapping but did not exist in the repo. Skipped.

### data/ (3 files)
- GroupedTagDropdown.tsx
- PropertyDropdown.tsx
- SiteTable.tsx

### features/tasks/ (9 files)
- HomeTasksWidget.tsx
- HomeTasksWidgetClient.tsx
- TaskContextMenu.tsx
- TaskCreateModal.tsx
- TaskDetailPanel.tsx
- TaskLabelPickerPopover.tsx
- TasksClient.tsx
- TasksPreview.tsx
- TodoistQuickAdd.tsx

### features/search/ (1 file)
- GlobalSearch.tsx

### features/notes/ (3 files)
- LabelPageContent.tsx
- NotesClient.tsx
- NotesFilter.tsx

### features/learning/ (3 files)
- HighlightActions.tsx
- LearningClient.tsx
- LearningHighlightsClient.tsx

### features/editors/ (4 files)
- ContentEditor.tsx
- DueDatePicker.tsx
- InlineBodyEditor.tsx
- InlineFrontmatterEditor.tsx

### features/content/ (3 files)
- ContentDetailPage.tsx
- DocsClient.tsx
- SubDocsPanel.tsx

### features/travel/ (1 file)
- TravelClient.tsx

## Deleted Files
- `DataTable.tsx` — confirmed zero importers, removed with `git rm`

## Unmapped Files (left in place)
These two files were not in the migration spec and remain at `components/` root:
- `MedicalEventsTable.tsx` — used in `app/(protected)/self/health/health-care/page.tsx`
- `SectionNavGrid.tsx` — used in `app/(protected)/personal/page.tsx` and `app/(protected)/work/page.tsx`

Their imports are still valid since the files weren't moved.

## Verification

Post-migration grep for old flat import patterns:
```
grep -r '"@/components/[A-Z]' site --include="*.tsx" --include="*.ts" | grep -v node_modules
```

Result: 3 matches — all for unmapped files (`MedicalEventsTable`, `SectionNavGrid`) that remain at root. Zero broken imports.

TypeScript check: `npx tsc --noEmit` → **exit code 0, no errors**.
