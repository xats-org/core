# Custom Assessment Types Extension

The Custom Assessment Types extension provides advanced assessment capabilities beyond the core xats assessment framework. It includes adaptive assessments, peer assessments, portfolio assessments, game-based assessments, and specialized evaluation methods for comprehensive learner assessment.

## Overview

- **Extension ID**: `https://xats.org/extensions/custom-assessments/schema.json`
- **Version**: 1.0.0
- **Compatibility**: xats v0.2.0+

## Features

### Assessment Types

#### 1. Adaptive Assessments
- **Item Response Theory (IRT)**: Psychometrically sound adaptive testing
- **Bayesian Knowledge Tracing**: Track skill mastery over time
- **Computerized Adaptive Testing (CAT)**: Efficient ability estimation
- **Dynamic Difficulty Adjustment**: Real-time difficulty adaptation

#### 2. Peer Assessments
- **Structured Peer Review**: Guided evaluation by classmates
- **Calibration Training**: Improve reviewer accuracy
- **Anonymity Options**: Single-blind, double-blind, or open review
- **Quality Control**: Mechanisms to ensure reliable peer feedback

#### 3. Portfolio Assessments
- **Authentic Assessment**: Real-world work samples and artifacts
- **Reflective Learning**: Required reflection on learning progress
- **Growth Documentation**: Track development over time
- **Multimedia Support**: Text, images, videos, and other media

#### 4. Game-Based Assessments
- **Stealth Assessment**: Invisible evaluation during gameplay
- **Competency Mapping**: Link game activities to learning outcomes
- **Behavioral Analytics**: Track decision-making and problem-solving
- **Narrative Integration**: Assessment woven into game storyline

#### 5. Situational Judgment Tests
- **Real-World Scenarios**: Authentic professional situations
- **Expert Consensus**: Scoring based on expert ratings
- **Competency Assessment**: Evaluate professional judgment skills
- **Stakeholder Analysis**: Consider multiple perspectives

## Usage Examples

### Adaptive Assessment

```json
{
  "id": "algebra-adaptive-test",
  "blockType": "https://xats.org/vocabularies/blocks/assessment",
  "content": {
    "assessmentType": "https://xats.org/extensions/custom-assessments/adaptive"
  },
  "extensions": {
    "adaptiveAssessment": {
      "assessmentId": "algebra-cat-v1",
      "title": "Algebra Competency Assessment",
      "description": "Adaptive test measuring algebra skills using Item Response Theory",
      "adaptiveEngine": {
        "algorithm": "item-response-theory",
        "initialDifficulty": 0.0,
        "targetPrecision": 0.3,
        "maxQuestions": 25,
        "minQuestions": 8,
        "stopCriteria": [
          {
            "type": "precision",
            "value": 0.3
          },
          {
            "type": "max_questions", 
            "value": 25
          }
        ],
        "itemSelectionStrategy": "maximum-information"
      },
      "questionPool": [
        {
          "id": "alg_001",
          "difficulty": -1.2,
          "discrimination": 1.5,
          "content": {
            "id": "alg-q1",
            "blockType": "https://xats.org/vocabularies/blocks/multipleChoice",
            "content": {
              "question": {
                "runs": [
                  {
                    "type": "text",
                    "content": "Solve for x: 2x + 5 = 13"
                  }
                ]
              },
              "options": [
                {
                  "content": {
                    "runs": [{"type": "text", "content": "x = 4"}]
                  }
                },
                {
                  "content": {
                    "runs": [{"type": "text", "content": "x = 6"}]
                  }
                },
                {
                  "content": {
                    "runs": [{"type": "text", "content": "x = 8"}]
                  }
                },
                {
                  "content": {
                    "runs": [{"type": "text", "content": "x = 9"}]
                  }
                }
              ],
              "correctAnswers": [0]
            }
          },
          "learningObjectives": ["linear-equations", "algebraic-manipulation"],
          "cognitive_level": "apply"
        }
        // Additional questions...
      ],
      "scoringModel": {
        "scale": {
          "min": -3,
          "max": 3,
          "mean": 0,
          "standardDeviation": 1
        },
        "reportedMetrics": [
          "theta_estimate",
          "standard_error",
          "percentile_rank",
          "confidence_interval"
        ],
        "confidenceLevel": 0.95
      },
      "feedbackSettings": {
        "immediate": false,
        "detailed": true,
        "adaptive": true,
        "hintSystem": {
          "enabled": true,
          "maxHints": 2,
          "hintPenalty": 0.1
        }
      }
    }
  }
}
```

