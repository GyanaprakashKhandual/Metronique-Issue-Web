# Issue - Bug Tracking Application

**Developed by Medtronic**

## Overview

Issue is an enterprise-grade bug tracking and project management platform designed for modern development teams. Built with scalability and flexibility in mind, Issue provides infinite hierarchical structures for organizing projects, teams, and work items.

---

## Tech Stack

### Backend Infrastructure
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB
- **Language:** JavaScript

### Core Dependencies
- **Development:** Nodemon
- **Authentication:** Google OAuth 2.0
- **Email Service:** Nodemailer with SMTP
- **Payment Processing:** Stripe
- **AI Integration:** Anthropic Claude & OpenAI

---

## Data Models

### Core Entities
| Model | Description |
|-------|-------------|
| **User** | Application users with authentication and profile management |
| **Organization** | Top-level entity representing companies |
| **Department** | Organizational divisions (supports infinite nesting) |
| **Team** | Collaborative groups within departments (supports infinite nesting) |
| **Project** | Work containers (supports infinite nesting) |
| **Page** | Documentation and content pages (supports infinite nesting) |
| **Sprint** | Time-boxed iterations (supports infinite nesting) |
| **Folder** | File organization containers (supports infinite nesting) |

### Work Item Models
| Model | Description |
|-------|-------------|
| **Bug** | Defect tracking items |
| **Requirement** | Feature and requirement specifications |
| **Issue** | General work items and tasks |

### Collaboration Models
| Model | Description |
|-------|-------------|
| **Message** | Internal communication system |
| **Notification** | Real-time alerts and updates |
| **Invite** | Team and project invitation management |

### Document Models
| Model | Description |
|-------|-------------|
| **Doc** | Rich text documents |
| **Sheet** | Spreadsheet data |
| **Slide** | Presentation files |

### System Models
| Model | Description |
|-------|-------------|
| **Access Control** | Permission and role management |
| **Activity Log** | Audit trail and user actions |
| **Mail Log** | Email delivery tracking |
| **Upload** | File storage and management |
| **MFA** | Multi-factor authentication |
| **Trash** | Soft delete and recovery system |

---

## Project Hierarchy

### Organizational Structure

```
User
└── Organization (infinite sub-organizations)
    └── Department (infinite sub-departments)
        └── Team (infinite sub-teams)
            └── Project (infinite sub-projects)
                ├── Page (infinite sub-pages)
                ├── Sprint (infinite sub-sprints)
                └── Folder (infinite sub-folders)
```

### Cross-Entity Relationships

#### Multi-Container Support
Projects, Pages, Sprints, and Folders support multiple child entities:

- **Project** can contain:
  - Multiple Sub-Projects
  - Multiple Pages
  - Multiple Sprints
  - Multiple Folders
  - Documents (Doc, Sheet, Slide)
  - Work Items (Bug, Requirement, Issue)

- **Page** can contain:
  - Multiple Sub-Pages
  - Multiple Sprints
  - Multiple Folders
  - Documents (Doc, Sheet, Slide)

- **Sprint** can contain:
  - Multiple Sub-Sprints
  - Multiple Projects
  - Multiple Folders
  - Work Items (Bug, Requirement, Issue)

- **Folder** can contain:
  - Infinite Sub-Folders
  - Documents (Doc, Sheet, Slide)
  - Work Items (Bug, Requirement, Issue)

### Document Placement Rules

**Documents (Doc, Sheet, Slide)** can be added to:
- Organization & Sub-Organizations
- Department & Sub-Departments
- Team & Sub-Teams
- Project & Sub-Projects
- Page & Sub-Pages
- Sprint & Sub-Sprints
- Folder & Sub-Folders

### Work Item Placement Rules

**Work Items (Bug, Requirement, Issue)** can only be added to:
- Project & Sub-Projects
- Page & Sub-Pages
- Sprint & Sub-Sprints
- Folder & Sub-Folders

---

## Key Features

### Infinite Nesting Architecture
Inspired by Postman's folder structure, Issue supports unlimited depth for all hierarchical entities, providing ultimate flexibility in organizing complex projects.

### Multi-Parent Relationships
Entities can belong to multiple containers simultaneously, enabling cross-functional collaboration and flexible project organization.

### Universal Document Management
Documents can be attached at any organizational level, from company-wide policies to sprint-specific notes.

### Scoped Work Item Tracking
Bugs, requirements, and issues are scoped to execution contexts (projects, pages, sprints, folders) ensuring focused tracking.

