# Grammar Lessons Migration to Database

## Overview

The grammar lessons have been successfully migrated from markdown files to the MongoDB database while maintaining the markdown format for lesson content. This provides better scalability, management capabilities, and API endpoints to serve grammar lessons dynamically.

## Changes Made

### 1. New Database Model
**File:** [backend/models/grammarLessonModel.js](backend/models/grammarLessonModel.js)

Created a new MongoDB schema for grammar lessons with the following fields:
- `title` (String, required): The lesson title
- `order` (Number, required, unique): Display order for lessons
- `content` (String, required): The full lesson content in markdown format
- `slug` (String, required, unique): URL-friendly identifier
- `timestamps`: Automatically tracks creation and update times

### 2. Migration Script
**File:** [backend/scripts/migrate-grammar.js](backend/scripts/migrate-grammar.js)

A one-time migration script that:
- Reads all markdown files from `/backend/grammar/` directory
- Extracts the lesson title from the filename and first heading
- Creates a URL-friendly slug from the filename
- Imports lessons into MongoDB in order
- Can be run again to update existing lessons

**Usage:**
```bash
cd backend
node scripts/migrate-grammar.js
```

### 3. Grammar Controller
**File:** [backend/controllers/grammarController.js](backend/controllers/grammarController.js)

Implements the following endpoints:
- `getAllLessons()` - Get all grammar lessons ordered by lesson number
- `getLessonById()` - Get a specific lesson by MongoDB ID
- `getLessonBySlug()` - Get a lesson by its slug (human-readable identifier)
- `createLesson()` - Create a new grammar lesson (admin only)
- `updateLesson()` - Update an existing lesson (admin only)
- `deleteLesson()` - Delete a lesson (admin only)

### 4. API Endpoints
**File:** [backend/server.js](backend/server.js)

Updated the Express server with new database-backed grammar endpoints:

#### Public Endpoints (No Authentication Required)
- `GET /api/grammar` - Get all grammar lessons
  - Returns: Array of all lessons sorted by order
  
- `GET /api/grammar/:id` - Get a lesson by MongoDB ID
  - Returns: Single lesson object
  
- `GET /api/grammar/slug/:slug` - Get a lesson by slug
  - Returns: Single lesson object
  - Example: `/api/grammar/slug/personal_pronouns`

#### Admin-Only Endpoints
- `POST /api/grammar` - Create a new lesson (requires admin authentication)
- `PUT /api/grammar/:id` - Update a lesson (requires admin authentication)
- `DELETE /api/grammar/:id` - Delete a lesson (requires admin authentication)

## Data Structure

Each grammar lesson in the database contains:

```json
{
  "id": "6970592a4ad1a301d3c7185c",
  "title": "Personal Pronouns",
  "order": 1,
  "slug": "personal_pronouns",
  "content": "# Personal Pronouns\n\n... full markdown content ...",
  "createdAt": "2026-01-21T04:42:18.974Z",
  "updatedAt": "2026-01-21T04:42:18.974Z"
}
```

## Migration Results

Successfully imported 3 grammar lessons:
1. Personal Pronouns (`personal_pronouns`)
2. Possessive Adjectives and Pronouns (`possessive_adjectives_pronouns`)
3. Present Simple (`present_simple`)

All lessons maintain their original markdown content and formatting.

## Benefits

1. **Dynamic Content**: Lessons can now be updated via API without modifying files
2. **Better Management**: Admin interface can manage lessons through the API
3. **Scalability**: Easier to add new lessons, reorder, or manage access
4. **Consistency**: Single source of truth in the database
5. **Backwards Compatibility**: Content is still in markdown format for easy display

## Frontend Usage

The frontend can continue using the markdown format by simply rendering the content field:

```javascript
// Example: Fetching a lesson
const response = await fetch('/api/grammar/slug/personal_pronouns');
const lesson = await response.json();

// lesson.content contains the full markdown text
// Use a markdown renderer to display it
```

## Future Enhancements

Potential improvements:
- Add difficulty levels to lessons
- Track student progress through lessons
- Add tags/categories for better organization
- Implement lesson versioning
- Add quiz questions linked to specific lessons
