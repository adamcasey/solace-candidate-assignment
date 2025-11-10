## Additional Improvements

### DB

- Split `specialties` out into separate tables for data integrity and analytics. (`specialties` and `advocate_specialties`)
  - Prevents duplicate specialty data ("Oncology" vs "oncology"). This could also possibly be done with an ENUM of some kind considering there are less than 200 specialties in the U.S.
  - Enables easy aggregation
- Precompute a materialized view combining all searchable, denormalized fields.
  - API can query this directly for faster lookups with stable ranking.
    Refresh the view periodically depending on how often advocates are added
- Add additional indexes, either composite or partial, if we find out people are searching by things like `city` and `years experience`

### API

- Add cursor-based pagination for consistent results across pages.
  - Offset-based pagination (`?page=2&limit=20`) can miss or duplicate results if data changes between requests.
  - Cursor approach uses last record's ID/timestamp: `?cursor=abc123&limit=20`
  - More complex but prevents pagination drift and scales better for large datasets
- Implement response caching with ETags and conditional requests.
  - Return `ETag` header with hash of response data
  - Accept `If-None-Match` header on subsequent requests
  - Return `304 Not Modified` when data hasn't changed, saving bandwidth and processing
  - Particularly valuable for search results that don't change frequently

### UI/UX

- Add caching through `react-query` or built in `useMemo` and `useCallback` hooks if components are noticeably rerendering too often
- Prefer CSS modules over inline-styling and Tailwind utility classes
- Responsive breakpoints not yet implemented
- Pagination needed for large result sets
- Loading states for async operations
- Add nested routes/views to highlight an advocate profile when clicked
- Dark mode support via existing CSS variables
- Better error handling with user-facing error messages
  - Add error state to display network/API errors in UI instead of just console.error
  - Consider toast notifications (react-hot-toast, sonner) for transient errors
  - Add response.ok validation before parsing JSON

### Testing, CI/CD

- Add true e2e testing for better coverage
- Use environment variables with defaults (${VAR:-default})
- Version pinning (postgres:16-alpine)
- Healthcheck for service readiness
- `unless-stopped` restart policy (better for development)
- Explicit network definition for multi-service achitecturing

### General

- Add npm scripts for common tasks
- Make sure sensitive data, like passwords, are encrypted
