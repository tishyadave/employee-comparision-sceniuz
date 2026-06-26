// controllers/selfAssessmentController.js
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// All valid subtopic IDs — keep in sync with frontend assessmentTopics.js
const VALID_SUBTOPIC_IDS = new Set([
  // Power BI Fundamentals
  "desktop_service_mobile", "dashboard_vs_report", "workspaces_app",
  "publishing_refresh", "licensing",
  // Data Source & Connectivity
  "data_sources", "dataflows", "connectivity_modes",
  // Data Transformation
  "transform_basic", "transform_intermediate", "transform_advanced",
  // Data Modeling
  "relationships", "modeling_concepts", "semantic_model", "modeling_advanced",
  // DAX Basic
  "dax_aggregation", "dax_logical", "dax_information", "dax_table_basic",
  "dax_text", "dax_date", "dax_math",
  // DAX Intermediate
  "dax_filter", "dax_relationship", "dax_ranking", "dax_iterator",
  "dax_statistical", "dax_table_mid", "dax_variables",
  // DAX Advanced
  "dax_context", "dax_time_intelligence", "dax_advanced_concepts", "dax_optimization",
  // Visualization
  "core_visuals", "user_experience", "advanced_ux",
  // Security & Governance
  "security_rls", "governance", "compliance",
  // Power BI Service
  "collaboration", "refresh", "deployment",
  // Administration
  "tenant_admin", "capacity_mgmt", "monitoring_admin", "gateway_admin",
  // Log Analytics
  "usage_monitoring", "troubleshooting", "kql_analytics", "capacity_monitoring",
  // Embedded
  "embedded_concepts", "embedded_auth", "embedding_models", "embedded_security",
  // Microsoft Fabric
  "onelake", "fabric_engineering", "fabric_warehouse", "fabric_factory", "realtime_analytics",
]);

const TOTAL_SUBTOPICS = VALID_SUBTOPIC_IDS.size;

/**
 * POST /api/self-assessment
 * Body: { ratings: [ { topicId, subtopicId, rating } ] }
 */
const submitSelfAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // One attempt only
    const existing = await prisma.selfAssessment.findUnique({ where: { userId } });
    if (existing) return sendError(res, "Self-assessment already completed", 409);

    const { ratings } = req.body;

    // Basic shape check
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return sendError(res, "ratings must be a non-empty array", 400);
    }

    // All subtopics must be rated
    const submittedIds = new Set(ratings.map((r) => r.subtopicId));
    const missingIds = [...VALID_SUBTOPIC_IDS].filter((id) => !submittedIds.has(id));
    if (missingIds.length > 0) {
      return sendError(res, `Missing ratings for: ${missingIds.join(", ")}`, 400);
    }

    // Validate each entry
    for (const r of ratings) {
      if (!VALID_SUBTOPIC_IDS.has(r.subtopicId)) {
        return sendError(res, `Unknown subtopicId: ${r.subtopicId}`, 400);
      }
      if (!Number.isInteger(r.rating) || r.rating < 1 || r.rating > 5) {
        return sendError(res, `Rating for ${r.subtopicId} must be an integer between 1 and 5`, 400);
      }
    }

    // Compute overall percentage: average rating mapped to 0–100
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const overallPercentage = ((avgRating - 1) / 4) * 100; // 1→0%, 5→100%

    // Create assessment + all subtopic ratings in one transaction
    const assessment = await prisma.selfAssessment.create({
      data: {
        userId,
        overallPercentage,
        ratings: {
          create: ratings.map((r) => ({
            topicId: r.topicId,
            subtopicId: r.subtopicId,
            rating: r.rating,
          })),
        },
      },
      include: { ratings: true },
    });

    sendSuccess(res, { assessment }, "Self-assessment submitted", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/self-assessment/me
 */
const getMySelfAssessment = async (req, res, next) => {
  try {
    const assessment = await prisma.selfAssessment.findUnique({
      where: { userId: req.user.id },
      include: { ratings: true },
    });
    sendSuccess(res, { assessment });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitSelfAssessment, getMySelfAssessment };