---

## Security & Access

- **OAuth 2.0:** Google authentication integration
- **Multi-Factor Authentication:** Enhanced account security
- **Granular Access Control:** Role-based permissions at every hierarchy level
- **Activity Logging:** Complete audit trail of all system actions

---

## Getting Started

Refer to the following documentation sections:
- **Installation Guide:** Setup and configuration
- **API Documentation:** Endpoint references
- **Model Schemas:** Database structure details
- **Authentication:** OAuth and MFA setup
- **Deployment:** Production deployment guide

---

# Issue - Complete Hierarchy Structure

## Primary Organizational Hierarchy

```
User (Root)
└── Organization
    ├── Sub-Organization (infinite levels)
    ├── Department
    │   ├── Sub-Department (infinite levels)
    │   └── Team
    │       ├── Sub-Team (infinite levels)
    │       └── Project
    │           ├── Sub-Project (infinite levels)
    │           ├── Page
    │           │   ├── Sub-Page (infinite levels)
    │           │   ├── Sprint (can contain)
    │           │   │   └── Sub-Sprint (infinite levels)
    │           │   └── Folder (can contain)
    │           │       └── Sub-Folder (infinite levels)
    │           ├── Sprint
    │           │   ├── Sub-Sprint (infinite levels)
    │           │   ├── Project (can contain)
    │           │   │   └── Sub-Project (infinite levels)
    │           │   └── Folder (can contain)
    │           │       └── Sub-Folder (infinite levels)
    │           └── Folder
    │               └── Sub-Folder (infinite levels)
    └── Documents (can be added at any level)
        ├── Doc
        ├── Sheet
        └── Slide
```

---

## Multi-Container Relationships

### Project Container
```
Project
├── Sub-Project (infinite levels)
├── Page (multiple)
│   └── Sub-Page (infinite levels)
├── Sprint (multiple)
│   └── Sub-Sprint (infinite levels)
├── Folder (multiple)
│   └── Sub-Folder (infinite levels)
├── Documents (multiple)
│   ├── Doc
│   ├── Sheet
│   └── Slide
└── Work Items (multiple)
    ├── Bug
    ├── Requirement
    └── Issue
```

### Page Container
```
Page
├── Sub-Page (infinite levels)
├── Sprint (multiple)
│   └── Sub-Sprint (infinite levels)
├── Folder (multiple)
│   └── Sub-Folder (infinite levels)
└── Documents (multiple)
    ├── Doc
    ├── Sheet
    └── Slide
```

### Sprint Container
```
Sprint
├── Sub-Sprint (infinite levels)
├── Project (multiple)
│   └── Sub-Project (infinite levels)
├── Folder (multiple)
│   └── Sub-Folder (infinite levels)
└── Work Items (multiple)
    ├── Bug
    ├── Requirement
    └── Issue
```

### Folder Container
```
Folder
├── Sub-Folder (infinite levels)
├── Documents (multiple)
│   ├── Doc
│   ├── Sheet
│   └── Slide
└── Work Items (multiple)
    ├── Bug
    ├── Requirement
    └── Issue
```

---

## Document Placement Matrix

Documents (Doc, Sheet, Slide) can be added to:

```
✓ Organization / Sub-Organization
✓ Department / Sub-Department
✓ Team / Sub-Team
✓ Project / Sub-Project
✓ Page / Sub-Page
✓ Sprint / Sub-Sprint
✓ Folder / Sub-Folder
```

---

## Work Item Placement Matrix

Work Items (Bug, Requirement, Issue) can ONLY be added to:

```
✓ Project / Sub-Project
✓ Page / Sub-Page
✓ Sprint / Sub-Sprint
✓ Folder / Sub-Folder

✗ Organization
✗ Department
✗ Team
```

---

## Complete Entity Tree with All Possibilities