### Peer Assessment

```json
{
  "id": "essay-peer-review",
  "blockType": "https://xats.org/vocabularies/blocks/assessment",
  "content": {
    "assessmentType": "https://xats.org/extensions/custom-assessments/peer"
  },
  "extensions": {
    "peerAssessment": {
      "assessmentId": "argumentative-essay-pr",
      "title": "Argumentative Essay Peer Review",
      "description": "Peer evaluation of argumentative essays on climate change",
      "assignmentPrompt": {
        "runs": [
          {
            "type": "text",
            "content": "Write a 750-word argumentative essay on the role of individual actions in addressing climate change. Use at least three credible sources and address counterarguments."
          }
        ]
      },
      "submissionGuidelines": {
        "runs": [
          {
            "type": "text",
            "content": "Submit your essay as a PDF document. Include a bibliography in APA format. Ensure your essay has a clear thesis, supporting arguments, and conclusion."
          }
        ]
      },
      "peerReviewConfiguration": {
        "reviewersPerSubmission": 3,
        "reviewsPerReviewer": 3,
        "assignmentMethod": "random",
        "anonymity": "double-blind",
        "calibrationPhase": true,
        "reviewQualityControl": {
          "moderatorReview": true,
          "flaggingSystem": true,
          "minimumReviewLength": 150,
          "reviewerRating": true
        }
      },
      "rubric": {
        "criteria": [
          {
            "id": "thesis",
            "name": "Thesis and Argument",
            "description": "Clear thesis statement and logical argument structure",
            "weight": 0.3,
            "levels": [
              {
                "score": 4,
                "label": "Excellent",
                "description": "Clear, compelling thesis with sophisticated argument structure"
              },
              {
                "score": 3,
                "label": "Good", 
                "description": "Clear thesis with solid argument structure"
              },
              {
                "score": 2,
                "label": "Satisfactory",
                "description": "Adequate thesis with basic argument structure"
              },
              {
                "score": 1,
                "label": "Needs Improvement",
                "description": "Unclear thesis or weak argument structure"
              }
            ]
          },
          {
            "id": "evidence",
            "name": "Use of Evidence",
            "description": "Quality and integration of supporting evidence",
            "weight": 0.25,
            "levels": [
              {
                "score": 4,
                "label": "Excellent",
                "description": "Strong, credible evidence effectively integrated"
              },
              {
                "score": 3,
                "label": "Good",
                "description": "Good evidence with adequate integration"
              },
              {
                "score": 2,
                "label": "Satisfactory", 
                "description": "Some evidence but limited integration"
              },
              {
                "score": 1,
                "label": "Needs Improvement",
                "description": "Weak or insufficient evidence"
              }
            ]
          },
          {
            "id": "counterarguments",
            "name": "Counterarguments",
            "description": "Recognition and refutation of opposing views",
            "weight": 0.2,
            "levels": [
              {
                "score": 4,
                "label": "Excellent",
                "description": "Acknowledges and effectively refutes counterarguments"
              },
              {
                "score": 3,
                "label": "Good",
                "description": "Acknowledges counterarguments with adequate refutation"
              },
              {
                "score": 2,
                "label": "Satisfactory",
                "description": "Limited acknowledgment of counterarguments"
              },
              {
                "score": 1,
                "label": "Needs Improvement",
                "description": "Fails to address counterarguments"
              }
            ]
          },
          {
            "id": "writing_quality",
            "name": "Writing Quality",
            "description": "Grammar, style, and organization",
            "weight": 0.25,
            "levels": [
              {
                "score": 4,
                "label": "Excellent",
                "description": "Clear, engaging writing with excellent organization"
              },
              {
                "score": 3,
                "label": "Good",
                "description": "Good writing with clear organization"
              },
              {
                "score": 2,
                "label": "Satisfactory",
                "description": "Adequate writing with basic organization"
              },
              {
                "score": 1,
                "label": "Needs Improvement",
                "description": "Unclear writing or poor organization"
              }
            ]
          }
        ],
        "commentRequirements": {
          "required": true,
          "minLength": 150,
          "maxLength": 500,
          "structured": true
        }
      },
      "timeline": {
        "submissionDeadline": "2024-03-15T23:59:59Z",
        "reviewStartDate": "2024-03-16T00:00:00Z",
        "reviewDeadline": "2024-03-22T23:59:59Z",
        "finalGradeRelease": "2024-03-25T12:00:00Z"
      },
      "gradingMethod": {
        "aggregationMethod": "trimmed-mean",
        "outlierDetection": "standard-deviation", 
        "reviewerWeighting": true,
        "minimumReviews": 2
      }
    }
  }
}
```

