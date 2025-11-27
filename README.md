# Backend Folder Structure - Project Management & Bug Tracking System

```
backend/
│
├── src/
│   ├── config/
│   │   ├── database.js           # MongoDB/Database connection configuration
│   │   ├── env.js                # Environment variables setup
│   │   ├── jwt.js                # JWT configuration
│   │   ├── oauth.js              # OAuth (Google, GitHub) configuration
│   │   ├── email.js              # Email service configuration (SMTP)
│   │   └── multer.js             # File upload configuration
│   │
│   ├── models/                   # Mongoose/Database Schemas
│   │   ├── User.js               # User schema with roles, MFA settings
│   │   ├── Organization.js       # Organization schema with admin hierarchy
│   │   ├── Department.js         # Department schema
│   │   ├── Team.js               # Team schema
│   │   ├── Project.js            # Project schema
│   │   ├── Phase.js              # Phase schema
│   │   ├── Sprint.js             # Sprint schema
│   │   ├── Folder.js             # Folder schema (parent: project/page/sprint)
│   │   ├── Document.js           # Document schema
│   │   ├── Sheet.js              # Sheet schema (structured data)
│   │   ├── Slide.js              # Slide schema (presentation data)
│   │   ├── Bug.js                # Bug/Issue schema with severity, status
│   │   ├── Requirement.js        # Requirement tracking schema
│   │   ├── AccessControl.js      # Access control permissions (view/edit/admin)
│   │   ├── Invite.js             # Invite tokens and tracking
│   │   ├── Notification.js       # In-app notification schema
│   │   ├── MailLog.js            # Email notification log
│   │   ├── Trash.js              # Soft delete tracking
│   │   ├── Message.js            # Direct messaging schema
│   │   ├── ActivityLog.js        # Activity tracking for dashboard
│   │   └── MFASetup.js           # Multi-factor authentication setup
│   │
│   ├── routes/
│   │   ├── auth/
│   │   │   ├── auth.routes.js    # Register, login, OAuth
│   │   │   ├── mfa.routes.js     # MFA setup and verification
│   │   │   └── password.routes.js # Password reset and recovery
│   │   │
│   │   ├── users/
│   │   │   ├── user.routes.js    # User profile and settings
│   │   │   ├── userPreference.routes.js
│   │   │   └── userActivity.routes.js
│   │   │
│   │   ├── organization/
│   │   │   ├── organization.routes.js
│   │   │   ├── orgAdmin.routes.js
│   │   │   ├── orgMembers.routes.js
│   │   │   └── orgRoles.routes.js
│   │   │
│   │   ├── department/
│   │   │   ├── department.routes.js
│   │   │   ├── deptAdmin.routes.js
│   │   │   └── deptMembers.routes.js
│   │   │
│   │   ├── teams/
│   │   │   ├── team.routes.js
│   │   │   ├── teamAdmin.routes.js
│   │   │   └── teamMembers.routes.js
│   │   │
│   │   ├── projects/
│   │   │   ├── project.routes.js
│   │   │   ├── projectAccess.routes.js
│   │   │   └── projectMembers.routes.js
│   │   │
│   │   ├── phases/
│   │   │   └── phase.routes.js
│   │   │
│   │   ├── sprints/
│   │   │   ├── sprint.routes.js
│   │   │   └── sprintAccess.routes.js
│   │   │
│   │   ├── folders/
│   │   │   ├── folder.routes.js
│   │   │   └── folderAccess.routes.js
│   │   │
│   │   ├── documents/
│   │   │   ├── document.routes.js
│   │   │   └── documentCollaboration.routes.js
│   │   │
│   │   ├── sheets/
│   │   │   ├── sheet.routes.js
│   │   │   ├── sheetData.routes.js
│   │   │   └── sheetFormulas.routes.js
│   │   │
│   │   ├── slides/
│   │   │   ├── slide.routes.js
│   │   │   └── slideContent.routes.js
│   │   │
│   │   ├── bugs/
│   │   │   ├── bug.routes.js
│   │   │   ├── bugTracking.routes.js
│   │   │   ├── bugAssignment.routes.js
│   │   │   └── bugFilters.routes.js
│   │   │
│   │   ├── requirements/
│   │   │   ├── requirement.routes.js
│   │   │   ├── requirementTracking.routes.js
│   │   │   └── requirementStatus.routes.js
│   │   │
│   │   ├── accessControl/
│   │   │   ├── accessControl.routes.js
│   │   │   ├── permissions.routes.js
│   │   │   └── roleManagement.routes.js
│   │   │
│   │   ├── invites/
│   │   │   ├── invite.routes.js
│   │   │   ├── inviteTracking.routes.js
│   │   │   └── bulkInvite.routes.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── inAppNotification.routes.js
│   │   │   ├── emailNotification.routes.js
│   │   │   └── notificationPreference.routes.js
│   │   │
│   │   ├── messaging/
│   │   │   ├── message.routes.js
│   │   │   ├── directMessage.routes.js
│   │   │   └── groupMessage.routes.js
│   │   │
│   │   ├── trash/
│   │   │   └── trash.routes.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   └── reports.routes.js
│   │   │
│   │   ├── chatbot/
│   │   │   └── chatbot.routes.js
│   │   │
│   │   └── search/
│   │       └── search.routes.js
│   │
│   ├── controllers/
│   │   ├── auth/
│   │   │   ├── authController.js
│   │   │   ├── oauthController.js
│   │   │   ├── mfaController.js
│   │   │   └── passwordController.js
│   │   │
│   │   ├── users/
│   │   │   ├── userController.js
│   │   │   ├── userProfileController.js
│   │   │   └── userActivityController.js
│   │   │
│   │   ├── organization/
│   │   │   ├── organizationController.js
│   │   │   ├── orgAdminController.js
│   │   │   ├── orgMembersController.js
│   │   │   └── orgRolesController.js
│   │   │
│   │   ├── department/
│   │   │   ├── departmentController.js
│   │   │   ├── deptAdminController.js
│   │   │   └── deptMembersController.js
│   │   │
│   │   ├── teams/
│   │   │   ├── teamController.js
│   │   │   ├── teamAdminController.js
│   │   │   └── teamMembersController.js
│   │   │
│   │   ├── projects/
│   │   │   ├── projectController.js
│   │   │   ├── projectAccessController.js
│   │   │   └── projectMembersController.js
│   │   │
│   │   ├── phases/
│   │   │   └── phaseController.js
│   │   │
│   │   ├── sprints/
│   │   │   ├── sprintController.js
│   │   │   └── sprintAccessController.js
│   │   │
│   │   ├── folders/
│   │   │   ├── folderController.js
│   │   │   └── folderAccessController.js
│   │   │
│   │   ├── documents/
│   │   │   ├── documentController.js
│   │   │   ├── documentVersionController.js
│   │   │   └── documentCollaborationController.js
│   │   │
│   │   ├── sheets/
│   │   │   ├── sheetController.js
│   │   │   ├── sheetDataController.js
│   │   │   ├── sheetFormulaController.js
│   │   │   └── sheetCollaborationController.js
│   │   │
│   │   ├── slides/
│   │   │   ├── slideController.js
│   │   │   ├── slideContentController.js
│   │   │   └── slideCollaborationController.js
│   │   │
│   │   ├── bugs/
│   │   │   ├── bugController.js
│   │   │   ├── bugTrackingController.js
│   │   │   ├── bugAssignmentController.js
│   │   │   └── bugFiltersController.js
│   │   │
│   │   ├── requirements/
│   │   │   ├── requirementController.js
│   │   │   ├── requirementTrackingController.js
│   │   │   └── requirementStatusController.js
│   │   │
│   │   ├── accessControl/
│   │   │   ├── accessControlController.js
│   │   │   ├── permissionController.js
│   │   │   └── roleController.js
│   │   │
│   │   ├── invites/
│   │   │   ├── inviteController.js
│   │   │   ├── inviteTrackingController.js
│   │   │   └── bulkInviteController.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── inAppNotificationController.js
│   │   │   ├── emailNotificationController.js
│   │   │   └── notificationPreferenceController.js
│   │   │
│   │   ├── messaging/
│   │   │   ├── messageController.js
│   │   │   ├── directMessageController.js
│   │   │   └── groupMessageController.js
│   │   │
│   │   ├── trash/
│   │   │   └── trashController.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboardController.js
│   │   │   ├── analyticsController.js
│   │   │   └── reportsController.js
│   │   │
│   │   ├── chatbot/
│   │   │   └── chatbotController.js
│   │   │
│   │   └── search/
│   │       └── searchController.js
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── authService.js
│   │   │   ├── jwtService.js
│   │   │   ├── oauthService.js
│   │   │   ├── mfaService.js
│   │   │   └── passwordService.js
│   │   │
│   │   ├── users/
│   │   │   ├── userService.js
│   │   │   └── userProfileService.js
│   │   │
│   │   ├── organization/
│   │   │   ├── organizationService.js
│   │   │   └── orgRoleService.js
│   │   │
│   │   ├── department/
│   │   │   ├── departmentService.js
│   │   │   └── deptRoleService.js
│   │   │
│   │   ├── teams/
│   │   │   ├── teamService.js
│   │   │   └── teamRoleService.js
│   │   │
│   │   ├── projects/
│   │   │   ├── projectService.js
│   │   │   └── projectAccessService.js
│   │   │
│   │   ├── phases/
│   │   │   └── phaseService.js
│   │   │
│   │   ├── sprints/
│   │   │   └── sprintService.js
│   │   │
│   │   ├── folders/
│   │   │   └── folderService.js
│   │   │
│   │   ├── documents/
│   │   │   ├── documentService.js
│   │   │   ├── documentVersionService.js
│   │   │   └── documentCollaborationService.js
│   │   │
│   │   ├── sheets/
│   │   │   ├── sheetService.js
│   │   │   ├── sheetDataService.js
│   │   │   ├── sheetFormulaService.js
│   │   │   └── sheetCollaborationService.js
│   │   │
│   │   ├── slides/
│   │   │   ├── slideService.js
│   │   │   ├── slideContentService.js
│   │   │   └── slideCollaborationService.js
│   │   │
│   │   ├── bugs/
│   │   │   ├── bugService.js
│   │   │   ├── bugTrackingService.js
│   │   │   ├── bugAssignmentService.js
│   │   │   └── bugNotificationService.js
│   │   │
│   │   ├── requirements/
│   │   │   ├── requirementService.js
│   │   │   ├── requirementTrackingService.js
│   │   │   └── requirementNotificationService.js
│   │   │
│   │   ├── access/
│   │   │   ├── accessControlService.js
│   │   │   ├── permissionService.js
│   │   │   └── roleService.js
│   │   │
│   │   ├── invites/
│   │   │   ├── inviteService.js
│   │   │   ├── inviteTokenService.js
│   │   │   ├── accessInheritanceService.js
│   │   │   └── bulkInviteService.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── inAppNotificationService.js
│   │   │   ├── emailNotificationService.js
│   │   │   └── notificationPreferenceService.js
│   │   │
│   │   ├── messaging/
│   │   │   ├── messageService.js
│   │   │   ├── directMessageService.js
│   │   │   └── groupMessageService.js
│   │   │
│   │   ├── trash/
│   │   │   ├── trashService.js
│   │   │   └── softDeleteService.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboardService.js
│   │   │   ├── analyticsService.js
│   │   │   └── reportsService.js
│   │   │
│   │   ├── email/
│   │   │   ├── emailService.js
│   │   │   ├── emailTemplateService.js
│   │   │   └── emailQueueService.js
│   │   │
│   │   ├── file/
│   │   │   ├── fileUploadService.js
│   │   │   └── fileStorageService.js
│   │   │
│   │   ├── chatbot/
│   │   │   └── chatbotService.js
│   │   │
│   │   └── search/
│   │       └── searchService.js
│   │
│   ├── middleware/
│   │   ├── auth/
│   │   │   ├── authenticate.js      # JWT verification
│   │   │   ├── mfaVerify.js         # MFA verification middleware
│   │   │   ├── oauth.js             # OAuth callback handling
│   │   │   └── refreshToken.js
│   │   │
│   │   ├── authorization/
│   │   │   ├── authorize.js         # Role-based access control
│   │   │   ├── checkPermission.js   # Permission checking (view/edit/admin)
│   │   │   ├── projectAccess.js     # Project-level access checks
│   │   │   ├── inheritedAccess.js   # Automatic access inheritance
│   │   │   └── adminCheck.js        # Admin hierarchy checks
│   │   │
│   │   ├── validation/
│   │   │   ├── validateRequest.js
│   │   │   ├── sanitizeInput.js
│   │   │   └── validateSchema.js
│   │   │
│   │   ├── error/
│   │   │   ├── errorHandler.js
│   │   │   └── asyncHandler.js
│   │   │
│   │   ├── logging/
│   │   │   ├── requestLogger.js
│   │   │   ├── activityLogger.js
│   │   │   └── errorLogger.js
│   │   │
│   │   ├── rate/
│   │   │   └── rateLimiter.js
│   │   │
│   │   └── cors/
│   │       └── corsMiddleware.js
│   │
│   ├── utils/
│   │   ├── validators/
│   │   │   ├── emailValidator.js
│   │   │   ├── passwordValidator.js
│   │   │   ├── phoneValidator.js
│   │   │   └── dataValidator.js
│   │   │
│   │   ├── helpers/
│   │   │   ├── dateHelper.js
│   │   │   ├── stringHelper.js
│   │   │   ├── arrayHelper.js
│   │   │   └── objectHelper.js
│   │   │
│   │   ├── generators/
│   │   │   ├── tokenGenerator.js    # Generate unique tokens for invites
│   │   │   ├── idGenerator.js       # Generate unique IDs
│   │   │   └── codeGenerator.js     # Generate MFA codes
│   │   │
│   │   ├── encryption/
│   │   │   ├── encryptionUtil.js    # For sensitive data
│   │   │   ├── hashUtil.js          # Password hashing
│   │   │   └── jwtUtil.js           # JWT utilities
│   │   │
│   │   ├── constants/
│   │   │   ├── errorMessages.js
│   │   │   ├── successMessages.js
│   │   │   ├── httpStatus.js
│   │   │   ├── roles.js             # User roles (SuperAdmin, Admin, User)
│   │   │   ├── permissions.js       # Permission levels (view/edit/admin)
│   │   │   ├── bugStatus.js         # Bug statuses
│   │   │   ├── bugSeverity.js       # Bug severity levels
│   │   │   └── constants.js
│   │   │
│   │   ├── formatters/
│   │   │   ├── responseFormatter.js
│   │   │   ├── dateFormatter.js
│   │   │   └── dataTransformer.js
│   │   │
│   │   └── redis/
│   │       └── redisUtil.js         # For caching and real-time features
│   │
│   ├── queues/
│   │   ├── emailQueue.js            # Email sending queue
│   │   ├── notificationQueue.js     # Notification queue
│   │   ├── reportQueue.js           # Report generation queue
│   │   └── queueConfig.js
│   │
│   ├── events/
│   │   ├── bugEvents.js
│   │   ├── projectEvents.js
│   │   ├── userEvents.js
│   │   ├── notificationEvents.js
│   │   ├── emailEvents.js
│   │   └── eventEmitter.js
│   │
│   ├── templates/
│   │   ├── emails/
│   │   │   ├── welcomeTemplate.html
│   │   │   ├── inviteTemplate.html
│   │   │   ├── bugNotificationTemplate.html
│   │   │   ├── requirementNotificationTemplate.html
│   │   │   ├── commentMentionTemplate.html
│   │   │   ├── passwordResetTemplate.html
│   │   │   ├── mfaVerificationTemplate.html
│   │   │   ├── dailyReportTemplate.html
│   │   │   └── sprintSummaryTemplate.html
│   │   │
│   │   └── documents/
│   │       ├── defaultDocTemplate.json
│   │       ├── defaultSheetTemplate.json
│   │       └── defaultSlideTemplate.json
│   │
│   ├── socket/
│   │   ├── socketHandler.js         # Real-time collaboration
│   │   ├── documentSocket.js        # Document real-time sync
│   │   ├── sheetSocket.js           # Sheet real-time sync
│   │   ├── slideSocket.js           # Slide real-time sync
│   │   ├── notificationSocket.js    # Real-time notifications
│   │   ├── messagingSocket.js       # Real-time messaging
│   │   └── socketEvents.js
│   │
│   ├── migrations/
│   │   ├── createIndexes.js         # Database indexes
│   │   ├── seedDatabase.js          # Initial seed data
│   │   └── migrations.js
│   │
│   ├── app.js                       # Express app configuration
│   └── server.js                    # Server entry point
│
├── .env.example                     # Environment variables example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── docker-compose.yml              # Docker setup for services
```

