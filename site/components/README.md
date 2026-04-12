# Components

Type-organized component library for niklaude.com.

## Which component do I use?

**SiteTable** (`data/SiteTable`) — data with 3+ comparable columns that benefits from tabular alignment (medical events, housing costs, chakras, timelines). Use when column headers add meaning.

**ContentList** (`data/ContentList`) — card-style or single-column lists with filter tabs, search, and grouping (notes, docs, logs, meetings). Use when each item is a titled row, not a grid of values.

For items that need custom layout (LearningClient's book grid, TravelClient's Upcoming/Past sections) — keep them as bespoke components. ContentList is not a universal list primitive.

## Directories

| Dir | Contents |
|-----|----------|
| `ui/` | Primitives: TagPill, EmptyState, StatBadge, FilterTabs, Breadcrumb, MarkdownRenderer |
| `layout/` | PageShell, Header, Sidebar, PageHeader, PagePath, ThemeProvider |
| `data/` | SiteTable, ContentList, GroupedTagDropdown, PropertyDropdown |
| `features/tasks/` | TaskList, TaskRow, TaskFilters, TaskGroup, useTaskFilter, TaskDetailPanel, TaskContextMenu |
| `features/search/` | GlobalSearch (SearchInput, SearchResults, SearchFilters) |
| `features/notes/` | NotesClient, NotesFilter, LabelPageContent |
| `features/learning/` | LearningClient, LearningHighlightsClient, HighlightActions |
| `features/editors/` | ContentEditor, InlineBodyEditor, InlineFrontmatterEditor, DueDatePicker |
| `features/content/` | ContentDetailPage, DocsClient, SubDocsPanel |
| `features/travel/` | TravelClient |

## Migration status

Pages migrated to PageShell + canonical data components: track here as you go.
- [ ] (migrate pages here as you touch them)