### Portfolio Assessment

```json
{
  "id": "design-portfolio",
  "blockType": "https://xats.org/vocabularies/blocks/assessment",
  "content": {
    "assessmentType": "https://xats.org/extensions/custom-assessments/portfolio"
  },
  "extensions": {
    "portfolioAssessment": {
      "assessmentId": "graphic-design-portfolio",
      "title": "Graphic Design Portfolio",
      "description": "Comprehensive portfolio demonstrating growth in graphic design skills",
      "portfolioStructure": {
        "requiredSections": [
          {
            "id": "branding",
            "name": "Brand Identity Projects",
            "description": "Logo design and brand identity systems",
            "required": true,
            "minArtifacts": 2,
            "maxArtifacts": 4,
            "artifactTypes": ["image", "presentation", "document"]
          },
          {
            "id": "digital",
            "name": "Digital Design",
            "description": "Web graphics, social media, and digital publications",
            "required": true,
            "minArtifacts": 3,
            "maxArtifacts": 6,
            "artifactTypes": ["image", "video", "document"]
          },
          {
            "id": "print",
            "name": "Print Design",
            "description": "Posters, brochures, and print publications",
            "required": true,
            "minArtifacts": 2,
            "maxArtifacts": 4,
            "artifactTypes": ["image", "document"]
          },
          {
            "id": "process",
            "name": "Design Process",
            "description": "Documentation of design thinking and iteration",
            "required": true,
            "minArtifacts": 1,
            "maxArtifacts": 3,
            "artifactTypes": ["document", "presentation", "video"]
          }
        ],
        "reflectionRequirement": {
          "required": true,
          "frequency": "per-section",
          "minLength": 300,
          "guidingQuestions": [
            "What design principles did you apply in this work?",
            "How did your approach evolve through iterations?",
            "What challenges did you encounter and how did you resolve them?",
            "How does this work demonstrate growth in your design skills?"
          ]
        },
        "organizationMethod": "thematic",
        "presentationFormat": "digital"
      },
      "artifactRequirements": {
        "totalArtifacts": {
          "min": 8,
          "max": 17
        },
        "artifactMetadata": [
          {
            "field": "creation_date",
            "required": true,
            "type": "date"
          },
          {
            "field": "design_brief",
            "required": true,
            "type": "text"
          },
          {
            "field": "target_audience",
            "required": true,
            "type": "text"
          },
          {
            "field": "tools_used",
            "required": false,
            "type": "multiselect",
            "options": ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Sketch", "Figma", "Other"]
          },
          {
            "field": "design_principles",
            "required": false,
            "type": "multiselect",
            "options": ["Balance", "Contrast", "Emphasis", "Movement", "Proportion", "Rhythm", "Unity"]
          }
        ],
        "qualityStandards": {
          "originalWork": true,
          "citationRequired": true,
          "minimumEffort": "Demonstrates significant time investment and skill application",
          "technicalRequirements": {
            "imageResolution": "300 DPI for print, 72 DPI for web",
            "fileFormats": ["PDF", "JPG", "PNG"],
            "maxFileSize": "10MB per artifact"
          }
        }
      },
      "evaluationCriteria": {
        "holistic": true,
        "analytic": true,
        "criteria": [
          {
            "dimension": "Technical Skill",
            "description": "Proficiency with design tools and techniques",
            "weight": 0.25,
            "levels": [
              {
                "score": 4,
                "label": "Advanced",
                "description": "Demonstrates sophisticated technical skills and tool mastery"
              },
              {
                "score": 3,
                "label": "Proficient",
                "description": "Shows solid technical skills with minor limitations"
              },
              {
                "score": 2,
                "label": "Developing",
                "description": "Basic technical skills with some areas for improvement"
              },
              {
                "score": 1,
                "label": "Beginning",
                "description": "Limited technical skills requiring significant development"
              }
            ]
          },
          {
            "dimension": "Creativity and Innovation",
            "description": "Original thinking and creative problem-solving",
            "weight": 0.25,
            "levels": [
              {
                "score": 4,
                "label": "Highly Creative",
                "description": "Demonstrates exceptional originality and innovative solutions"
              },
              {
                "score": 3,
                "label": "Creative",
                "description": "Shows good creativity with some original elements"
              },
              {
                "score": 2,
                "label": "Somewhat Creative",
                "description": "Limited creativity with conventional approaches"
              },
              {
                "score": 1,
                "label": "Not Creative",
                "description": "Lacks originality and relies on templates or copying"
              }
            ]
          },
          {
            "dimension": "Design Principles",
            "description": "Application of fundamental design principles",
            "weight": 0.2,
            "levels": [
              {
                "score": 4,
                "label": "Excellent",
                "description": "Sophisticated understanding and application of design principles"
              },
              {
                "score": 3,
                "label": "Good",
                "description": "Good grasp of design principles with effective application"
              },
              {
                "score": 2,
                "label": "Satisfactory",
                "description": "Basic understanding with inconsistent application"
              },
              {
                "score": 1,
                "label": "Poor",
                "description": "Limited understanding of design principles"
              }
            ]
          },
          {
            "dimension": "Growth and Reflection",
            "description": "Evidence of learning and thoughtful reflection",
            "weight": 0.3,
            "levels": [
              {
                "score": 4,
                "label": "Significant Growth",
                "description": "Clear evidence of substantial improvement with deep reflection"
              },
              {
                "score": 3,
                "label": "Good Growth",
                "description": "Noticeable improvement with good reflection"
              },
              {
                "score": 2,
                "label": "Some Growth",
                "description": "Limited improvement with basic reflection"
              },
              {
                "score": 1,
                "label": "Little Growth",
                "description": "Minimal improvement with superficial reflection"
              }
            ]
          }
        ],
        "growth_emphasis": true,
        "self_assessment": true
      },
      "submissionProcess": {
        "drafts_allowed": true,
        "revision_cycles": 3,
        "feedback_points": ["mid-process", "pre-final"],
        "collaborative_features": false
      }
    }
  }
}
```

