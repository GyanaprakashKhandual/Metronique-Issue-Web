import mongoose from 'mongoose';

const sheetSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        title: {
            type: String,
        },
        slug: {
            type: String
        },
        description: {
            type: String,
            default: null
        },
        contextType: {
            type: String,
            enum: [
                'organization',
                'department',
                'sub_department',
                'team',
                'sub_team',
                'project',
                'sub_project',
                'phase',
                'sub_phase',
                'sprint',
                'sub_sprint',
                'folder',
                'sub_folder'
            ],

            index: true
        },
        contextId: {
            type: mongoose.Schema.Types.ObjectId,

            index: true
        },
        contextHierarchyPath: {
            type: String,
            default: null
        },
        parentContextType: {
            type: String,
            enum: [
                'organization',
                'department',
                'team',
                'project',
                'phase',
                'sprint',
                'folder'
            ],
            default: null
        },
        parentContextId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
            index: true
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
            index: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null,
            index: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
            index: true
        },
        phaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase',
            default: null,
            index: true
        },
        sprintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint',
            default: null,
            index: true
        },
        sheets: [
            {
                sheetId: String,
                sheetName: {
                    type: String,
                    required: true
                },
                sheetIndex: Number,
                isHidden: {
                    type: Boolean,
                    default: false
                },
                color: {
                    type: String,
                    default: '#ffffff'
                },
                rowCount: {
                    type: Number,
                    default: 1000
                },
                columnCount: {
                    type: Number,
                    default: 26
                },
                frozenRows: {
                    type: Number,
                    default: 0
                },
                frozenColumns: {
                    type: Number,
                    default: 0
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        activeSheetId: String,
        cells: [
            {
                cellId: String,
                sheetId: String,
                rowIndex: Number,
                columnIndex: Number,
                row: Number,
                column: String,
                value: mongoose.Schema.Types.Mixed,
                displayValue: String,
                formula: String,
                dataType: {
                    type: String,
                    enum: ['text', 'number', 'date', 'boolean', 'formula', 'image', 'link'],
                    default: 'text'
                },
                style: {
                    fontFamily: {
                        type: String,
                        default: 'Arial'
                    },
                    fontSize: {
                        type: Number,
                        default: 11
                    },
                    fontColor: {
                        type: String,
                        default: '#000000'
                    },
                    bold: {
                        type: Boolean,
                        default: false
                    },
                    italic: {
                        type: Boolean,
                        default: false
                    },
                    underline: {
                        type: Boolean,
                        default: false
                    },
                    strikethrough: {
                        type: Boolean,
                        default: false
                    },
                    backgroundColor: {
                        type: String,
                        default: '#ffffff'
                    },
                    textAlignment: {
                        type: String,
                        enum: ['left', 'center', 'right', 'justify'],
                        default: 'left'
                    },
                    verticalAlignment: {
                        type: String,
                        enum: ['top', 'middle', 'bottom'],
                        default: 'middle'
                    },
                    textWrapping: {
                        type: Boolean,
                        default: false
                    },
                    border: {
                        top: {
                            style: String,
                            color: String,
                            width: Number
                        },
                        bottom: {
                            style: String,
                            color: String,
                            width: Number
                        },
                        left: {
                            style: String,
                            color: String,
                            width: Number
                        },
                        right: {
                            style: String,
                            color: String,
                            width: Number
                        }
                    },
                    number: {
                        type: {
                            type: String,
                            enum: ['NUMBER', 'PERCENT', 'CURRENCY', 'DATE', 'TIME'],
                            default: 'NUMBER'
                        },
                        pattern: String
                    }
                },
                image: {
                    imageUrl: String,
                    imageId: String,
                    width: Number,
                    height: Number,
                    alt: String
                },
                link: {
                    url: String,
                    linkText: String
                },
                comment: {
                    text: String,
                    author: mongoose.Schema.Types.ObjectId,
                    createdAt: Date
                },
                validation: {
                    type: {
                        type: String,
                        enum: ['LIST', 'NUMBER', 'TEXT_LENGTH', 'CUSTOM_FORMULA', 'DATE', 'TIME'],
                        default: null
                    },
                    criteria: mongoose.Schema.Types.Mixed,
                    inputMessage: String,
                    errorMessage: String,
                    showCustomUi: Boolean
                },
                notes: String,
                lastModifiedBy: mongoose.Schema.Types.ObjectId,
                lastModifiedAt: Date
            }
        ],
        ranges: [
            {
                rangeId: String,
                startRow: Number,
                endRow: Number,
                startColumn: Number,
                endColumn: Number,
                sheetId: String,
                namedRange: String,
                style: mongoose.Schema.Types.Mixed,
                conditionalFormatting: [
                    {
                        condition: String,
                        format: mongoose.Schema.Types.Mixed
                    }
                ]
            }
        ],
        conditionalFormattings: [
            {
                id: String,
                ranges: [
                    {
                        sheetId: String,
                        startRow: Number,
                        endRow: Number,
                        startColumn: Number,
                        endColumn: Number
                    }
                ],
                booleanRule: {
                    condition: String,
                    format: mongoose.Schema.Types.Mixed
                },
                gradientRule: {
                    minpoint: {
                        color: String,
                        type: String,
                        value: mongoose.Schema.Types.Mixed
                    },
                    midpoint: {
                        color: String,
                        type: String,
                        value: mongoose.Schema.Types.Mixed
                    },
                    maxpoint: {
                        color: String,
                        type: String,
                        value: mongoose.Schema.Types.Mixed
                    }
                }
            }
        ],
        charts: [
            {
                chartId: String,
                sheetId: String,
                title: String,
                chartType: {
                    type: String,
                    enum: ['COLUMN', 'BAR', 'LINE', 'AREA', 'PIE', 'DOUGHNUT', 'SCATTER', 'COMBO'],
                    default: 'COLUMN'
                },
                sourceRanges: [
                    {
                        sheetId: String,
                        startRow: Number,
                        endRow: Number,
                        startColumn: Number,
                        endColumn: Number
                    }
                ],
                position: {
                    overlayPosition: {
                        anchorSheet: String,
                        anchorRow: Number,
                        anchorColumn: Number,
                        offsetX: Number,
                        offsetY: Number
                    }
                },
                options: mongoose.Schema.Types.Mixed,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        filters: [
            {
                filterId: String,
                sheetId: String,
                startRow: Number,
                endRow: Number,
                startColumn: Number,
                endColumn: Number,
                criteria: [
                    {
                        column: Number,
                        condition: String,
                        values: [mongoose.Schema.Types.Mixed]
                    }
                ]
            }
        ],
        protections: [
            {
                protectionId: String,
                protectedRanges: [
                    {
                        rangeId: String,
                        sheetId: String,
                        startRow: Number,
                        endRow: Number,
                        startColumn: Number,
                        endColumn: Number
                    }
                ],
                protectedSheets: [String],
                editors: [mongoose.Schema.Types.ObjectId],
                warningOnly: {
                    type: Boolean,
                    default: false
                },
                requestingUserCanEdit: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        history: [
            {
                changeId: String,
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                changeType: {
                    type: String,
                    enum: ['UPDATE_CELLS', 'ADD_SHEET', 'DELETE_SHEET', 'UPDATE_SHEET', 'ADD_CHART', 'DELETE_CHART', 'UPDATE_PROTECTION', 'UPDATE_FORMATTING']
                },
                changes: mongoose.Schema.Types.Mixed,
                beforeState: mongoose.Schema.Types.Mixed,
                afterState: mongoose.Schema.Types.Mixed
            }
        ],
        undo: [
            {
                undoId: String,
                timestamp: Date,
                changeId: String
            }
        ],
        redo: [
            {
                redoId: String,
                timestamp: Date,
                changeId: String
            }
        ],
        status: {
            type: String,
            enum: ['draft', 'published', 'archived', 'deleted'],
            default: 'draft',
            index: true
        },
        visibility: {
            type: String,
            enum: ['private', 'internal', 'shared', 'public'],
            default: 'private',
            index: true
        },
        isShared: {
            type: Boolean,
            default: false
        },
        sharedWith: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                permission: {
                    type: String,
                    enum: ['view', 'comment', 'edit', 'admin'],
                    default: 'view'
                },
                sharedAt: {
                    type: Date,
                    default: Date.now
                },
                sharedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        sharedGroups: [
            {
                groupType: {
                    type: String,
                    enum: ['organization', 'department', 'team', 'project', 'custom'],
                    required: true
                },
                groupId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                groupName: String,
                permission: {
                    type: String,
                    enum: ['view', 'comment', 'edit', 'admin'],
                    default: 'view'
                },
                sharedAt: {
                    type: Date,
                    default: Date.now
                },
                sharedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        accessControl: {
            defaultPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            inheritedFromOrganization: {
                type: Boolean,
                default: true
            },
            inheritedFromParent: {
                type: Boolean,
                default: true
            },
            isInherited: {
                type: Boolean,
                default: false
            },
            allowedUserIds: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ],
            blockedUserIds: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        collaborators: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                userName: String,
                userEmail: String,
                permission: {
                    type: String,
                    enum: ['view', 'comment', 'edit', 'admin'],
                    default: 'view'
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                },
                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                isActive: {
                    type: Boolean,
                    default: true
                },
                lastActiveAt: Date
            }
        ],
        versions: [
            {
                versionNumber: Number,
                title: String,
                sheetData: mongoose.Schema.Types.Mixed,
                createdAt: {
                    type: Date,
                    default: Date.now
                },
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                changeSummary: String,
                changeType: {
                    type: String,
                    enum: ['created', 'updated', 'published', 'archived'],
                    default: 'updated'
                }
            }
        ],
        currentVersion: {
            type: Number,
            default: 1
        },
        isVersioned: {
            type: Boolean,
            default: true
        },
        tags: [String],
        labels: [
            {
                labelId: String,
                labelName: String,
                color: String
            }
        ],
        comments: [
            {
                commentId: String,
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                userName: String,
                cellId: String,
                content: String,
                mentions: [
                    {
                        userId: mongoose.Schema.Types.ObjectId,
                        userName: String
                    }
                ],
                createdAt: {
                    type: Date,
                    default: Date.now
                },
                updatedAt: Date,
                isEdited: {
                    type: Boolean,
                    default: false
                },
                replies: [
                    {
                        replyId: String,
                        userId: mongoose.Schema.Types.ObjectId,
                        userName: String,
                        content: String,
                        createdAt: Date
                    }
                ]
            }
        ],
        metadata: {
            department: {
                departmentId: mongoose.Schema.Types.ObjectId,
                departmentName: String
            },
            team: {
                teamId: mongoose.Schema.Types.ObjectId,
                teamName: String
            },
            project: {
                projectId: mongoose.Schema.Types.ObjectId,
                projectName: String
            },
            phase: {
                phaseId: mongoose.Schema.Types.ObjectId,
                phaseName: String
            },
            sprint: {
                sprintId: mongoose.Schema.Types.ObjectId,
                sprintName: String
            },
            folder: {
                folderId: mongoose.Schema.Types.ObjectId,
                folderName: String
            }
        },
        statistics: {
            viewCount: {
                type: Number,
                default: 0
            },
            editCount: {
                type: Number,
                default: 0
            },
            commentCount: {
                type: Number,
                default: 0
            },
            shareCount: {
                type: Number,
                default: 0
            },
            collaboratorCount: {
                type: Number,
                default: 0
            },
            totalCells: {
                type: Number,
                default: 0
            },
            totalSheets: {
                type: Number,
                default: 1
            }
        },
        searchableContent: {
            type: String,
            default: null
        },
        isFavorite: {
            type: Boolean,
            default: false
        },
        favoritedBy: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                favoritedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        publishSettings: {
            isPublished: {
                type: Boolean,
                default: false
            },
            publishedAt: Date,
            publishedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            publishedUrl: String,
            viewsAfterPublish: {
                type: Number,
                default: 0
            }
        },
        exportSettings: {
            lastExportedAt: Date,
            lastExportedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            lastExportFormat: {
                type: String,
                enum: ['xlsx', 'csv', 'pdf'],
                default: 'xlsx'
            }
        },
        auditLog: [
            {
                action: String,
                performedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                details: mongoose.Schema.Types.Mixed
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: Date,
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastAccessedAt: Date,
        lastAccessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        collection: 'sheets',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

sheetSchema.virtual('isSharedCount').get(function () {
    return this.sharedWith.length + this.sharedGroups.length;
});

sheetSchema.virtual('versionCount').get(function () {
    return this.versions.length;
});

sheetSchema.virtual('collaboratorCount').get(function () {
    return this.collaborators.length;
});

sheetSchema.virtual('sheetCount').get(function () {
    return this.sheets.length;
});

sheetSchema.index({ organizationId: 1, contextType: 1, contextId: 1, isDeleted: 0 });
sheetSchema.index({ organizationId: 1, createdBy: 1, isDeleted: 0 });
sheetSchema.index({ organizationId: 1, status: 1, isDeleted: 0 });
sheetSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
sheetSchema.index({ folderId: 1, isDeleted: 0 });
sheetSchema.index({ departmentId: 1, isDeleted: 0 });
sheetSchema.index({ teamId: 1, isDeleted: 0 });
sheetSchema.index({ projectId: 1, isDeleted: 0 });
sheetSchema.index({ phaseId: 1, isDeleted: 0 });
sheetSchema.index({ sprintId: 1, isDeleted: 0 });
sheetSchema.index({ 'sharedWith.userId': 1 });
sheetSchema.index({ 'collaborators.userId': 1 });
sheetSchema.index({ createdAt: -1 });
sheetSchema.index({ lastAccessedAt: -1 });
sheetSchema.index({ searchableContent: 'text', title: 'text', description: 'text' });
sheetSchema.index({ tags: 1 });
sheetSchema.index({ isFavorite: 1, organizationId: 1 });
sheetSchema.index({ 'cells.sheetId': 1 });

sheetSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    this.searchableContent = `${this.title} ${this.description || ''}`.toLowerCase();

    if (!this.contextHierarchyPath) {
        this.contextHierarchyPath = `${this.contextType}:${this.contextId.toString()}`;
    }

    this.statistics.totalSheets = this.sheets.length;
    this.statistics.totalCells = this.cells.length;

    next();
});

sheetSchema.methods.canBeViewedBy = function (userId) {
    if (this.createdBy.toString() === userId.toString()) return true;
    if (this.status === 'archived' || this.isDeleted) return false;

    if (this.accessControl.blockedUserIds.some(id => id.toString() === userId.toString())) {
        return false;
    }

    if (this.visibility === 'public') return true;

    if (this.sharedWith.some(sw => sw.userId.toString() === userId.toString())) return true;

    if (this.visibility === 'private') {
        return this.createdBy.toString() === userId.toString();
    }

    return false;
};

sheetSchema.methods.canBeEditedBy = function (userId) {
    if (this.createdBy.toString() === userId.toString()) return true;

    const collaboration = this.collaborators.find(c => c.userId.toString() === userId.toString());
    return collaboration && (collaboration.permission === 'edit' || collaboration.permission === 'admin');
};

sheetSchema.methods.canBeDeletedBy = function (userId) {
    return this.createdBy.toString() === userId.toString();
};

sheetSchema.methods.addSheet = function (sheetName, sheetIndex) {
    const sheetId = `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.sheets.push({
        sheetId,
        sheetName,
        sheetIndex: sheetIndex || this.sheets.length,
        isHidden: false,
        color: '#ffffff',
        rowCount: 1000,
        columnCount: 26,
        frozenRows: 0,
        frozenColumns: 0,
        createdAt: new Date()
    });

    if (!this.activeSheetId) {
        this.activeSheetId = sheetId;
    }

    this.statistics.totalSheets = this.sheets.length;

    return sheetId;
};

sheetSchema.methods.removeSheet = function (sheetId) {
    this.sheets = this.sheets.filter(s => s.sheetId !== sheetId);
    this.cells = this.cells.filter(c => c.sheetId !== sheetId);

    if (this.activeSheetId === sheetId) {
        this.activeSheetId = this.sheets.length > 0 ? this.sheets[0].sheetId : null;
    }

    this.statistics.totalSheets = this.sheets.length;
};

sheetSchema.methods.updateSheet = function (sheetId, updates) {
    const sheet = this.sheets.find(s => s.sheetId === sheetId);

    if (sheet) {
        if (updates.sheetName) sheet.sheetName = updates.sheetName;
        if (updates.color) sheet.color = updates.color;
        if (updates.isHidden !== undefined) sheet.isHidden = updates.isHidden;
        if (updates.frozenRows !== undefined) sheet.frozenRows = updates.frozenRows;
        if (updates.frozenColumns !== undefined) sheet.frozenColumns = updates.frozenColumns;
    }
};

const Sheet = mongoose.model('Sheet', sheetSchema);

export default Sheet;