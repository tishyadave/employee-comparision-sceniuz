// src/utils/assessmentTopics.js
export const ASSESSMENT_TOPICS = [
  {
    id: "power_bi_fundamentals",
    label: "Power BI Fundamentals",
    subtopics: [
      { id: "desktop_service_mobile", label: "Power BI Desktop / Service / Mobile" },
      { id: "dashboard_vs_report", label: "Dashboard vs Report" },
      { id: "workspaces_app", label: "Workspaces & App" },
      { id: "publishing_refresh", label: "Publishing and Refresh" },
      { id: "licensing", label: "Licensing (Free, Pro, PPU, Fabric)" },
    ],
  },
  {
    id: "data_source_connectivity",
    label: "Data Source & Connectivity",
    subtopics: [
      { id: "data_sources", label: "Data Sources (Excel, SQL, CSV, SharePoint, Web API, Azure SQL, Dataverse, OData, etc.)" },
      { id: "dataflows", label: "Dataflows (Gen1 & Gen2)" },
      { id: "connectivity_modes", label: "Connectivity Modes (Import, DirectQuery, Dual, Live, Composite, Direct Lake)" },
    ],
  },
  {
    id: "data_transformation",
    label: "Data Transformation",
    subtopics: [
      { id: "transform_basic", label: "Basic (Remove/Rename Columns, Change Types, Replace Values, Filter, Split, etc.)" },
      { id: "transform_intermediate", label: "Intermediate (Merge, Append, Pivot, Unpivot, Group By, Index, Reference)" },
      { id: "transform_advanced", label: "Advanced (Parameters, Conditional Columns, Query Folding, M Language, Error Handling)" },
    ],
  },
  {
    id: "data_modeling",
    label: "Data Modeling",
    subtopics: [
      { id: "relationships", label: "Relationships (One-to-One, One-to-Many, Many-to-Many, Active/Inactive)" },
      { id: "modeling_concepts", label: "Modeling Concepts (Fact/Dimension Tables, Star Schema, Snowflake, Bridge Tables)" },
      { id: "semantic_model", label: "Semantic Model Features (Measures, Calculated Columns/Tables, Hierarchies, Display Folders)" },
      { id: "modeling_advanced", label: "Advanced (Cardinality, Cross Filter, Role Playing Dimensions, Aggregation Tables)" },
    ],
  },
  {
    id: "dax_basic",
    label: "DAX – Basic",
    subtopics: [
      { id: "dax_aggregation", label: "Aggregation Functions (SUM, COUNT, DISTINCTCOUNT, AVERAGE, MIN, MAX)" },
      { id: "dax_logical", label: "Logical Functions (IF, SWITCH)" },
      { id: "dax_information", label: "Information Functions (SELECTEDVALUE, ISFILTERED, HASONEVALUE)" },
      { id: "dax_table_basic", label: "Table Functions (VALUES, DISTINCT)" },
      { id: "dax_text", label: "Text Functions (LEFT, RIGHT, MID, FORMAT, CONCATENATE)" },
      { id: "dax_date", label: "Date Functions (TODAY, NOW, YEAR, MONTH, DAY)" },
      { id: "dax_math", label: "Math Functions (DIVIDE, ROUND)" },
    ],
  },
  {
    id: "dax_intermediate",
    label: "DAX – Intermediate",
    subtopics: [
      { id: "dax_filter", label: "Filter Functions (CALCULATE, FILTER, ALL, ALLEXCEPT, ALLSELECTED, REMOVEFILTERS)" },
      { id: "dax_relationship", label: "Relationship Functions (RELATED, RELATEDTABLE)" },
      { id: "dax_ranking", label: "Ranking (RANKX)" },
      { id: "dax_iterator", label: "Iterator Functions (SUMX, AVERAGEX, COUNTX, MINX, MAXX)" },
      { id: "dax_statistical", label: "Statistical Functions (MEDIAN, PERCENTILEX)" },
      { id: "dax_table_mid", label: "Table Functions (SUMMARIZE, ADDCOLUMNS, SELECTCOLUMNS)" },
      { id: "dax_variables", label: "Variables (VAR, RETURN)" },
    ],
  },
  {
    id: "dax_advanced",
    label: "DAX – Advanced",
    subtopics: [
      { id: "dax_context", label: "Evaluation Context (Row Context, Filter Context, Context Transition)" },
      { id: "dax_time_intelligence", label: "Time Intelligence (TOTALYTD, SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD, etc.)" },
      { id: "dax_advanced_concepts", label: "Advanced Concepts (UNION, INTERSECT, CROSSJOIN, GENERATE, NATURALJOIN)" },
      { id: "dax_optimization", label: "Optimization (Performance Tuning, Storage Engine, Formula Engine, Query Plans)" },
    ],
  },
  {
    id: "visualization_design",
    label: "Visualization & Report Design",
    subtopics: [
      { id: "core_visuals", label: "Core Visuals (Table, Matrix, Card, KPI, Gauge, Bar/Line/Pie Charts, Scatter, Treemap, etc.)" },
      { id: "user_experience", label: "User Experience (Slicers, Drill Down, Drill Through, Tooltips, Bookmarks)" },
      { id: "advanced_ux", label: "Advanced UX (Dynamic Titles/Measures, Navigation Buttons, Field Parameters, Conditional Formatting)" },
    ],
  },
  {
    id: "security_governance",
    label: "Security & Governance",
    subtopics: [
      { id: "security_rls", label: "Security (Static RLS, Dynamic RLS, OLS, Security Groups, Azure AD / Entra ID)" },
      { id: "governance", label: "Governance (Workspace Roles, Dataset Permissions, Sensitivity Labels, Data Lineage, Endorsements)" },
      { id: "compliance", label: "Compliance (Microsoft Purview, Information Protection, Compliance Manager)" },
    ],
  },
  {
    id: "power_bi_service",
    label: "Power BI Service",
    subtopics: [
      { id: "collaboration", label: "Collaboration (Workspaces, Apps, Sharing, Comments, Subscriptions, Data Alerts)" },
      { id: "refresh", label: "Refresh (Scheduled, Incremental, Gateway Configuration)" },
      { id: "deployment", label: "Deployment (Pipelines, Dev/Test/Prod, Version Control, CI/CD Basics)" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    subtopics: [
      { id: "tenant_admin", label: "Tenant Administration (Tenant Settings, User Management, Security Policies)" },
      { id: "capacity_mgmt", label: "Capacity Management (Premium Capacity, Fabric Capacity, Capacity Metrics)" },
      { id: "monitoring_admin", label: "Monitoring (Audit Logs, Usage Metrics, Activity Logs, Monitoring APIs)" },
      { id: "gateway_admin", label: "Gateway Administration (On-Premises Gateway, Gateway Clusters, Monitoring)" },
    ],
  },
  {
    id: "log_analytics",
    label: "Log Analytics & Monitoring",
    subtopics: [
      { id: "usage_monitoring", label: "Monitoring (Usage Metrics, Performance Analyzer)" },
      { id: "troubleshooting", label: "Troubleshooting (Dataset Refresh Failures, Query Performance, Gateway Issues)" },
      { id: "kql_analytics", label: "Analytics (KQL Aggregations, Time-Series Analysis)" },
      { id: "capacity_monitoring", label: "Capacity Monitoring (Capacity Reports)" },
    ],
  },
  {
    id: "power_bi_embedded",
    label: "Power BI Embedded",
    subtopics: [
      { id: "embedded_concepts", label: "Concepts (Power BI Embedded, Embedded Capacity)" },
      { id: "embedded_auth", label: "Authentication (Service Principals, Azure AD / Entra ID)" },
      { id: "embedding_models", label: "Embedding Models (App Owns Data, User Owns Data)" },
      { id: "embedded_security", label: "Security (Embed Tokens, RLS in Embedded)" },
    ],
  },
  {
    id: "microsoft_fabric",
    label: "Microsoft Fabric",
    subtopics: [
      { id: "onelake", label: "OneLake (Architecture, Shortcuts, OneCopy Concept)" },
      { id: "fabric_engineering", label: "Data Engineering (Lakehouse)" },
      { id: "fabric_warehouse", label: "Data Warehouse (Fabric Data Warehouse, SQL Endpoint)" },
      { id: "fabric_factory", label: "Data Factory" },
      { id: "realtime_analytics", label: "Real-Time Analytics (Event Streams, Eventhouse)" },
    ],
  },
];

// Flat list of all subtopic IDs — useful for schema generation and validation
export const ALL_SUBTOPIC_IDS = ASSESSMENT_TOPICS.flatMap((t) =>
  t.subtopics.map((s) => s.id)
);