### Game-Based Assessment

```json
{
  "id": "ecosystem-simulation",
  "blockType": "https://xats.org/vocabularies/blocks/assessment",
  "content": {
    "assessmentType": "https://xats.org/extensions/custom-assessments/game-based"
  },
  "extensions": {
    "gameBasedAssessment": {
      "assessmentId": "eco-sim-assessment",
      "title": "EcoSystem Management Simulation",
      "description": "Interactive simulation assessing understanding of ecosystem dynamics and environmental decision-making",
      "gameFramework": {
        "gameType": "simulation",
        "narrative": {
          "theme": "Environmental Conservation",
          "setting": "Protected National Park facing environmental challenges",
          "characters": [
            {
              "name": "Dr. Sarah Chen",
              "role": "Lead Ecologist",
              "description": "Provides scientific guidance and research data"
            },
            {
              "name": "Mark Rodriguez",
              "role": "Park Manager",
              "description": "Focuses on visitor experience and park operations"
            },
            {
              "name": "Local Community Representatives",
              "role": "Stakeholder Group",
              "description": "Represent local economic and cultural interests"
            }
          ],
          "progression": [
            {
              "stage": "Assessment and Planning",
              "objectives": [
                "Analyze current ecosystem health",
                "Identify key environmental threats",
                "Develop initial management strategy"
              ],
              "assessmentTasks": [
                "Data interpretation",
                "Problem identification",
                "Strategy formulation"
              ]
            },
            {
              "stage": "Implementation",
              "objectives": [
                "Execute conservation measures",
                "Balance competing interests",
                "Adapt to unexpected events"
              ],
              "assessmentTasks": [
                "Decision making under uncertainty",
                "Stakeholder negotiation",
                "Resource allocation"
              ]
            },
            {
              "stage": "Evaluation and Adaptation",
              "objectives": [
                "Monitor ecosystem responses",
                "Adjust strategies based on outcomes",
                "Plan for long-term sustainability"
              ],
              "assessmentTasks": [
                "Data analysis and interpretation",
                "Adaptive management",
                "Systems thinking"
              ]
            }
          ]
        },
        "gameMechanics": {
          "pointSystem": {
            "basePoints": 100,
            "bonusMultipliers": [
              {
                "condition": "sustainable_solution",
                "multiplier": 1.5
              },
              {
                "condition": "stakeholder_satisfaction",
                "multiplier": 1.2
              },
              {
                "condition": "innovation_bonus",
                "multiplier": 1.3
              }
            ],
            "penalties": [
              {
                "condition": "ecosystem_damage",
                "penalty": 50
              },
              {
                "condition": "budget_overrun",
                "penalty": 25
              }
            ]
          },
          "progression": {
            "levels": true,
            "achievements": true,
            "unlockables": true,
            "branching": true
          },
          "collaboration": {
            "teamBased": true,
            "peerInteraction": true,
            "competition": false,
            "cooperation": true
          }
        }
      },
      "assessmentIntegration": {
        "stealth_assessment": true,
        "explicit_tasks": false,
        "continuous_monitoring": true,
        "decision_tracking": true,
        "evidence_collection": [
          "choices_made",
          "time_spent",
          "help_seeking",
          "strategy_used",
          "collaboration_quality",
          "problem_solving_process"
        ]
      },
      "competencyMapping": [
        {
          "competencyId": "systems_thinking",
          "competencyName": "Systems Thinking",
          "gameActivities": [
            {
              "activityId": "ecosystem_analysis",
              "activityType": "data_interpretation",
              "evidenceIndicators": [
                "Identifies interconnections between species",
                "Recognizes cascade effects of interventions",
                "Considers long-term ecosystem impacts"
              ],
              "proficiencyLevels": [
                {
                  "level": "Novice",
                  "criteria": "Identifies simple cause-effect relationships"
                },
                {
                  "level": "Developing",
                  "criteria": "Recognizes some system interconnections"
                },
                {
                  "level": "Proficient",
                  "criteria": "Understands complex system dynamics"
                },
                {
                  "level": "Advanced",
                  "criteria": "Predicts emergent system behaviors"
                }
              ]
            }
          ]
        },
        {
          "competencyId": "decision_making",
          "competencyName": "Environmental Decision Making",
          "gameActivities": [
            {
              "activityId": "management_decisions",
              "activityType": "choice_selection",
              "evidenceIndicators": [
                "Weighs multiple criteria in decisions",
                "Considers stakeholder perspectives",
                "Adapts decisions based on new information"
              ],
              "proficiencyLevels": [
                {
                  "level": "Novice",
                  "criteria": "Makes decisions based on single criteria"
                },
                {
                  "level": "Developing", 
                  "criteria": "Considers multiple factors inconsistently"
                },
                {
                  "level": "Proficient",
                  "criteria": "Systematically evaluates options"
                },
                {
                  "level": "Advanced",
                  "criteria": "Optimizes complex multi-criteria decisions"
                }
              ]
            }
          ]
        }
      ],
      "analyticsConfiguration": {
        "behavioral_tracking": true,
        "pathway_analysis": true,
        "engagement_metrics": true,
        "social_network_analysis": true,
        "real_time_feedback": true
      }
    }
  }
}
```