## Key Architectural Considerations

### Database Models Relationships

**Hierarchy:**
- Organization → Department → Teams → Projects → Sprints/Phases → Folders → Documents/Sheets/Slides/Bugs

**Access Control Flow:**
- When user is invited to project with admin access → automatically inherits all sub-resource access (sprints, folders, documents)
- When new document is created in folder → inherits folder's access permissions

**Role Structure:**
- Organization: 1 Super Admin + Multiple Admins + Infinite Users
- Department: 1 Super Admin + Multiple Admins + Infinite Users
- Team: 1 Super Admin + Multiple Admins + Infinite Users
- Permissions: View (read-only), Edit (modify), Admin (full control)

### Critical Service Layers

**accessInheritanceService**: Handles automatic permission cascading when:
- User is invited to project → gets access to all existing pages, sprints, folders
- New item created → inherits parent permissions
- Permission updated → cascades down the hierarchy

**notificationService**: Manages both in-app and email notifications with queuing for:
- Bug assignments and status changes
- Requirement tracking updates
- Sprint summaries
- Daily reports
- Invite notifications

**collaborationServices**: Handle real-time syncing for Documents, Sheets, Slides using WebSocket connections

### Queue and Event System

- Uses Bull or similar for job queues (email, notifications, reports)
- Event emitters for triggering cascading updates
- Handles bulk operations efficiently

### Security Layers

- JWT tokens with refresh mechanism
- MFA verification middleware
- OAuth integration for Google/GitHub
- Input sanitization and validation
- Role-based and permission-based authorization at every endpoint

This structure scales with your feature set while maintaining clean separation of concerns and clear data flow.