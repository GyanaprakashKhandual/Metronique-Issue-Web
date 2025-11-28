import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema(
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
            type: String
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
        slides: [
            {
                slideId: String,
                slideNumber: {
                    type: Number,
                    required: true
                },
                slideIndex: Number,
                title: String,
                notes: String,
                thumbnail: String,
                layout: {
                    type: String,
                    enum: ['blank', 'title', 'title_body', 'title_two_columns', 'title_only', 'section_header', 'title_body_image', 'main_point', 'big_number', 'caption_only', 'custom'],
                    default: 'blank'
                },
                background: {
                    type: {
                        type: String,
                        enum: ['solid', 'gradient', 'image', 'video'],
                        default: 'solid'
                    },
                    color: {
                        type: String,
                        default: '#ffffff'
                    },
                    gradient: {
                        type: {
                            type: String,
                            enum: ['linear', 'radial'],
                            default: 'linear'
                        },
                        angle: Number,
                        stops: [
                            {
                                color: String,
                                position: Number
                            }
                        ]
                    },
                    image: {
                        url: String,
                        imageId: String,
                        fit: {
                            type: String,
                            enum: ['fill', 'fit', 'stretch', 'tile'],
                            default: 'fill'
                        },
                        opacity: {
                            type: Number,
                            default: 1,
                            min: 0,
                            max: 1
                        }
                    },
                    video: {
                        url: String,
                        videoId: String,
                        autoplay: {
                            type: Boolean,
                            default: false
                        },
                        loop: {
                            type: Boolean,
                            default: false
                        },
                        muted: {
                            type: Boolean,
                            default: true
                        }
                    }
                },
                transition: {
                    type: {
                        type: String,
                        enum: ['none', 'fade', 'slide', 'push', 'wipe', 'flip', 'zoom', 'dissolve', 'cube', 'gallery'],
                        default: 'none'
                    },
                    duration: {
                        type: Number,
                        default: 0.5
                    },
                    direction: {
                        type: String,
                        enum: ['left', 'right', 'up', 'down'],
                        default: 'left'
                    }
                },
                elements: [
                    {
                        elementId: String,
                        type: {
                            type: String,
                            enum: ['text', 'image', 'video', 'shape', 'line', 'table', 'chart', 'diagram', 'icon', 'embed', 'link'],
                            required: true
                        },
                        position: {
                            x: {
                                type: Number,
                                required: true
                            },
                            y: {
                                type: Number,
                                required: true
                            },
                            width: Number,
                            height: Number,
                            rotation: {
                                type: Number,
                                default: 0
                            },
                            zIndex: {
                                type: Number,
                                default: 0
                            }
                        },
                        text: {
                            content: String,
                            style: {
                                fontFamily: {
                                    type: String,
                                    default: 'Arial'
                                },
                                fontSize: {
                                    type: Number,
                                    default: 16
                                },
                                fontWeight: {
                                    type: String,
                                    enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
                                    default: 'normal'
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
                                textAlign: {
                                    type: String,
                                    enum: ['left', 'center', 'right', 'justify'],
                                    default: 'left'
                                },
                                verticalAlign: {
                                    type: String,
                                    enum: ['top', 'middle', 'bottom'],
                                    default: 'top'
                                },
                                lineHeight: {
                                    type: Number,
                                    default: 1.2
                                },
                                letterSpacing: {
                                    type: Number,
                                    default: 0
                                },
                                textTransform: {
                                    type: String,
                                    enum: ['none', 'uppercase', 'lowercase', 'capitalize'],
                                    default: 'none'
                                },
                                backgroundColor: String,
                                padding: {
                                    top: Number,
                                    right: Number,
                                    bottom: Number,
                                    left: Number
                                }
                            },
                            link: {
                                url: String,
                                target: {
                                    type: String,
                                    enum: ['_blank', '_self'],
                                    default: '_blank'
                                }
                            },
                            bulletPoints: {
                                enabled: {
                                    type: Boolean,
                                    default: false
                                },
                                style: {
                                    type: String,
                                    enum: ['disc', 'circle', 'square', 'decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'],
                                    default: 'disc'
                                },
                                indent: {
                                    type: Number,
                                    default: 0
                                }
                            }
                        },
                        image: {
                            url: String,
                            imageId: String,
                            alt: String,
                            fit: {
                                type: String,
                                enum: ['fill', 'contain', 'cover', 'none', 'scale-down'],
                                default: 'cover'
                            },
                            filters: {
                                brightness: {
                                    type: Number,
                                    default: 100
                                },
                                contrast: {
                                    type: Number,
                                    default: 100
                                },
                                saturation: {
                                    type: Number,
                                    default: 100
                                },
                                blur: {
                                    type: Number,
                                    default: 0
                                },
                                opacity: {
                                    type: Number,
                                    default: 100
                                }
                            },
                            crop: {
                                x: Number,
                                y: Number,
                                width: Number,
                                height: Number
                            },
                            border: {
                                width: Number,
                                color: String,
                                style: String
                            },
                            shadow: {
                                offsetX: Number,
                                offsetY: Number,
                                blur: Number,
                                color: String
                            }
                        },
                        video: {
                            url: String,
                            videoId: String,
                            provider: {
                                type: String,
                                enum: ['youtube', 'vimeo', 'custom', 'upload'],
                                default: 'upload'
                            },
                            thumbnail: String,
                            autoplay: {
                                type: Boolean,
                                default: false
                            },
                            loop: {
                                type: Boolean,
                                default: false
                            },
                            muted: {
                                type: Boolean,
                                default: false
                            },
                            controls: {
                                type: Boolean,
                                default: true
                            },
                            startTime: {
                                type: Number,
                                default: 0
                            },
                            endTime: Number
                        },
                        shape: {
                            type: {
                                type: String,
                                enum: ['rectangle', 'circle', 'ellipse', 'triangle', 'polygon', 'star', 'arrow', 'line', 'custom'],
                                default: 'rectangle'
                            },
                            fill: {
                                type: {
                                    type: String,
                                    enum: ['solid', 'gradient', 'pattern', 'none'],
                                    default: 'solid'
                                },
                                color: String,
                                gradient: {
                                    type: {
                                        type: String,
                                        enum: ['linear', 'radial'],
                                        default: 'linear'
                                    },
                                    angle: Number,
                                    stops: [
                                        {
                                            color: String,
                                            position: Number
                                        }
                                    ]
                                }
                            },
                            stroke: {
                                width: Number,
                                color: String,
                                style: {
                                    type: String,
                                    enum: ['solid', 'dashed', 'dotted'],
                                    default: 'solid'
                                },
                                dashArray: [Number]
                            },
                            cornerRadius: Number,
                            sides: Number,
                            points: Number
                        },
                        table: {
                            rows: Number,
                            columns: Number,
                            cells: [
                                {
                                    rowIndex: Number,
                                    columnIndex: Number,
                                    content: String,
                                    style: mongoose.Schema.Types.Mixed,
                                    colspan: {
                                        type: Number,
                                        default: 1
                                    },
                                    rowspan: {
                                        type: Number,
                                        default: 1
                                    }
                                }
                            ],
                            style: {
                                borderWidth: Number,
                                borderColor: String,
                                headerBackground: String,
                                alternateRowColor: Boolean
                            }
                        },
                        chart: {
                            chartType: {
                                type: String,
                                enum: ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'bubble', 'radar', 'polar'],
                                default: 'bar'
                            },
                            data: {
                                labels: [String],
                                datasets: [
                                    {
                                        label: String,
                                        data: [Number],
                                        backgroundColor: mongoose.Schema.Types.Mixed,
                                        borderColor: mongoose.Schema.Types.Mixed,
                                        borderWidth: Number
                                    }
                                ]
                            },
                            options: mongoose.Schema.Types.Mixed
                        },
                        diagram: {
                            diagramType: {
                                type: String,
                                enum: ['flowchart', 'mindmap', 'timeline', 'venn', 'pyramid', 'funnel', 'org_chart'],
                                default: 'flowchart'
                            },
                            nodes: [
                                {
                                    nodeId: String,
                                    label: String,
                                    x: Number,
                                    y: Number,
                                    width: Number,
                                    height: Number,
                                    style: mongoose.Schema.Types.Mixed
                                }
                            ],
                            connections: [
                                {
                                    from: String,
                                    to: String,
                                    style: mongoose.Schema.Types.Mixed,
                                    label: String
                                }
                            ]
                        },
                        embed: {
                            url: String,
                            embedCode: String,
                            provider: String
                        },
                        link: {
                            url: String,
                            displayText: String,
                            target: {
                                type: String,
                                enum: ['_blank', '_self', 'slide'],
                                default: '_blank'
                            },
                            slideNumber: Number
                        },
                        animation: {
                            type: {
                                type: String,
                                enum: ['none', 'appear', 'fade_in', 'fly_in', 'zoom_in', 'rotate_in', 'bounce_in', 'slide_in', 'wipe_in', 'float_in', 'split_in', 'custom'],
                                default: 'none'
                            },
                            duration: {
                                type: Number,
                                default: 0.5
                            },
                            delay: {
                                type: Number,
                                default: 0
                            },
                            direction: {
                                type: String,
                                enum: ['left', 'right', 'up', 'down', 'center'],
                                default: 'left'
                            },
                            easing: {
                                type: String,
                                enum: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'],
                                default: 'ease'
                            },
                            trigger: {
                                type: String,
                                enum: ['on_load', 'on_click', 'after_previous', 'with_previous'],
                                default: 'on_load'
                            },
                            order: {
                                type: Number,
                                default: 0
                            },
                            loop: {
                                type: Boolean,
                                default: false
                            }
                        },
                        style: {
                            opacity: {
                                type: Number,
                                default: 1,
                                min: 0,
                                max: 1
                            },
                            border: {
                                width: Number,
                                color: String,
                                style: String,
                                radius: Number
                            },
                            shadow: {
                                offsetX: Number,
                                offsetY: Number,
                                blur: Number,
                                spread: Number,
                                color: String
                            },
                            transform: {
                                scaleX: {
                                    type: Number,
                                    default: 1
                                },
                                scaleY: {
                                    type: Number,
                                    default: 1
                                },
                                skewX: {
                                    type: Number,
                                    default: 0
                                },
                                skewY: {
                                    type: Number,
                                    default: 0
                                }
                            }
                        },
                        locked: {
                            type: Boolean,
                            default: false
                        },
                        hidden: {
                            type: Boolean,
                            default: false
                        },
                        groupId: String,
                        createdAt: {
                            type: Date,
                            default: Date.now
                        }
                    }
                ],
                speaker_notes: String,
                duration: {
                    type: Number,
                    default: null
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        activeSlideId: String,
        theme: {
            name: String,
            colors: {
                primary: String,
                secondary: String,
                accent: String,
                background: String,
                text: String
            },
            fonts: {
                heading: String,
                body: String
            },
            styles: mongoose.Schema.Types.Mixed
        },
        templates: [
            {
                templateId: String,
                templateName: String,
                thumbnail: String,
                slides: [mongoose.Schema.Types.Mixed]
            }
        ],
        masterSlides: [
            {
                masterId: String,
                masterName: String,
                layout: mongoose.Schema.Types.Mixed,
                elements: [mongoose.Schema.Types.Mixed]
            }
        ],
        pageSetup: {
            width: {
                type: Number,
                default: 1920
            },
            height: {
                type: Number,
                default: 1080
            },
            orientation: {
                type: String,
                enum: ['landscape', 'portrait'],
                default: 'landscape'
            },
            unit: {
                type: String,
                enum: ['px', 'cm', 'in'],
                default: 'px'
            }
        },
        presentationSettings: {
            autoAdvance: {
                type: Boolean,
                default: false
            },
            autoAdvanceTime: {
                type: Number,
                default: 5
            },
            loop: {
                type: Boolean,
                default: false
            },
            showControls: {
                type: Boolean,
                default: true
            },
            showProgressBar: {
                type: Boolean,
                default: true
            },
            showSlideNumbers: {
                type: Boolean,
                default: false
            },
            enableRemoteControl: {
                type: Boolean,
                default: false
            },
            presenterMode: {
                type: Boolean,
                default: false
            }
        },
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
                    enum: ['ADD_SLIDE', 'DELETE_SLIDE', 'UPDATE_SLIDE', 'REORDER_SLIDES', 'ADD_ELEMENT', 'DELETE_ELEMENT', 'UPDATE_ELEMENT', 'UPDATE_THEME', 'UPDATE_SETTINGS']
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
                lastActiveAt: Date,
                cursorPosition: {
                    slideId: String,
                    x: Number,
                    y: Number
                }
            }
        ],
        versions: [
            {
                versionNumber: Number,
                title: String,
                slideData: mongoose.Schema.Types.Mixed,
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
                slideId: String,
                elementId: String,
                position: {
                    x: Number,
                    y: Number
                },
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
                resolved: {
                    type: Boolean,
                    default: false
                },
                resolvedAt: Date,
                resolvedBy: mongoose.Schema.Types.ObjectId,
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
            totalSlides: {
                type: Number,
                default: 0
            },
            totalElements: {
                type: Number,
                default: 0
            },
            presentationCount: {
                type: Number,
                default: 0
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
            embedCode: String,
            allowDownload: {
                type: Boolean,
                default: false
            },
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
                enum: ['pptx', 'pdf', 'images', 'video'],
                default: 'pptx'
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
        collection: 'slides',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

slideSchema.virtual('isSharedCount').get(function () {
    return this.sharedWith.length + this.sharedGroups.length;
});

slideSchema.virtual('versionCount').get(function () {
    return this.versions.length;
});

slideSchema.virtual('collaboratorCount').get(function () {
    return this.collaborators.length;
});

slideSchema.virtual('slideCount').get(function () {
    return this.slides.length;
});

slideSchema.statics.markAsDeleted = function (slideId, deletedBy) {
    return this.findByIdAndUpdate(slideId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
    });
};

slideSchema.index({ organizationId: 1, contextType: 1, contextId: 1, isDeleted: 0 });
slideSchema.index({ organizationId: 1, createdBy: 1, isDeleted: 0 });
slideSchema.index({ organizationId: 1, status: 1, isDeleted: 0 });
slideSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
slideSchema.index({ folderId: 1, isDeleted: 0 });
slideSchema.index({ departmentId: 1, isDeleted: 0 });
slideSchema.index({ teamId: 1, isDeleted: 0 });
slideSchema.index({ projectId: 1, isDeleted: 0 });
slideSchema.index({ phaseId: 1, isDeleted: 0 });
slideSchema.index({ sprintId: 1, isDeleted: 0 });
slideSchema.index({ 'sharedWith.userId': 1 });
slideSchema.index({ 'collaborators.userId': 1 });
slideSchema.index({ createdAt: -1 });
slideSchema.index({ lastAccessedAt: -1 });
slideSchema.index({ searchableContent: 'text', title: 'text', description: 'text' });
slideSchema.index({ tags: 1 });
slideSchema.index({ isFavorite: 1, organizationId: 1 });
slideSchema.index({ 'slides.slideId': 1 });

slideSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    let searchContent = `${this.title} ${this.description || ''}`;
    this.slides.forEach(slide => {
        if (slide.title) searchContent += ` ${slide.title}`;
        if (slide.notes) searchContent += ` ${slide.notes}`;
        if (slide.speaker_notes) searchContent += ` ${slide.speaker_notes}`;
        slide.elements.forEach(element => {
            if (element.text && element.text.content) {
                searchContent += ` ${element.text.content}`;
            }
        });
    });
    this.searchableContent = searchContent.toLowerCase();

    if (!this.contextHierarchyPath) {
        this.contextHierarchyPath = `${this.contextType}:${this.contextId.toString()}`;
    }

    this.statistics.totalSlides = this.slides.length;
    this.statistics.totalElements = this.slides.reduce((total, slide) => {
        return total + (slide.elements ? slide.elements.length : 0);
    }, 0);

    next();
});

slideSchema.methods.canBeViewedBy = function (userId) {
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

slideSchema.methods.canBeEditedBy = function (userId) {
    if (this.createdBy.toString() === userId.toString()) return true;

    const collaboration = this.collaborators.find(c => c.userId.toString() === userId.toString());
    return collaboration && (collaboration.permission === 'edit' || collaboration.permission === 'admin');
};

slideSchema.methods.canBeDeletedBy = function (userId) {
    return this.createdBy.toString() === userId.toString();
};

slideSchema.methods.addSlide = function (slideData, slideIndex) {
    const slideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newSlide = {
        slideId,
        slideNumber: slideIndex !== undefined ? slideIndex : this.slides.length + 1,
        slideIndex: slideIndex !== undefined ? slideIndex : this.slides.length,
        title: slideData.title || '',
        notes: slideData.notes || '',
        thumbnail: slideData.thumbnail || null,
        layout: slideData.layout || 'blank',
        background: slideData.background || {
            type: 'solid',
            color: '#ffffff'
        },
        transition: slideData.transition || {
            type: 'none',
            duration: 0.5
        },
        elements: slideData.elements || [],
        speaker_notes: slideData.speaker_notes || '',
        duration: slideData.duration || null,
        createdAt: new Date()
    };

    if (slideIndex !== undefined && slideIndex < this.slides.length) {
        this.slides.splice(slideIndex, 0, newSlide);
        this.slides.forEach((slide, index) => {
            slide.slideIndex = index;
            slide.slideNumber = index + 1;
        });
    } else {
        this.slides.push(newSlide);
    }

    if (!this.activeSlideId) {
        this.activeSlideId = slideId;
    }

    this.statistics.totalSlides = this.slides.length;

    return slideId;
};

slideSchema.methods.removeSlide = function (slideId) {
    const slideIndex = this.slides.findIndex(s => s.slideId === slideId);

    if (slideIndex !== -1) {
        this.slides.splice(slideIndex, 1);

        this.slides.forEach((slide, index) => {
            slide.slideIndex = index;
            slide.slideNumber = index + 1;
        });

        if (this.activeSlideId === slideId) {
            this.activeSlideId = this.slides.length > 0 ? this.slides[0].slideId : null;
        }

        this.statistics.totalSlides = this.slides.length;
    }
};

slideSchema.methods.updateSlide = function (slideId, updates) {
    const slide = this.slides.find(s => s.slideId === slideId);

    if (slide) {
        if (updates.title !== undefined) slide.title = updates.title;
        if (updates.notes !== undefined) slide.notes = updates.notes;
        if (updates.thumbnail !== undefined) slide.thumbnail = updates.thumbnail;
        if (updates.layout !== undefined) slide.layout = updates.layout;
        if (updates.background !== undefined) slide.background = updates.background;
        if (updates.transition !== undefined) slide.transition = updates.transition;
        if (updates.elements !== undefined) slide.elements = updates.elements;
        if (updates.speaker_notes !== undefined) slide.speaker_notes = updates.speaker_notes;
        if (updates.duration !== undefined) slide.duration = updates.duration;
    }
};

slideSchema.methods.reorderSlides = function (fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.slides.length || toIndex < 0 || toIndex >= this.slides.length) {
        return false;
    }

    const [movedSlide] = this.slides.splice(fromIndex, 1);
    this.slides.splice(toIndex, 0, movedSlide);

    this.slides.forEach((slide, index) => {
        slide.slideIndex = index;
        slide.slideNumber = index + 1;
    });

    return true;
};

slideSchema.methods.duplicateSlide = function (slideId) {
    const slide = this.slides.find(s => s.slideId === slideId);

    if (slide) {
        const newSlideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const duplicatedSlide = JSON.parse(JSON.stringify(slide));

        duplicatedSlide.slideId = newSlideId;
        duplicatedSlide.slideNumber = slide.slideNumber + 1;
        duplicatedSlide.slideIndex = slide.slideIndex + 1;
        duplicatedSlide.createdAt = new Date();

        duplicatedSlide.elements = duplicatedSlide.elements.map(element => ({
            ...element,
            elementId: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        this.slides.splice(slide.slideIndex + 1, 0, duplicatedSlide);

        this.slides.forEach((s, index) => {
            if (index > slide.slideIndex + 1) {
                s.slideIndex = index;
                s.slideNumber = index + 1;
            }
        });

        this.statistics.totalSlides = this.slides.length;

        return newSlideId;
    }

    return null;
};

slideSchema.methods.addElement = function (slideId, elementData) {
    const slide = this.slides.find(s => s.slideId === slideId);

    if (slide) {
        const elementId = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newElement = {
            elementId,
            type: elementData.type,
            position: elementData.position || { x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0 },
            text: elementData.text || null,
            image: elementData.image || null,
            video: elementData.video || null,
            shape: elementData.shape || null,
            table: elementData.table || null,
            chart: elementData.chart || null,
            diagram: elementData.diagram || null,
            embed: elementData.embed || null,
            link: elementData.link || null,
            animation: elementData.animation || { type: 'none', duration: 0.5, delay: 0 },
            style: elementData.style || { opacity: 1 },
            locked: elementData.locked || false,
            hidden: elementData.hidden || false,
            groupId: elementData.groupId || null,
            createdAt: new Date()
        };

        slide.elements.push(newElement);

        this.statistics.totalElements = this.slides.reduce((total, s) => {
            return total + (s.elements ? s.elements.length : 0);
        }, 0);

        return elementId;
    }

    return null;
};

slideSchema.methods.removeElement = function (slideId, elementId) {
    const slide = this.slides.find(s => s.slideId === slideId);

    if (slide) {
        slide.elements = slide.elements.filter(e => e.elementId !== elementId);

        this.statistics.totalElements = this.slides.reduce((total, s) => {
            return total + (s.elements ? s.elements.length : 0);
        }, 0);
    }
};

slideSchema.methods.updateElement = function (slideId, elementId, updates) {
    const slide = this.slides.find(s => s.slideId === slideId);

    if (slide) {
        const element = slide.elements.find(e => e.elementId === elementId);

        if (element) {
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    element[key] = updates[key];
                }
            });
        }
    }
};

slideSchema.methods.applyTheme = function (theme) {
    this.theme = theme;

    this.slides.forEach(slide => {
        if (theme.colors && theme.colors.background) {
            slide.background.color = theme.colors.background;
        }

        slide.elements.forEach(element => {
            if (element.type === 'text' && element.text) {
                if (theme.fonts) {
                    element.text.style.fontFamily = theme.fonts.body || element.text.style.fontFamily;
                }
                if (theme.colors && theme.colors.text) {
                    element.text.style.fontColor = theme.colors.text;
                }
            }
        });
    });
};

const Slide = mongoose.model('Slide', slideSchema);

export default Slide;