### Situational Judgment Test

```json
{
  "id": "leadership-scenarios",
  "blockType": "https://xats.org/vocabularies/blocks/assessment",
  "content": {
    "assessmentType": "https://xats.org/extensions/custom-assessments/situational-judgment"
  },
  "extensions": {
    "situationalJudgmentTest": {
      "assessmentId": "leadership-sjt-v2",
      "title": "Leadership Scenarios Assessment",
      "description": "Situational judgment test assessing leadership competencies in various professional contexts",
      "domain": "Leadership and Management",
      "scenarios": [
        {
          "scenarioId": "conflict_resolution",
          "title": "Team Conflict Resolution",
          "context": {
            "runs": [
              {
                "type": "text",
                "content": "You are a project manager leading a cross-functional team of 8 people working on a critical product launch. The deadline is in 3 weeks, and tensions are high due to the pressure and long hours."
              }
            ]
          },
          "situation": {
            "runs": [
              {
                "type": "text",
                "content": "Two of your team members, Alex (from Engineering) and Jordan (from Marketing), have been having heated disagreements in team meetings. Their conflict is starting to affect team morale and productivity. Other team members are taking sides, and you notice people avoiding collaboration. Today, Alex sent an email copying the whole team, criticizing Jordan's 'unrealistic expectations' and 'lack of technical understanding.'"
              }
            ]
          },
          "stakeholders": [
            {
              "name": "Alex",
              "role": "Senior Engineer",
              "interests": "Technical feasibility, code quality, realistic timelines"
            },
            {
              "name": "Jordan",
              "role": "Marketing Manager", 
              "interests": "Customer needs, market positioning, launch success"
            },
            {
              "name": "Team Members",
              "role": "Project Contributors",
              "interests": "Productive work environment, clear direction, project success"
            },
            {
              "name": "Senior Management",
              "role": "Project Sponsors",
              "interests": "On-time delivery, team performance, business results"
            }
          ],
          "responseOptions": [
            {
              "optionId": "immediate_meeting",
              "action": {
                "runs": [
                  {
                    "type": "text",
                    "content": "Schedule an immediate one-on-one meeting with Alex to address the inappropriate email and discuss the conflict privately, then meet separately with Jordan to get their perspective."
                  }
                ]
              },
              "effectiveness": 4,
              "competencies": ["communication", "conflict_resolution", "emotional_intelligence"],
              "consequences": {
                "positive": [
                  "Prevents escalation of public conflict",
                  "Shows leadership responsiveness",
                  "Allows for private discussion of issues"
                ],
                "negative": [
                  "May delay immediate project work",
                  "Could be seen as reactive management"
                ]
              }
            },
            {
              "optionId": "team_meeting",
              "action": {
                "runs": [
                  {
                    "type": "text",
                    "content": "Call a team meeting to address communication norms and refocus everyone on project goals, without singling out Alex and Jordan specifically."
                  }
                ]
              },
              "effectiveness": 3,
              "competencies": ["team_leadership", "communication", "goal_orientation"],
              "consequences": {
                "positive": [
                  "Addresses team dynamics broadly",
                  "Reinforces shared goals",
                  "Establishes communication standards"
                ],
                "negative": [
                  "Doesn't directly address the specific conflict",
                  "May make Alex and Jordan feel publicly called out"
                ]
              }
            },
            {
              "optionId": "ignore_escalation",
              "action": {
                "runs": [
                  {
                    "type": "text",
                    "content": "Focus on project deliverables and let Alex and Jordan work out their differences on their own, while monitoring the situation."
                  }
                ]
              },
              "effectiveness": 1,
              "competencies": [],
              "consequences": {
                "positive": [
                  "Avoids appearing micromanaging",
                  "Focuses on project priorities"
                ],
                "negative": [
                  "Conflict likely to escalate further",
                  "Team morale will continue deteriorating",
                  "Project at risk due to poor collaboration"
                ],
                "unintended": [
                  "Team loses confidence in leadership",
                  "Other conflicts may emerge"
                ]
              }
            },
            {
              "optionId": "joint_mediation",
              "action": {
                "runs": [
                  {
                    "type": "text",
                    "content": "Arrange a facilitated discussion between Alex and Jordan with you as mediator, focusing on understanding each other's perspectives and finding common ground."
                  }
                ]
              },
              "effectiveness": 5,
              "competencies": ["conflict_resolution", "mediation", "communication", "team_building"],
              "consequences": {
                "positive": [
                  "Directly addresses root causes",
                  "Models collaborative problem-solving",
                  "Can lead to stronger working relationship",
                  "Demonstrates advanced leadership skills"
                ],
                "negative": [
                  "Requires significant time investment",
                  "Risk of mediation session going poorly"
                ]
              }
            }
          ],
          "expertRationale": {
            "runs": [
              {
                "type": "text",
                "content": "The most effective approach combines immediate intervention with mediation. Successful leaders address interpersonal conflicts promptly and directly while maintaining team cohesion. The joint mediation option (highest rated) demonstrates advanced conflict resolution skills by bringing parties together in a structured way, but should be preceded by individual conversations to assess readiness for mediation."
              }
            ]
          },
          "metadata": {
            "difficulty": "intermediate",
            "complexity": "high",
            "ambiguity": "moderate",
            "timeConstraint": true
          }
        }
        // Additional scenarios would be included...
      ],
      "scoringMethod": {
        "method": "expert-consensus",
        "responseFormat": "rate-all",
        "weightingScheme": {
          "conflict_resolution": 0.3,
          "communication": 0.25,
          "team_leadership": 0.2,
          "emotional_intelligence": 0.15,
          "decision_making": 0.1
        }
      }
    }
  }
}
```