```
User
└── Organization
    ├── Sub-Organization (∞)
    ├── Department
    │   ├── Sub-Department (∞)
    │   │   ├── Team
    │   │   │   ├── Sub-Team (∞)
    │   │   │   │   └── Project
    │   │   │   │       ├── Sub-Project (∞)
    │   │   │   │       ├── Page (multiple)
    │   │   │   │       │   ├── Sub-Page (∞)
    │   │   │   │       │   ├── Sprint (multiple)
    │   │   │   │       │   │   ├── Sub-Sprint (∞)
    │   │   │   │       │   │   ├── Folder (multiple)
    │   │   │   │       │   │   │   └── Sub-Folder (∞)
    │   │   │   │       │   │   ├── Bug (multiple)
    │   │   │   │       │   │   ├── Requirement (multiple)
    │   │   │   │       │   │   └── Issue (multiple)
    │   │   │   │       │   ├── Folder (multiple)
    │   │   │   │       │   │   ├── Sub-Folder (∞)
    │   │   │   │       │   │   ├── Doc (multiple)
    │   │   │   │       │   │   ├── Sheet (multiple)
    │   │   │   │       │   │   ├── Slide (multiple)
    │   │   │   │       │   │   ├── Bug (multiple)
    │   │   │   │       │   │   ├── Requirement (multiple)
    │   │   │   │       │   │   └── Issue (multiple)
    │   │   │   │       │   ├── Doc (multiple)
    │   │   │   │       │   ├── Sheet (multiple)
    │   │   │   │       │   └── Slide (multiple)
    │   │   │   │       ├── Sprint (multiple)
    │   │   │   │       │   ├── Sub-Sprint (∞)
    │   │   │   │       │   ├── Project (multiple)
    │   │   │   │       │   │   └── Sub-Project (∞)
    │   │   │   │       │   ├── Folder (multiple)
    │   │   │   │       │   │   ├── Sub-Folder (∞)
    │   │   │   │       │   │   ├── Doc (multiple)
    │   │   │   │       │   │   ├── Sheet (multiple)
    │   │   │   │       │   │   ├── Slide (multiple)
    │   │   │   │       │   │   ├── Bug (multiple)
    │   │   │   │       │   │   ├── Requirement (multiple)
    │   │   │   │       │   │   └── Issue (multiple)
    │   │   │   │       │   ├── Bug (multiple)
    │   │   │   │       │   ├── Requirement (multiple)
    │   │   │   │       │   └── Issue (multiple)
    │   │   │   │       ├── Folder (multiple)
    │   │   │   │       │   ├── Sub-Folder (∞)
    │   │   │   │       │   ├── Doc (multiple)
    │   │   │   │       │   ├── Sheet (multiple)
    │   │   │   │       │   ├── Slide (multiple)
    │   │   │   │       │   ├── Bug (multiple)
    │   │   │   │       │   ├── Requirement (multiple)
    │   │   │   │       │   └── Issue (multiple)
    │   │   │   │       ├── Doc (multiple)
    │   │   │   │       ├── Sheet (multiple)
    │   │   │   │       ├── Slide (multiple)
    │   │   │   │       ├── Bug (multiple)
    │   │   │   │       ├── Requirement (multiple)
    │   │   │   │       └── Issue (multiple)
    │   │   │   ├── Doc (multiple)
    │   │   │   ├── Sheet (multiple)
    │   │   │   └── Slide (multiple)
    │   │   ├── Doc (multiple)
    │   │   ├── Sheet (multiple)
    │   │   └── Slide (multiple)
    │   ├── Doc (multiple)
    │   ├── Sheet (multiple)
    │   └── Slide (multiple)
    ├── Doc (multiple)
    ├── Sheet (multiple)
    └── Slide (multiple)
```

---

## Key Concepts

### 1. Infinite Nesting (∞)
All major entities support unlimited depth:
- Organization → Sub-Organization → Sub-Sub-Organization...
- Department → Sub-Department → Sub-Sub-Department...
- Team → Sub-Team → Sub-Sub-Team...
- Project → Sub-Project → Sub-Sub-Project...
- Page → Sub-Page → Sub-Sub-Page...
- Sprint → Sub-Sprint → Sub-Sub-Sprint...
- Folder → Sub-Folder → Sub-Sub-Folder...

### 2. Multiple Children
Entities can have multiple children of the same type:
- Project can have 5 Pages, 10 Sprints, 20 Folders
- Page can have 3 Sprints, 15 Folders
- Sprint can have 8 Projects, 12 Folders

### 3. Cross-Container Flexibility
- Sprint can contain Projects (circular but controlled)
- Page can contain Sprints
- Folder is the universal container

### 4. Document Universality
Documents (Doc, Sheet, Slide) can exist at ANY level in the hierarchy.

### 5. Work Item Scope
Work Items (Bug, Requirement, Issue) are restricted to execution contexts only (Project, Page, Sprint, Folder).

---

## Legend

- `∞` = Infinite nesting levels supported
- `(multiple)` = Can have multiple instances
- `✓` = Allowed
- `✗` = Not allowed

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Documentation:** https://docs.issue.medtronic.com