## Implementation Examples

### TypeScript Assessment Engine

```typescript
// custom-assessment-engine.ts
export interface AssessmentEngine {
  assessmentType: string;
  initialize(config: any): Promise<void>;
  startAssessment(learnerId: string): Promise<string>; // Returns session ID
  getNextItem(sessionId: string, response?: any): Promise<AssessmentItem | null>;
  submitResponse(sessionId: string, itemId: string, response: any): Promise<void>;
  endAssessment(sessionId: string): Promise<AssessmentResults>;
}

export class AdaptiveAssessmentEngine implements AssessmentEngine {
  assessmentType = 'adaptive';
  private config: AdaptiveAssessment;
  private sessions = new Map<string, AdaptiveSession>();

  constructor(config: AdaptiveAssessment) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize IRT parameters, question pool, etc.
    console.log('Initializing adaptive assessment engine...');
  }

  async startAssessment(learnerId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const session: AdaptiveSession = {
      sessionId,
      learnerId,
      startTime: Date.now(),
      currentTheta: 0, // Initial ability estimate
      standardError: 999, // Initial high uncertainty
      itemsAdministered: [],
      responses: [],
      isComplete: false
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async getNextItem(sessionId: string, response?: any): Promise<AssessmentItem | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.isComplete) return null;

    // Process previous response if provided
    if (response && session.itemsAdministered.length > 0) {
      await this.processResponse(session, response);
    }

    // Check stopping criteria
    if (this.shouldStop(session)) {
      session.isComplete = true;
      return null;
    }

    // Select next item using IRT
    const nextItem = this.selectNextItem(session);
    if (nextItem) {
      session.itemsAdministered.push(nextItem.id);
    }

    return nextItem;
  }

  private async processResponse(session: AdaptiveSession, response: any): Promise<void> {
    const lastItemId = session.itemsAdministered[session.itemsAdministered.length - 1];
    const item = this.config.questionPool.find(q => q.id === lastItemId);
    
    if (!item) return;

    // Store response
    session.responses.push({
      itemId: lastItemId,
      response,
      isCorrect: this.scoreResponse(item, response),
      timestamp: Date.now()
    });

    // Update ability estimate using IRT
    this.updateAbilityEstimate(session);
  }

  private selectNextItem(session: AdaptiveSession): AssessmentItem | null {
    const availableItems = this.config.questionPool.filter(
      item => !session.itemsAdministered.includes(item.id)
    );

    if (availableItems.length === 0) return null;

    // Select item with maximum information at current theta estimate
    let bestItem = availableItems[0];
    let maxInformation = this.calculateInformation(bestItem, session.currentTheta);

    for (const item of availableItems.slice(1)) {
      const information = this.calculateInformation(item, session.currentTheta);
      if (information > maxInformation) {
        maxInformation = information;
        bestItem = item;
      }
    }

    return this.convertToAssessmentItem(bestItem);
  }

  private calculateInformation(item: any, theta: number): number {
    // IRT information function: I(θ) = a²P(θ)Q(θ)
    const a = item.discrimination;
    const b = item.difficulty;
    const c = item.guessing || 0;

    const probability = this.calculateProbability(theta, a, b, c);
    return a * a * probability * (1 - probability) / Math.pow(1 - c, 2);
  }

  private calculateProbability(theta: number, a: number, b: number, c: number): number {
    // 3PL IRT model: P(θ) = c + (1-c) / (1 + exp(-a(θ-b)))
    return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
  }

  private updateAbilityEstimate(session: AdaptiveSession): void {
    // Maximum likelihood estimation or Bayesian estimation
    // For simplicity, using basic ML estimation
    let bestTheta = session.currentTheta;
    let maxLikelihood = this.calculateLikelihood(session, bestTheta);

    // Grid search for better estimate (in practice, use Newton-Raphson)
    for (let theta = -3; theta <= 3; theta += 0.1) {
      const likelihood = this.calculateLikelihood(session, theta);
      if (likelihood > maxLikelihood) {
        maxLikelihood = likelihood;
        bestTheta = theta;
      }
    }

    session.currentTheta = bestTheta;
    session.standardError = this.calculateStandardError(session, bestTheta);
  }

  private calculateLikelihood(session: AdaptiveSession, theta: number): number {
    let likelihood = 1;

    for (let i = 0; i < session.responses.length; i++) {
      const response = session.responses[i];
      const item = this.config.questionPool.find(q => q.id === response.itemId);
      
      if (!item) continue;

      const prob = this.calculateProbability(theta, item.discrimination, item.difficulty, item.guessing || 0);
      likelihood *= response.isCorrect ? prob : (1 - prob);
    }

    return likelihood;
  }

  private shouldStop(session: AdaptiveSession): boolean {
    const criteria = this.config.adaptiveEngine.stopCriteria;

    for (const criterion of criteria) {
      switch (criterion.type) {
        case 'precision':
          if (session.standardError <= criterion.value) return true;
          break;
        case 'max_questions':
          if (session.itemsAdministered.length >= criterion.value) return true;
          break;
        case 'time_limit':
          const elapsed = (Date.now() - session.startTime) / 1000 / 60; // minutes
          if (elapsed >= criterion.value) return true;
          break;
      }
    }

    return false;
  }

  async submitResponse(sessionId: string, itemId: string, response: any): Promise<void> {
    // Response processing is handled in getNextItem
    console.log(`Response submitted for session ${sessionId}, item ${itemId}`);
  }

  async endAssessment(sessionId: string): Promise<AssessmentResults> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.isComplete = true;
    session.endTime = Date.now();

    // Generate comprehensive results
    return {
      sessionId,
      learnerId: session.learnerId,
      abilityEstimate: session.currentTheta,
      standardError: session.standardError,
      percentileRank: this.thetaToPercentile(session.currentTheta),
      confidenceInterval: this.calculateConfidenceInterval(session),
      itemsAdministered: session.itemsAdministered.length,
      totalTime: (session.endTime - session.startTime) / 1000,
      competencyScores: this.calculateCompetencyScores(session),
      recommendations: this.generateRecommendations(session)
    };
  }

  private generateSessionId(): string {
    return 'adapt_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Usage example
export async function runAdaptiveAssessment(
  config: AdaptiveAssessment,
  learnerId: string
): Promise<AssessmentResults> {
  const engine = new AdaptiveAssessmentEngine(config);
  await engine.initialize();
  
  const sessionId = await engine.startAssessment(learnerId);
  let nextItem = await engine.getNextItem(sessionId);
  
  while (nextItem) {
    // In real implementation, this would present item to learner
    // and collect their response
    const response = await presentItemToLearner(nextItem);
    await engine.submitResponse(sessionId, nextItem.id, response);
    
    nextItem = await engine.getNextItem(sessionId, response);
  }
  
  return engine.endAssessment(sessionId);
}

async function presentItemToLearner(item: AssessmentItem): Promise<any> {
  // Implementation would depend on UI framework
  return { selectedOption: 0 }; // Placeholder
}
```

## Best Practices

### Assessment Design
- **Validity**: Ensure assessments measure what they claim to measure
- **Reliability**: Maintain consistency across administrations and raters
- **Fairness**: Avoid bias and provide accommodations for diverse learners
- **Authenticity**: Use realistic tasks and contexts
- **Transparency**: Clearly communicate expectations and scoring criteria

### Implementation
- **Progressive Disclosure**: Reveal complexity gradually
- **Error Handling**: Gracefully handle technical issues and data loss
- **Accessibility**: Support assistive technologies and diverse needs
- **Performance**: Optimize for responsive user experience
- **Security**: Protect assessment integrity and learner privacy

### Analytics & Feedback
- **Actionable Insights**: Provide feedback that guides improvement
- **Timely Delivery**: Return results when they can be most useful
- **Multiple Audiences**: Tailor reports for learners, instructors, and administrators
- **Continuous Improvement**: Use data to refine assessment quality

## Testing

Comprehensive testing strategies for custom assessments:

```typescript
// assessment-testing.test.ts
describe('Adaptive Assessment Engine', () => {
  let engine: AdaptiveAssessmentEngine;
  const mockConfig = {
    // Test configuration...
  };

  beforeEach(() => {
    engine = new AdaptiveAssessmentEngine(mockConfig);
  });

  test('should select appropriate initial item', async () => {
    const sessionId = await engine.startAssessment('test-learner');
    const firstItem = await engine.getNextItem(sessionId);
    
    expect(firstItem).toBeDefined();
    expect(firstItem?.difficulty).toBeCloseTo(0, 1); // Near average difficulty
  });

  test('should adapt difficulty based on responses', async () => {
    const sessionId = await engine.startAssessment('test-learner');
    
    // Simulate correct responses - difficulty should increase
    for (let i = 0; i < 3; i++) {
      const item = await engine.getNextItem(sessionId);
      const correctResponse = { selectedOption: item.correctAnswer };
      await engine.submitResponse(sessionId, item.id, correctResponse);
    }
    
    const session = engine['sessions'].get(sessionId);
    expect(session?.currentTheta).toBeGreaterThan(0);
  });

  test('should stop when criteria met', async () => {
    // Test stopping criteria...
  });
});
```

## Contributing

To extend the custom assessment system:

1. **Add Assessment Types**: Define new assessment schemas and engines
2. **Enhance Algorithms**: Improve adaptive algorithms and scoring methods
3. **Create Templates**: Build reusable assessment templates
4. **Improve Analytics**: Add sophisticated measurement and reporting
5. **Expand Integration**: Connect with external assessment platforms

## Support

For issues and questions:
- GitHub Issues: [Report bugs or request features](https://github.com/xats-org/core/issues)
- Documentation: [Extension Development Guide](../../docs/guides/extension-guide.md)
- Community: [xats Discussions](https://github.com/xats-org/core/discussions)