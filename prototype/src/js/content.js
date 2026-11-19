
/* =====================================================================
   CONTENT LIBRARY
   Course facts verified on verticalinstitute.com on 7 Oct 2026.
   Generative AI is stated as 21 hours (the separate assessment block is not
   claimable for Absentee Payroll). AI Workflow Automation's page now states
   "2 days" with no hour count; 17 hours is kept from current proposals.
   ===================================================================== */
const VERIFIED = '7 Oct 2026';
const VERIFIED_ISO = '2026-10-07';
/* SFEC transition (checked 30 Oct 2026):
   - the current SFEC (claimed back after the course) covers up to 90% of the nett course fee, before GST. It expires on
     30 Nov 2026: training must be completed and claimed by then, and unused credit is forfeited;
   - the redesigned SFEC, "SFEC (Enhanced)", starts on 1 Dec 2026 with a fresh S$10,000 in an online wallet that offsets
     out-of-pocket fees upfront at enrolment (SWDA's EWTP factsheet, Jul 2026, and FAQ, Aug 2026: a "nett-fee wallet").
     For SWDA-funded training courses it is taken to cover 100% of the nett course fee, as the OurWorkforce training
     subsidies page and training providers' guides describe; GST is not covered. SWDA's FAQ says the offset depends on
     the programme type (job redesign under WDG(JR+) stays at 90%), so the rate stays editable under Assumptions. */
const SFEC_DEADLINE = '2026-11-30';
const SFEC_NEW_START = '2026-12-01';
const SFEC_RULES_CHECKED = '30 Oct 2026';
const SFEC_LEGACY_RATE = 90;    // current SFEC
const SFEC_DEFAULT_RATE = 100;  // redesigned SFEC, SWDA-funded training courses
/* The redesigned SFEC's rate for this proposal: the Assumptions field, or 100% */
const SFEC_NEW_CREDIT = 10000;          // fresh credit per entity from 1 Dec 2026
const SFEC_NEW_EXPIRY = '30 November 2029';
const SFEC_NEW_CLAIM_DAYS = 14;         // SFEC (Enhanced) must be applied within 14 days of the course start
/* Redesigned SFEC wallet balance in dollars: the fresh S$10,000 unless the client has already used some of it */
function freshBal(v){
  const t = String(v == null ? '' : v).trim();
  const n = t === '' ? SFEC_NEW_CREDIT : parseFloat(t.replace(/[^0-9.]/g, ''));
  return Math.max(0, Math.min(SFEC_NEW_CREDIT, isNaN(n) ? SFEC_NEW_CREDIT : n));
}
function redesignedRate(S){ const r = parseFloat(S && S.sfecRate); return r > 0 && r <= 100 ? r : SFEC_DEFAULT_RATE; }
/* Default consultant details. The builder lets each consultant overwrite these (saved on their device). */
const CONSULTANT_DEFAULT = {
  name: 'Izzat Amin',
  title: 'Corporate Solutions Consultant',
  org: 'Vertical Institute',
  email: 'izzat@verticalinstitute.com',
  phones: '6460 2024 / 9726 5192',
  web: 'verticalinstitute.com'
};
const CONSULTANT = Object.assign({}, CONSULTANT_DEFAULT);
/* Placeholder values that must never reach a client. The pre-export checklist flags any field still holding one. */
const EXAMPLE_VALUES = {
  client: ['Example Engineering', 'Example Engineering Pte Ltd'],
  contact: ['Jamie Tan'],
  priority: ['faster tender documentation'],
  pain: ['Weekly progress reports are pieced together by hand from site diaries and photos', 'Tender clarifications take days because past answers are hard to find', 'Manpower and cost spreadsheets are rebuilt every month for management'],
  uen: ['201812345K', '202098765M'],
  uenName: ['Example Engineering (HQ)', 'Example Civil Works Pte Ltd']
};
const TRUST_STATS = [['50,000+', 'learners trained'], ['4.9 / 5', 'average learner rating'], ['SSG / SWDA', 'Approved Training Organisation'], ['IBF', 'accredited; official training partner of SMU']];
const GLOSSARY = [
  ['SFEC', 'SkillsFuture Enterprise Credit. The current credit covers up to 90% of the nett course fee, claimed back, until 30 Nov 2026; from 1 Dec 2026 a fresh S$10,000 offsets the nett course fee upfront. GST is not covered'],
  ['SkillsFuture funding', 'course-fee funding from SkillsFuture Singapore (SSG), now part of the Skills and Workforce Development Agency (SWDA)'],
  ['Absentee Payroll', 'salary support of S$4.50 per training hour for Singapore Citizens and PRs attending on weekdays'],
  ['EIS', 'Enterprise Innovation Scheme, a 400% tax deduction on qualifying training costs'],
  ['GST input tax', 'the 9% GST paid, which a GST-registered company claims back in its GST return'],
  ['PR', 'Singapore Permanent Resident'],
  ['UEN', 'Unique Entity Number, the company registration number used to check funding'],
  ['WSQ', 'Workforce Skills Qualifications, the national accreditation that unlocks funding']
];

/* fam: content family. wsq: page states a WSQ Statement of Attainment.
   lessons: [title, key topics]; areas replace lessons where the page gives no lesson list. */
const COURSES = [
  {k:'genai', g:'ai', fam:'ai', lvl:1, name:'Generative AI Bootcamp', full:'WSQ Generative AI Bootcamp', short:'Generative AI', fee:1650, hrs:21, ap:21, wsq:true,
   url:'https://verticalinstitute.com/generative-ai-course/', abbr:'GAI', color:'1D4ED8', count:'seven lessons and an assessment',
   lessons:[
    ['Foundations of Generative AI and Prompt Engineering','Core generative AI and large language model concepts, prompting fundamentals, and safe versus unsafe use.'],
    ['Task-Based Prompting and Structured Outputs','Summarisation, Q&A and analysis prompts, with the ACROSTIC and COSTAR frameworks for consistent outputs.'],
    ['Few-Shot and Chain-of-Thought Prompting for Business Applications','Zero-, one- and few-shot prompting, chain-of-thought reasoning, and CSV and JSON outputs.'],
    ['Advanced Reasoning, Prompt Functions and AI-Assisted Research','Tree-of-thought reasoning, large reasoning models and reusable prompt functions for research.'],
    ['Automation with RAG and Custom GPTs','Designing a retrieval-augmented generation (RAG) pipeline, multimodal inputs, and Custom GPTs for reporting.'],
    ['Working with the OpenAI API','API fundamentals, endpoints, tokens, temperature tuning and secure key management.'],
    ['Security, Ethical and Legal Considerations','Attack patterns such as jailbreaks and prompt injection, practical safeguards, and ethical frameworks.']],
   assess:'A written assessment of short-answer questions, and a practical take-home project presented live to an assessor.',
   learn:['Write clear, structured prompts that give consistent results','Work through complex problems step by step with AI','Research and summarise faster, checking every output against its source','Set up Custom GPTs that handle routine reports and tasks','Spot AI misuse, apply safeguards and keep sensitive data out of public tools'],
   pos:'Build reliable day-to-day AI usage.',
   card:['Structured prompting','Reusable AI workflows','Research & summarisation','Reports, proposals & communication','Responsible use & verification'],
   one:'Level 1: use AI tools reliably for writing, research and reporting, with safeguards built in.', theme:'Generative AI',
   carry:'Builds the structured prompting foundation for content creation and workflow automation.'},
  {k:'gaicc', g:'ai', fam:'ai', lvl:2, name:'Generative AI for Content Creation', full:'WSQ Generative AI for Content Creation', short:'Gen AI Content Creation', fee:1300, hrs:13, ap:13, wsq:true,
   url:'https://verticalinstitute.com/courses/generative-ai-for-content-creation-course/', abbr:'GCC', color:'4F46E5', count:'three learning units and an assessment',
   themes:['customers','docs','growth','lean','coordination'],
   lessons:[
    ['Foundations of AI Content Creation and Prompting','Generative AI as no-code tools for written and visual content, interpreting content briefs into audience, objective and format requirements, and structured prompts for copy, images and short-video concepts.'],
    ['Interpreting the Content Brief and Content Requirements','Media strategy thinking for channel-specific content, generating and comparing drafts, editing for accuracy, tone and brand fit, and building a repeatable no-code content workflow.'],
    ['Publication Readiness and Workflow Reuse','Preparing finished content for social posts, web copy, articles and emails, applying human quality checks against the brief, and reusing the workflow on new briefs.']],
   assess:'An open-book written assessment of four short-answer questions, and a practical take-home project presented live to an assessor.',
   learn:['Write persuasive, on-brand copy tailored to different audiences and digital platforms','Generate realistic images and short videos using AI visual prompting and video direction tools','Turn content briefs into structured, repeatable no-code AI workflows','Edit and fact-check AI-generated copy and visuals for accuracy, clarity and brand consistency','Adapt written and visual content across social media, websites, emails and presentations'],
   pos:'Produce polished copy, visuals and videos in minutes.',
   card:['Brief-to-prompt content workflows','On-brand copy across channels','AI image & short-video generation','Editing, fact-checking & brand fit','Repeatable no-code content pipelines'],
   one:'Level 2: boost content creation, from ideas to polished copy, visuals and videos in minutes.', theme:'AI Content Creation',
   carry:'The prompting foundations from Level 1 extend into multi-format copy, AI image generation and short-video production.'},
  {k:'wfa', g:'ai', fam:'auto', lvl:3, name:'Generative AI Workflow Automation', full:'WSQ Generative AI Workflow Automation', short:'Workflow Automation', fee:1300, hrs:17, ap:17, wsq:true,
   url:'https://verticalinstitute.com/short-courses/ai-workflow-automation-course/', abbr:'AI', color:'0F766E', count:'five lessons and an assessment',
   lessons:[
    ['Local LLMs: Setup','An introduction to AI agents, configuring a deployment environment for local language models, and interfaces for generative AI.'],
    ['Local LLMs: Going Deeper','Running models on your own machine, comparing performance and response settings, image understanding and tool capabilities.'],
    ['Integrations, MCP and Workflow Automation','Connecting AI to tools and documents, including through the Model Context Protocol (MCP), and building automated workflows in n8n.'],
    ['Advanced Workflows and Workflow Agents','Workflow patterns, structured prompting and n8n agents for tasks such as customer support and research.'],
    ['Autonomous Agents: Letting the LLM Drive','Autonomous agents, practical set-up, workflow integration and safeguards for responsible task execution.']],
   assess:'An open-book written assessment, and a practical project on a real or example business process, presented to an assessor.',
   learn:['Run AI models locally, so documents can stay in-house','Connect AI to documents, spreadsheets and email with n8n','Build workflow agents that retrieve information and complete tasks','Add approvals and safeguards before anything is sent','Prototype a real business process as a sandbox workflow'],
   pos:'Connect tools, information and repeatable steps.',
   card:['Connect documents, spreadsheets & email','Build multi-step workflows','Use AI agents for real business tasks','Create approval & governance checkpoints','Prototype a real business process'],
   one:'Level 3: build AI agents and workflows connected to your existing tools to reduce manual tasks.', theme:'AI Workflow Automation',
   carry:'The structured prompts and content workflows from earlier levels become the instructions inside each automated step.'},
  {k:'da', g:'data', fam:'data', name:'Data Analytics Bootcamp', full:'WSQ Data Analytics Bootcamp', short:'Data Analytics', fee:1950, hrs:21.5, ap:21, wsq:true,
   url:'https://verticalinstitute.com/data-analytics/', abbr:'DA', color:'6D28D9', count:'seven lessons and an assessment',
   lessons:[
    ['Data Analysis and Excel Fundamentals','Excel formulas, functions and data-cleaning techniques.'],
    ['Introduction to SQL and Databases','Relational database concepts and basic SQL querying.'],
    ['SQL Fundamentals','SELECT, WHERE, JOIN, aggregate functions and GROUP BY.'],
    ['Data Visualisation Fundamentals','Visualisation principles, chart types and dashboard design.'],
    ['Data Analysis with Tableau','The Tableau interface, connecting data sources and building visualisations.'],
    ['Dashboards and Storytelling with Tableau','Dashboard design, filters, interactive actions and data storytelling.'],
    ['Advanced Tableau and Capstone Project','Applying the course to a capstone project and communicating findings to stakeholders.']],
   assess:'An open-book written assessment of short-answer questions, and a take-home Tableau project presented live.',
   learn:['Clean and prepare data in Excel with formulas and functions','Write SQL queries to retrieve and summarise data','Choose the right chart and design clear dashboards','Build interactive Tableau dashboards with filters and actions','Present findings as a clear data story, including their limits'],
   pos:'Turn raw data into clear decisions.',
   card:['Excel data cleaning','SQL queries and summaries','Dashboard design','Interactive Tableau dashboards','Data storytelling'],
   one:'Turn data into clear decisions using Excel, SQL and Tableau.', theme:'Data Analytics',
   carry:'Generative AI helps write formulas and SQL queries, then drafts the story behind each dashboard.'},
  {k:'ada', g:'data', fam:'data', name:'Advanced Data Analytics Bootcamp', full:'Advanced Data Analytics Bootcamp', short:'Advanced Data Analytics', fee:2000, hrs:21, ap:21, wsq:false,
   url:'https://verticalinstitute.com/advanced-data-analytics/', abbr:'ADA', color:'4C1D95', count:'seven lessons and a capstone project',
   lessons:[
    ['Advanced Excel','Data cleaning, error handling, conditional statements, and INDEX and MATCH.'],
    ['Introduction to Advanced SQL','Connecting to databases, advanced comparison operators, data cleaning and advanced joins.'],
    ['Advanced SQL Functions','Window functions with PARTITION BY and ORDER BY, LAG and LEAD, and ranking functions.'],
    ['Advanced SQL Queries','Subqueries, common table expressions (CTEs) and recursive statements.'],
    ['Advanced Tableau Functions','Level-of-detail (LOD) calculations, string manipulation and date formatting.'],
    ['Advanced Tableau Applications','Advanced filters, dynamic dashboard actions, and forecasting, regression and clustering.'],
    ['Tableau Storytelling','Storytelling principles and building a Tableau storyboard for the capstone project.']],
   assess:'A final assessment and a capstone project.',
   learn:['Apply advanced Excel functions to clean and prepare data','Write window functions, subqueries and CTEs in SQL','Build LOD calculations and dynamic dashboards in Tableau','Use forecasting and clustering to look ahead','Tell a clear story with a Tableau storyboard'],
   pos:'Take analysis further.',
   card:['Advanced Excel','Window functions and CTEs','LOD calculations','Forecasting and clustering','Tableau storyboards'],
   one:'Go deeper with advanced Excel, SQL and Tableau for complex analysis.', theme:'Advanced Data Analytics',
   carry:'Generative AI speeds up complex formulas, query writing and the write-up of findings.'},
  {k:'pbi', g:'data', fam:'data', name:'Data Analytics Using Power BI', full:'WSQ Data Analytics Using Power BI', short:'Power BI', fee:1300, hrs:22, ap:22, wsq:true,
   url:'https://verticalinstitute.com/courses/power-bi-course/', abbr:'BI', color:'B45309', count:'seven lessons and an assessment',
   areas:[
    ['Power BI for Smart Reporting','Building dashboards, analysing trends and turning numbers into clear charts.'],
    ['Easy Data Structuring','Organising data, linking tables, grouping information and setting up rules.'],
    ['DAX Made Simple','DAX formulas and calculations, built up step by step.'],
    ['AI and Forecasting Tools','Using Power BI’s AI and forecasting features to spot trends.'],
    ['Dashboard Creation and Storytelling','Designing dashboards that tell a clear story for decision-makers.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Organise and link messy spreadsheets into clean data models','Write DAX calculations, from simple sums upwards','Turn numbers into clear charts and dashboards','Use AI and forecasting tools to spot trends','Tell the story behind each dashboard'],
   pos:'Turn routine reports into live dashboards.',
   card:['Clean data models','DAX calculations','Dashboards and charts','AI and forecasting','Data storytelling'],
   one:'Build Power BI dashboards that turn routine reports into insight.', theme:'Power BI Analytics',
   carry:'Generative AI helps draft DAX formulas and explain trends, so each dashboard comes with clear commentary.'},
  {k:'ds', g:'data', fam:'data', name:'Data Science Bootcamp', full:'WSQ Data Science Bootcamp', short:'Data Science', fee:1650, hrs:21.5, ap:21, wsq:true,
   url:'https://verticalinstitute.com/data-science/', abbr:'DS', color:'1E40AF', count:'seven lessons and an assessment',
   lessons:[
    ['Foundations and Python Basics','The data science lifecycle, Python fundamentals, Jupyter Notebook, and arithmetic, relational and logical operations.'],
    ['String Methods and Control Flow','String methods, text slicing, loops, conditional logic and user-defined functions.'],
    ['Data Structures for Machine Learning (NumPy and Pandas)','NumPy arrays, statistical modules, and Pandas for data extraction and manipulation.'],
    ['Data Cleaning, Visualisation and Exploratory Data Analysis','Matplotlib and Seaborn visualisations, and advanced data cleaning for exploratory analysis.'],
    ['Introduction to Machine Learning and Feature Scaling','Linear regression for continuous outcomes, standardisation and normalisation.'],
    ['Supervised Learning: Classification Models','K-nearest neighbours, logistic regression and decision trees.'],
    ['Model Evaluation and Hyperparameter Tuning','Confusion matrices, ROC curves, and GridSearch and pipelines for tuning.']],
   assess:'An assessment after the final lesson.',
   learn:['Write Python to clean and analyse data','Prepare datasets with NumPy and Pandas','Explore data with Matplotlib and Seaborn charts','Build regression and classification models','Evaluate and tune models before relying on their results'],
   pos:'Move from reports to predictions.',
   card:['Python for data','NumPy and Pandas','Exploratory analysis','Machine learning models','Model evaluation'],
   one:'Use Python and machine learning to predict trends and optimise operations.', theme:'Data Science & AI',
   carry:'Generative AI becomes a coding assistant for writing, explaining and debugging Python.'},
  {k:'ux', g:'dm', fam:'ux', name:'UX Design Bootcamp', full:'WSQ UX Design Bootcamp', short:'UI/UX Design', fee:1650, hrs:21.5, ap:21, wsq:true,
   url:'https://verticalinstitute.com/user-experience/', abbr:'UX', color:'166534', count:'seven lessons and an assessment',
   lessons:[
    ['Introduction to User Experience Design','The UX discipline and design process, information architecture, UI and interaction design, and Design Thinking.'],
    ['User Research and Design Thinking Ideation','Research analysis, user personas, ideation methods, user flows and feature prioritisation.'],
    ['Information Architecture','Card sorting, user flows and sitemaps.'],
    ['Wireframes and Prototyping','Low-, mid- and high-fidelity prototyping in Figma, AI tools and interaction design.'],
    ['Visual Design','UI design, typography, colour, imagery and mobile design.'],
    ['Usability Testing','Planning and running tests, analysing findings and reporting.'],
    ['Capstone Project and Portfolio Building','UX case studies and the capstone project.']],
   assess:'A final assessment after the last lesson, graded Competent or Not Yet Competent.',
   learn:['Research users and turn findings into personas','Map site structure and user journeys','Wireframe and prototype pages in Figma','Apply visual design principles to clear interfaces','Run usability tests and act on the results'],
   pos:'Design journeys customers can complete.',
   card:['User research and personas','User journeys and sitemaps','Figma prototypes','Visual design','Usability testing'],
   one:'Boost conversion and retention online with user-centred design.', theme:'UI/UX Design',
   carry:'Research and summarising skills from Generative AI speed up user research, personas and page copy.'},
  {k:'dm', g:'dm', fam:'mkt', name:'Digital Marketing Bootcamp', full:'WSQ Digital Marketing Bootcamp', short:'Digital Marketing', fee:1650, hrs:21.5, ap:21, wsq:true,
   url:'https://verticalinstitute.com/digital-marketing-course/', abbr:'DM', color:'C2410C', count:'seven lessons and an assessment',
   lessons:[
    ['Foundations of Digital Marketing','Audience personas, positioning, brand-aligned content and cross-channel strategy.'],
    ['Organic Social Media Marketing','Campaign structure, comparing Facebook, Instagram and TikTok, and engagement planning.'],
    ['Paid Social Media Marketing','Ad formats, campaign objectives, Meta and TikTok ad campaigns, and media planning.'],
    ['SEO and Content Marketing','SEO content strategy, publishing workflows, Google Search Console and generative AI tools.'],
    ['Search Engine Marketing (SEM)','Google Ads campaign structure and optimisation, CTR, ROAS and Quality Score.'],
    ['Email Marketing','Email formats, automated email flows and conversion-focused landing pages.'],
    ['Digital Marketing Analytics','Multi-channel metrics, cross-platform reporting and campaign evaluation.']],
   assess:'A written assessment of short-answer questions, and a practical assessment building a strategy, content and a campaign plan.',
   learn:['Turn marketing goals into a clear strategy: audience, positioning, channels','Create content for social media and search','Run organic and paid campaigns on social and Google','Use email and landing pages to turn attention into action','Measure campaign results and optimise'],
   pos:'Reach and convert the right audience.',
   card:['Strategy and positioning','Social content and campaigns','Search and SEO','Email and landing pages','Campaign analytics'],
   one:'Grow your brand and sell online with current digital marketing strategies.', theme:'Digital Marketing',
   carry:'Prompting frameworks from Generative AI produce first drafts of posts, ads and emails for the campaigns this course teaches.'},
  {k:'seo', g:'dm', fam:'mkt', name:'SEO Marketing', full:'WSQ SEO Marketing', short:'SEO Marketing', fee:1300, hrs:16, ap:16, wsq:true,
   url:'https://verticalinstitute.com/short-courses/seo-marketing/', abbr:'SEO', color:'9F1239', count:'four lessons and an assessment',
   lessons:[
    ['Strategic Alignment of SEO with Business Objectives','Revenue models, customer segments, Google Business Profile, local SEO, KPIs and SEO audits.'],
    ['Competitor Intelligence and Trend-Driven SEO Adaptation','Competitor analysis, algorithm updates, keyword research, on-page and off-page SEO, and digital PR.'],
    ['SEO Roadmapping and Strategic Integration','SEO versus SEM, Search Console, Google Analytics and PageSpeed Insights, and roadmap prioritisation.'],
    ['Execution and Evaluation of SEO Strategy','Performance measurement, topical authority, technical SEO, Core Web Vitals and AI content.']],
   assess:'An open-book written assessment, and a project-based practical assessment.',
   learn:['Tie SEO priorities to business goals and customers','Analyse competitors and search trends','Build a prioritised SEO roadmap','Fix technical issues that hold pages back','Track performance and refine with real data'],
   pos:'Get found on search without ad spend.',
   card:['SEO tied to business goals','Competitor and keyword research','A prioritised roadmap','Technical SEO','Performance tracking'],
   one:'Improve search visibility to attract more customers organically.', theme:'SEO Marketing',
   carry:'Generative AI speeds up keyword research, content briefs and page drafts for the SEO plan.'},
  {k:'ga4', g:'dm', fam:'mkt', name:'Mastering Google Analytics 4 (GA4)', full:'WSQ Mastering Google Analytics 4', short:'Google Analytics 4', fee:1300, hrs:15, ap:15, wsq:true,
   url:'https://verticalinstitute.com/short-courses/google-analytics-course/', abbr:'GA4', color:'B91C1C', count:'five lessons and an assessment',
   lessons:[
    ['Introduction to Digital Marketing and Google Analytics','Digital marketing basics and GA4 fundamentals.'],
    ['GA4 Setup for Proper Data Collection','Installing GA4 and configuring data collection and tracking.'],
    ['Analysis of Marketing Channels','Campaign performance across Google, social media and email.'],
    ['Custom Reports and Dashboard Creation','Building reports and dashboards that surface insights.'],
    ['Advanced GA4 Features','E-commerce tracking, user behaviour and funnel analysis.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Set up GA4 to collect the data that matters','Compare channels: Google, social, email and more','See what drives visits and conversions','Build custom reports and dashboards','Track e-commerce and funnel performance'],
   pos:'Know which marketing works.',
   card:['GA4 set-up','Channel analysis','Conversion insight','Custom reports','Funnel tracking'],
   one:'Track what drives traffic and conversions with Google Analytics 4.', theme:'Google Analytics 4',
   carry:'Generative AI turns GA4 numbers into plain-language summaries and next-step recommendations.'},
  {k:'gyt', g:'dm', fam:'mkt', name:'Google & YouTube Marketing', full:'WSQ Google & YouTube Marketing', short:'Google & YouTube Marketing', fee:1300, hrs:15, ap:15, wsq:true,
   url:'https://verticalinstitute.com/short-courses/google-youtube-marketing-course/', abbr:'YT', color:'DC2626', count:'three lessons and an assessment',
   lessons:[
    ['Google Ads Setup','Campaign objectives, budgets, keywords and ad organisation.'],
    ['Best Practices for Content and Ads','Testing images, videos and text, and creating attention-grabbing content.'],
    ['Campaign Analysis and Competitor Research','Google and YouTube analytics, performance tracking and competitor insights.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Set up Google Ads campaigns, budgets and keywords','Plan and launch ads on Google and YouTube','Test images, videos and copy before going live','Track results and research competitors’ ads'],
   pos:'Reach customers on Google and YouTube.',
   card:['Google Ads set-up','Search and video ads','Creative testing','Results tracking','Competitor research'],
   one:'Reach customers through Google search ads and YouTube video.', theme:'Google & YouTube Marketing',
   carry:'Generative AI drafts ad copy, keyword lists and video scripts ready for testing.'},
  {k:'ecom', g:'dm', fam:'mkt', name:'E-commerce and Gig Platforms', full:'WSQ E-commerce and Gig Platforms', short:'E-commerce & Gig Platforms', fee:600, hrs:8, ap:8, wsq:true,
   url:'https://verticalinstitute.com/short-courses/ecommerce-and-gig-platform-course/', abbr:'EC', color:'155E75', count:'three lessons and an assessment',
   lessons:[
    ['The Retail Industry in Singapore: Key Factors and Economic Role','The retail industry, target markets, and technology and legal requirements.'],
    ['Retail Formats and Target Market Dynamics','Economic and political impacts, service levels and market needs.'],
    ['Key Issues and Strategic Considerations in Retail','Issues affecting the sector, operational impacts and strategic decisions.']],
   assess:'A one-hour assessment after the final lesson.',
   learn:['Understand Singapore’s retail landscape and target markets','Identify the technology and legal requirements for retail','Weigh the impact of economic and political events','Match service levels to customer expectations','Tackle the key issues facing the retail sector'],
   pos:'Understand retail and platform selling.',
   card:['Singapore retail landscape','Technology and legal requirements','Retail formats','Service levels','Strategic issues'],
   one:'Understand Singapore’s retail landscape and the platforms reshaping it.', theme:'E-commerce',
   carry:'Generative AI drafts product listings, customer replies and market research for day-to-day platform work.'},
  {k:'cyber', g:'tech', fam:'cyber', name:'Cybersecurity Bootcamp', full:'WSQ Cybersecurity Bootcamp', short:'Cybersecurity', fee:1650, hrs:22, ap:22, wsq:true,
   url:'https://verticalinstitute.com/cybersecurity/', abbr:'CY', color:'334155', count:'seven lessons and an assessment',
   lessons:[
    ['Introduction to Cybersecurity','Threats and cyber criminals, confidentiality, integrity and availability, attack types and security trends.'],
    ['Cyber-Attack Chain','The phases of an attack, security technologies and controls, and threat modelling.'],
    ['Online Security','Passwords and multi-factor authentication, account security, phishing and scams.'],
    ['Risk Management: Perimeter of Exposure','Device, network and USB risks, risk assessment, insider threats and vendor risk.'],
    ['Social Engineering','Manipulation tactics, vishing, phishing and smishing, and telling real emails and websites from fakes.'],
    ['Cybersecurity Regulations','The PDPA at work, MAS Technology Risk Management guidelines and cyber resilience.'],
    ['Incident Preparedness and Response','An assumed-breach mindset, detection, containment and recovery, with an incident response checklist.']],
   assess:'A final assessment, and a capstone project applying the course to a real-world cybersecurity problem.',
   learn:['Spot phishing, scams and social engineering','Protect accounts, devices and company data','Assess cyber risk, including vendors and insiders','Apply the PDPA and MAS guidelines at work','Respond to an incident with a clear checklist'],
   pos:'Protect data, accounts and the business.',
   card:['Threat awareness','Account and device security','Risk assessment','PDPA at work','Incident response'],
   one:'Protect company data and accounts, with the PDPA applied at work.', theme:'Cybersecurity',
   carry:'Generative AI helps summarise threats and draft clear security guidelines for staff.'},
  {k:'chain', g:'tech', fam:'chain', name:'Blockchain & Cryptocurrency Bootcamp', full:'Blockchain & Cryptocurrency Bootcamp', short:'Blockchain', fee:2000, hrs:21, ap:21, wsq:false,
   url:'https://verticalinstitute.com/blockchain-course/', abbr:'BC', color:'3730A3', count:'seven lessons and a capstone project',
   lessons:[
    ['Introduction to Blockchain and Cryptocurrency','What blockchain is, why it matters and its history.'],
    ['Transactions and Wallets','Blockchain features, cryptocurrencies, wallets and transactions.'],
    ['Mining and Staking','Mining mechanics, proof-of-work, sustainability and staking.'],
    ['Exchanges','Centralised and decentralised exchanges, trading and risk evaluation.'],
    ['Smart Contracts, DApps and DAOs','Smart contracts, tokens, DApps, oracles, DAOs and forking.'],
    ['NFT','NFT applications, design, challenges and transactions.'],
    ['DeFi','Decentralised finance, stablecoins and insurance markets.']],
   assess:'A final assessment and a capstone project.',
   learn:['Explain how blockchains and transactions work','Understand wallets, exchanges and their risks','Assess smart contracts, DApps and DAOs','Evaluate NFT and DeFi use cases','Recognise the risks of digital assets'],
   pos:'Understand blockchain and digital assets.',
   card:['How blockchains work','Wallets and exchanges','Smart contracts and DAOs','NFT and DeFi','Digital asset risk'],
   one:'Build a working grasp of blockchain, digital assets and their business uses.', theme:'Blockchain & Digital Assets',
   carry:'Generative AI helps research projects and explain technical concepts in plain language.'},
  {k:'carbon', g:'tech', fam:'carbon', name:'Carbon Reporting & GHG Measurement', full:'WSQ Carbon Reporting & GHG Measurement', short:'Carbon Reporting & GHG', fee:1300, hrs:17, ap:17, wsq:true,
   url:'https://verticalinstitute.com/short-courses/carbon-reporting-ghg-measurement-course/', abbr:'CR', color:'15803D', count:'five lessons and an assessment',
   lessons:[
    ['Foundations of Environmental and Carbon Footprint Management','Sustainability reporting, IFRS S1 and S2 and GRI, the GHG Protocol and ISO 14064-1, and boundary setting.'],
    ['Screening and Identification of Carbon Hotspots','Inventory development, emission factors, data quality management and hotspot analysis.'],
    ['Projecting and Evaluating Reduction Potentials','Mitigation initiatives, technical feasibility and science-based requirements.'],
    ['Developing and Prioritising Carbon Reduction Initiatives','Marginal abatement cost curves, cost-benefit analysis, shadow carbon pricing, and ROI and NPV.'],
    ['Action Planning and Implementation for Carbon Reduction','Action plans, goal alignment, implementation tracking and stakeholder communication.']],
   assess:'A one-hour written and practical assessment after the final lesson.',
   learn:['Apply GRI, ISSB and TCFD reporting standards','Measure emissions with GHG Protocol methods','Find emission hotspots and plan reductions','Rank initiatives by cost, ROI and NPV','Communicate progress to stakeholders'],
   pos:'Measure, report and reduce emissions.',
   card:['ESG frameworks: GRI, ISSB & TCFD','GHG Protocol & ISO 14064-1','Emission hotspots','Reduction planning & ROI','Stakeholder reporting'],
   one:'Measure and report emissions to GRI, ISSB and GHG Protocol standards.', theme:'Carbon Reporting',
   carry:'Generative AI speeds up drafting disclosures and summarising emissions data for stakeholders.'},
  {k:'lead', g:'people', fam:'people', name:'Leading with Clarity: From Strategy to Team Results', full:'WSQ Leading with Clarity: From Strategy to Team Results', short:'Leading with Clarity', fee:1200, hrs:16, ap:16, wsq:true,
   url:'https://verticalinstitute.com/short-courses/strategy-to-team-results-course/', abbr:'LC', color:'1E3A8A', count:'four lessons and an assessment',
   themes:['coordination','lean','customers','docs'],
   lessons:[
    ['Setting Team Goals That Support Organisational Direction','Interpreting priorities and setting SMART team goals.'],
    ['Turning Organisational Goals into Team Performance','Cascading objectives into team targets and benchmarking performance.'],
    ['Communicating Effectively in the Workplace','Choosing communication tools and applying them in workplace conversations.'],
    ['Tracking and Strengthening Team Performance','Evaluating team effectiveness, tracking progress and driving continuous improvement.']],
   assess:'A written assessment, and a practical case study applying the skills to workplace scenarios.',
   learn:['Turn company strategy into SMART team goals','Cascade targets that support company priorities','Choose the right way to deliver each message','Track team performance and keep improving'],
   pos:'Turn strategy into team results.',
   card:['SMART team goals','Cascading targets','Clear communication','Performance tracking','Continuous improvement'],
   one:'Turn strategy into team goals, clear communication and results.', theme:'Leadership',
   carry:'Generative AI helps draft team goals, updates and review notes, leaving more time for leading.'},
  {k:'people', g:'people', fam:'people', name:'Effective People and Relationship Management', full:'WSQ Effective People and Relationship Management', short:'People & Relationship Management', fee:1100, hrs:15, ap:15, wsq:true,
   url:'https://verticalinstitute.com/short-courses/effective-people-relationship-management-course/', abbr:'PR', color:'7C3AED', count:'four lessons and an assessment',
   themes:['coordination','customers','lean','growth'],
   lessons:[
    ['Building Rapport and Trust','Building rapport, establishing trust and creating positive connections.'],
    ['Leadership and Team Building','Leading diverse teams and creating positive work environments.'],
    ['Effective Communication Skills','Clear communication that builds trust, teamwork and positive relationships.'],
    ['Performance Management and Engagement','Managing team performance and engaging employees.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Build rapport and trust across roles','Lead and build a team that works as one','Communicate clearly and effectively','Resolve conflict and encourage inclusivity','Manage performance and keep colleagues engaged'],
   pos:'Build trust and teamwork across roles.',
   card:['Rapport and trust','Team building','Clear communication','Inclusive teams','Performance and engagement'],
   one:'Build trust, teamwork and clear communication across roles.', theme:'People & Relationship Skills',
   carry:'Generative AI helps prepare difficult conversations and draft clear messages to the team.'},
  {k:'conflict', g:'people', fam:'people', name:'Managing Conflict in the Workplace', full:'WSQ Managing Conflict in the Workplace', short:'Managing Conflict', fee:1200, hrs:16, ap:16, wsq:true,
   url:'https://verticalinstitute.com/short-courses/managing-conflict-in-the-workplace/', abbr:'MC', color:'9A3412', count:'five lessons and an assessment',
   themes:['customers','coordination','lean','growth'],
   lessons:[
    ['Introduction to Crisis and Conflict Management','Behavioural psychology, stakeholder communication and identifying workplace issues.'],
    ['De-escalation Techniques','Communicating calmly under pressure and resolving conflict.'],
    ['Problem-Solving Strategies','Root cause analysis and assessing practical solutions.'],
    ['Risk Management and Prevention','Spotting risks early, backup planning and preventing issues.'],
    ['Leadership Through Crisis','Keeping the team steady and deciding under pressure.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Spot and understand workplace issues early','Communicate calmly with different stakeholders','Use behavioural psychology to resolve conflict','Plan ahead so small issues do not escalate','Keep the team steady through a crisis'],
   pos:'Resolve tension before it escalates.',
   card:['Early issue spotting','De-escalation','Root cause analysis','Risk prevention','Leading through crisis'],
   one:'De-escalate tense situations and resolve disputes before they grow.', theme:'Conflict Management',
   carry:'Generative AI helps prepare for tough conversations and draft calm, clear responses.'},
  {k:'ct', g:'people', fam:'people', name:'Critical Thinking & Problem-Solving', full:'WSQ Critical Thinking & Problem-Solving', short:'Critical Thinking', fee:1100, hrs:16, ap:16, wsq:true,
   url:'https://verticalinstitute.com/short-courses/critical-thinking-and-problem-solving-course/', abbr:'CT', color:'0369A1', count:'three lessons and an assessment',
   themes:['coordination','docs','customers','lean'],
   lessons:[
    ['Thinking with Structure','Breaking issues down logically, separating facts from assumptions, the Paul-Elder framework and the PEAS method.'],
    ['Spotting Faulty Logic','Recognising weak arguments, misleading patterns and logical traps.'],
    ['Better Workplace Decisions','Root cause analysis, reflection tools and evaluating outcomes.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Separate facts from assumptions, step by step','Apply the Paul-Elder framework and PEAS method','Recognise weak arguments and logical traps','Find root causes to avoid repeated mistakes','Make and review decisions with confidence'],
   pos:'Decide on facts, not assumptions.',
   card:['Structured thinking','Paul-Elder and PEAS','Spotting faulty logic','Root cause analysis','Better decisions'],
   one:'Separate facts from assumptions and make better workplace decisions.', theme:'Critical Thinking',
   carry:'Generative AI produces options quickly, and this course teaches how to test them before deciding.'},
  {k:'pres', g:'people', fam:'people', name:'Effective Presentation and Storytelling', full:'WSQ Effective Presentation and Storytelling', short:'Presentation & Storytelling', fee:1300, hrs:16, ap:16, wsq:true,
   url:'https://verticalinstitute.com/short-courses/effective-presentation-storytelling-course/', abbr:'PS', color:'9D174D', count:'five lessons and an assessment',
   themes:['growth','customers','docs','coordination'],
   lessons:[
    ['Introduction to Presentation Fundamentals','Confident body language, tone and understanding the audience.'],
    ['Audience Research Methods','Surveys and focus groups for audience analysis.'],
    ['Storytelling Techniques','Building engaging narratives and compelling stories.'],
    ['Presentation Styles','Presentation formats and delivery methods.'],
    ['Feedback and Refinement','Post-presentation feedback and continuous improvement.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Structure ideas into engaging stories','Research the audience and tailor the message','Present with confident body language and tone','Choose the right presentation style','Gather feedback and refine each delivery'],
   pos:'Present ideas that win support.',
   card:['Engaging stories','Audience research','Confident delivery','Presentation styles','Feedback and refinement'],
   one:'Present with confidence and win support with a clear story.', theme:'Presentation & Storytelling',
   carry:'Generative AI drafts outlines, slides and talking points that participants shape into a story.'},
  {k:'crm', g:'people', fam:'people', name:'Manage and Strengthen Customer Relationships', full:'WSQ Manage and Strengthen Customer Relationships', short:'Customer Relationships', fee:600, hrs:8, ap:8, wsq:true,
   url:'https://verticalinstitute.com/short-courses/manage-and-strengthen-customer-relationships/', abbr:'CRM', color:'0E7490', count:'two lessons and an assessment',
   themes:['customers','growth','coordination','lean'],
   areas:[
    ['Active Listening and Empathetic Communication','Identifying needs and adapting communication to different customers.'],
    ['Satisfaction Monitoring and Feedback Analysis','Tracking satisfaction trends and acting on customer feedback.'],
    ['Engagement and Retention Techniques','Communication styles, customer engagement and retention.'],
    ['Client Records and CRM Systems','Organising client records, automating tasks and managing follow-ups.']],
   assess:'A written and practical assessment after the final lesson.',
   learn:['Identify needs through active listening','Adapt communication to different customers','Monitor satisfaction and act on feedback','Keep client records organised for follow-up','Apply retention techniques that keep customers engaged'],
   pos:'Keep clients engaged and loyal.',
   card:['Active listening','Adapting communication','Satisfaction monitoring','Organised follow-up','Retention techniques'],
   one:'Strengthen client relationships, retention and follow-up.', theme:'Customer Relationships',
   carry:'Generative AI drafts customer replies and follow-ups, and summarises feedback trends.'},
  {k:'stress', g:'people', fam:'people', name:'Manage Stress and Build Mental Resilience', full:'WSQ Manage Stress and Build Mental Resilience', short:'Stress & Resilience', fee:600, hrs:8, ap:8, wsq:true,
   url:'https://verticalinstitute.com/short-courses/manage-stress-build-mental-resilience-course/', abbr:'SR', color:'047857', count:'three lessons and an assessment',
   themes:['lean','compliance','coordination','customers'],
   lessons:[
    ['Communication of Health and Wellness Programmes','Communicating programmes, choosing channels, and data privacy and legal obligations.'],
    ['Assessing Wellness Programme Effectiveness','Gathering and analysing employee feedback, and finding gaps.'],
    ['Identifying Trends and Implementing Wellness Initiatives','Spotting trends and technologies, and turning policy into practice.']],
   assess:'An open-book written exam, a case study, and an oral clarification with the assessor.',
   learn:['Design workplace wellness programmes within legal requirements','Gather and analyse employee feedback','Apply emerging wellness trends and technologies','Communicate initiatives clearly and compliantly'],
   pos:'Help teams sustain the pace.',
   card:['Wellness programme design','Employee feedback','Wellness trends','Compliant communication','Practical initiatives'],
   one:'Design wellness programmes that prevent burnout and support staff.', theme:'Workplace Wellbeing',
   carry:'Generative AI helps draft wellness surveys, programme plans and staff communications.'},
  {k:'pg', g:'people', fam:'people', name:'Enhance Personal Growth & Increase Productivity', full:'WSQ Enhance Personal Growth & Increase Productivity', short:'Personal Productivity', fee:1100, hrs:16, ap:16, wsq:true,
   url:'https://verticalinstitute.com/short-courses/enhance-personal-growth-increase-productivity/', abbr:'PG', color:'854D0E', count:'five lessons and an assessment',
   themes:['lean','coordination','customers','docs'],
   lessons:[
    ['Introduction to Personal Productivity','Productivity concepts, aligning habits, and managing stress without burnout.'],
    ['Time and Work Pattern Analysis','Analysing daily patterns and finding inefficiencies.'],
    ['Productivity Tools and Frameworks','The Eisenhower Matrix, the Pomodoro Technique, OKRs and prioritisation.'],
    ['Goal Setting and Tracking','SMART goals, measuring progress and continuous improvement.'],
    ['Focus and Stress Management','Reducing distractions, managing energy and building resilience.']],
   assess:'A personal productivity improvement plan and a practical assessment.',
   learn:['Analyse time and work patterns to find inefficiencies','Prioritise with the Eisenhower Matrix','Plan focused work with Pomodoro and OKRs','Set and track SMART goals','Manage focus, energy and stress'],
   pos:'Get more done without burning out.',
   card:['Work pattern analysis','Prioritisation','Focused work','SMART goals','Energy and stress'],
   one:'Prioritise better, cut distractions and work without burning out.', theme:'Personal Productivity',
   carry:'Generative AI takes care of routine drafting, and this course helps people use the time well.'}
];
const GROUPS = [['ai','AI & automation'],['data','Data'],['dm','Design & marketing'],['tech','Technology & sustainability'],['people','People & workplace skills']];

/* Who each course suits, in plain role terms: [a short line for slide cards, a fuller sentence for the hover overview].
   Written from each course's content and lessons; adjust the wording here if the course pages describe it differently. */
const COURSE_WHO = {
  genai:['Anyone who drafts, researches or reports, from executives to managers','Staff and managers who spend much of their week drafting documents, emails, reports and research, and want to use AI tools reliably and safely. As the foundation level, it suits mixed teams.'],
  gaicc:['Marketing, communications and sales staff who produce content','Marketing, communications, sales and business development staff who create copy, visuals or short videos for social media, websites, emails and presentations, using no-code AI tools.'],
  wfa:['Operations, admin and AI-confident staff with repetitive, multi-step tasks','Operations, admin, finance and IT staff, and AI-confident colleagues, who run repeatable multi-step processes across email, documents and spreadsheets and want to automate them with approvals built in. It builds on the Generative AI foundation.'],
  da:['Staff who build reports in Excel and want SQL and dashboards','Analysts, and finance, operations, sales or HR staff, who compile reports in spreadsheets and want to query data with SQL and present it in Tableau dashboards.'],
  ada:['Analysts already using Excel, SQL or Tableau who need to go further','Analysts and reporting leads who already work with Excel, SQL or Tableau and need advanced techniques: window functions, CTEs, LOD calculations, forecasting and storyboards.'],
  pbi:['Managers and analysts who run recurring reports in spreadsheets','Managers, analysts and admin staff who produce recurring reports from spreadsheets and want them as live Power BI dashboards, with DAX calculations and forecasting.'],
  ds:['Analysts and engineers moving from reports to predictions','Analysts, engineers and technically minded staff who want to use Python and machine learning to predict trends and optimise operations. The course starts from Python basics.'],
  ux:['Product, digital and marketing staff who shape websites and apps','Product, digital, marketing and customer-experience staff who plan or commission websites, apps and online journeys, and want to research users, prototype in Figma and test designs.'],
  dm:['Marketing and business development staff growing enquiries online','Marketing executives, business development staff and business owners who plan campaigns across social media, search and email, and need to measure what works.'],
  seo:['Marketers and website owners who want more organic traffic','Marketing staff and website owners who want the company found on Google without relying on ad spend, from keyword research to technical fixes and tracking.'],
  ga4:['Marketing and e-commerce staff who report on web performance','Marketing, digital and e-commerce staff who need to set up Google Analytics 4 and report on traffic, channels, conversions and funnels.'],
  gyt:['Marketers running, or planning, Google and YouTube ads','Marketing staff and business owners who run, or plan to run, Google search and YouTube video campaigns and want to set budgets, test creative and track results.'],
  ecom:['Retail and sales staff, and owners selling through platforms','Retail, sales and operations staff, and business owners, who need a grounding in Singapore’s retail landscape and the platforms reshaping it.'],
  cyber:['Every staff member who handles company data, plus IT and admin','All staff who use email, accounts and company data day to day, plus the admin, HR and IT teams who handle personal data under the PDPA and need a clear incident response.'],
  chain:['Finance, strategy and innovation teams assessing digital assets','Finance, strategy, compliance and innovation staff who need to judge blockchain, digital-asset and DeFi opportunities, and their risks, on substance.'],
  carbon:['Sustainability, operations and finance staff who report emissions','Sustainability and ESG leads, and the operations, finance and facilities staff who supply emissions data, preparing disclosures to GRI, ISSB and GHG Protocol standards.'],
  lead:['Team leads, supervisors and managers','Team leads, supervisors and managers who turn company priorities into team goals, set clear expectations and track performance.'],
  people:['Supervisors and staff in team- and client-facing roles','Supervisors, team leads and staff who work across teams or with clients, and want to build rapport, trust and clear communication.'],
  conflict:['Supervisors and client-facing staff who handle tense situations','Supervisors, managers and client-facing staff who deal with disputes, complaints or crises, and need to de-escalate and resolve them early.'],
  ct:['Staff and managers who solve problems and make decisions','Executives, managers and specialists who analyse problems, review proposals and make decisions, and want a structured way to separate facts from assumptions.'],
  pres:['Anyone who pitches, presents or briefs stakeholders','Sales and business development staff, managers and specialists who present proposals, pitches or updates to clients, management or their teams.'],
  crm:['Sales, account management and customer service staff','Sales, account management and customer service staff who look after client relationships, follow-ups and feedback.'],
  stress:['HR and people managers who run staff wellbeing programmes','HR, people managers and team leads responsible for staff wellbeing, who design or run workplace wellness initiatives within the legal requirements.'],
  pg:['Busy professionals juggling competing priorities','Professionals and managers with heavy workloads who want to prioritise better, cut distractions and work without burning out.']
};
COURSES.forEach(c => { const w = COURSE_WHO[c.k]; if (w){ c.who = w[0]; c.whoLong = w[1]; } });
/* Training and reference assessment hours from the Scheduler Calculator workbook (V0411, 'Courses Available').
   The schedule plans the cohort's own assessment, so the reference hours are kept for information only. */
const SCHED_HOURS = {genai:[21,0.5], gaicc:[12,1], wfa:[16,1], da:[21,0.5], ada:[21,0.5], pbi:[21,1], ds:[21,0.5], cyber:[21,1], carbon:[16,1],
  ux:[21,0.5], dm:[21,0.5], seo:[15,1], ga4:[14,1], ecom:[7,1], gyt:[14,1], chain:[20,0], lead:[14,2], crm:[7,1], people:[14,1], ct:[15,1],
  pres:[15,1], stress:[7,1], conflict:[14.5,1.5], pg:[15,1]};
COURSES.forEach(c => { const h = SCHED_HOURS[c.k]; c.train = h ? h[0] : c.hrs; c.asmtRef = h ? h[1] : 0; });

/* ---------- Themes: how each family argues its case ---------- */
const FAMILY_THEMES = {
  ai:['docs','customers','lean','compliance','coordination','data','growth'],
  auto:['lean','coordination','docs','data','customers','compliance','growth'],
  data:['data','compliance','coordination','lean','customers','growth','docs'],
  mkt:['growth','customers','data','lean','docs','coordination','compliance'],
  ux:['customers','growth','data','docs','lean','coordination','compliance'],
  cyber:['compliance','lean','coordination','data','customers','docs','growth'],
  carbon:['compliance','growth','data','customers','coordination','docs','lean'],
  chain:['growth','compliance','data','customers','docs','coordination','lean'],
  people:['coordination','customers','lean','compliance','growth','docs','data']
};
const BENEFITS = {
  ai:{
    docs:['Faster first drafts, kept to one standard','Participants learn to draft, summarise and check documents with structured prompts, so staff spend less time writing from scratch and more time reviewing.'],
    customers:['Quicker, more consistent replies','Participants learn to prepare clear responses and updates with AI, keeping tone and facts consistent, with staff accountable for what is sent.'],
    lean:['More capacity from the same team','Routine drafting and summarising can take less time, so a lean team can absorb more work without adding headcount.'],
    compliance:['Compliance work done consistently, and safely','Participants learn to turn requirements into checklists and check documents for gaps, while keeping sensitive information out of public AI tools.'],
    coordination:['Clearer updates across teams','Participants learn to turn scattered notes and threads into structured summaries, so every party works from the same picture.'],
    data:['Faster sense-making from the numbers','Participants learn to use AI to explain trends and draft commentary on reports, with the figures checked by their owner.'],
    growth:['Stronger proposals and outreach','Participants learn to research faster and draft proposals and marketing copy that start from a stronger first version.']},
  auto:{
    lean:['Repeatable steps that run as workflows','Participants learn to turn recurring, multi-step tasks into workflows with approval checkpoints, so routine work takes less manual effort.'],
    coordination:['Hand-offs that keep moving','Participants learn to route requests, updates and reminders between people and tools, with each step logged for review.'],
    docs:['Documents processed consistently','Participants learn to build workflows that extract key fields from incoming documents, flagging exceptions for a person to check.'],
    data:['Reports that assemble themselves','Participants learn to schedule workflows that pull the latest data and draft a summary for review.'],
    customers:['Faster first responses','Participants learn to build agents that draft replies to routine enquiries from approved information, held for approval before sending.'],
    compliance:['Automation with guardrails','Participants learn to build workflows that flag missing records or expiring documents, with approvals before anything is sent and local models where data must stay in-house.'],
    growth:['More time for higher-value work','As routine steps run on their own, teams can redirect time to clients, projects and improvement.']},
  data:{
    data:['Reports that update, not rebuild','Participants learn to clean, combine and visualise data, so recurring reports take less effort and decisions rest on one version of the numbers.'],
    compliance:['Figures that stand up to scrutiny','Participants learn to structure and query data consistently, so figures for audits, clients and regulators trace back to their source.'],
    coordination:['One view across teams','Participants learn to bring data from different spreadsheets and systems into shared dashboards that every team reads the same way.'],
    lean:['Less time compiling, more time deciding','Structured data preparation and dashboards can free analysts and managers from manual consolidation every reporting cycle.'],
    customers:['Clearer insight into customers','Participants learn to analyse orders, enquiries and feedback to find patterns that shape service and sales decisions.'],
    growth:['Decisions backed by evidence','Participants learn to turn data into a clear story, so plans and proposals are argued on evidence.'],
    docs:['Numbers behind every report','Participants learn to produce charts and tables that make reports and proposals easier to read and to check.']},
  mkt:{
    growth:['A steadier flow of enquiries','Participants learn to plan campaigns across search, social and email around clear goals, so marketing produces measurable enquiries.'],
    customers:['Content that speaks to buyers','Participants learn to define audiences and positioning, then create content that answers what buyers look for.'],
    data:['Spend directed by results','Participants learn to track channels and campaigns, so budget and effort move towards what works.'],
    lean:['Marketing a small team can sustain','Participants learn to plan and repurpose content efficiently, so a small team can keep channels active without overstretching.'],
    docs:['Stronger capability material','Participants learn to turn credentials and project stories into web pages, posts and case studies that build trust.'],
    coordination:['Marketing aligned with sales','Participants learn to set shared goals and measures, so marketing and business development work from the same plan.'],
    compliance:['Claims made responsibly','Participants learn to plan campaigns within platform rules, with clear and accurate claims.']},
  ux:{
    customers:['Journeys customers can complete','Participants learn to research users and redesign sign-up, booking and enquiry journeys so more customers complete them.'],
    growth:['More from existing traffic','Participants learn to find where users drop off and test improvements, so the same traffic can produce more enquiries.'],
    data:['Design decisions backed by testing','Participants learn to run usability tests and act on what users actually do.'],
    docs:['Clearer forms and self-service','Participants learn to simplify forms and information, so customers find answers without calling.'],
    lean:['Fewer avoidable requests','Clearer self-service journeys can reduce the questions a small team has to answer by hand.'],
    coordination:['A shared language for digital work','Participants learn wireframing and prototyping, so business teams and vendors agree on designs before build.'],
    compliance:['Consistent, accessible interfaces','Participants learn design principles that keep interfaces consistent and easier for every customer to use.']},
  cyber:{
    compliance:['PDPA obligations met in daily work','Participants learn how the PDPA applies to everyday handling of personal data, and how to respond when something goes wrong.'],
    customers:['Customer trust protected','Participants learn to protect the client and customer data they handle, which customers and partners increasingly ask about.'],
    lean:['Security that does not rest on one person','When every staff member can spot phishing and handle data safely, a small IT function is not the only line of defence.'],
    data:['Sensitive information kept secure','Participants learn to secure accounts, devices and files, and to assess risk from vendors and insiders.'],
    coordination:['A clear incident response','Participants learn an incident response checklist, so teams know who does what when an incident occurs.'],
    docs:['Safer handling of documents','Participants learn to share, store and dispose of documents in ways that reduce exposure.'],
    growth:['Security that supports business','Demonstrated security practice can support tenders, audits and customer due diligence.']},
  carbon:{
    compliance:['Ready for climate disclosure','Participants learn to report against GRI, ISSB and TCFD and to measure emissions with the GHG Protocol, as disclosure expectations widen.'],
    growth:['Answers to customers’ carbon questions','Participants learn to build a credible emissions inventory, so requests from customers and tenders get a defensible response.'],
    data:['An emissions inventory you can trust','Participants learn to set boundaries, apply emission factors and manage data quality.'],
    customers:['Credible sustainability claims','Participants learn to communicate progress and plans with figures that can be traced and checked.'],
    coordination:['A reduction plan with owners','Participants learn to turn hotspots into prioritised initiatives, with ROI, owners and tracking.'],
    docs:['Reports built on recognised standards','Participants learn the frameworks that sustainability reports and questionnaires draw on.'],
    lean:['Sustainability capability in-house','Building the capability internally can reduce reliance on consultants for routine reporting.']},
  chain:{
    growth:['Opportunities judged on substance','Participants learn how blockchain, tokens and smart contracts work, so opportunities are assessed on their merits.'],
    compliance:['Risks recognised early','Participants learn to assess exchange, custody and smart-contract risks before engaging.'],
    data:['Transactions understood','Participants learn how transactions, wallets and ledgers work.'],
    customers:['Credible client conversations','Participants learn the concepts to discuss digital assets with clients and partners.'],
    docs:['Proposals evaluated clearly','Participants learn to evaluate blockchain proposals with a structured view of use cases and risks.'],
    coordination:['A shared foundation','Teams build a common understanding of blockchain before any project begins.'],
    lean:['Expertise in-house','Core knowledge in-house can reduce reliance on outside advisers for early evaluation.']},
  people:{
    coordination:['Smoother work across teams','Participants learn to communicate, hand over and resolve friction across functions, so work moves with fewer delays.'],
    customers:['Steadier client relationships','Participants learn to listen, adapt their communication and handle difficult conversations with clients and partners.'],
    lean:['Resilient teams under pressure','Participants learn to prioritise, manage pressure and support colleagues, so a lean team stays effective through busy periods.'],
    compliance:['Issues resolved early','Participants learn to address issues early and constructively, before they escalate into complaints or attrition.'],
    growth:['Relationships that bring repeat work','Participants learn to build rapport and trust with clients and partners, which supports referrals and repeat business.'],
    docs:['Clearer messages','Participants learn to structure messages and presentations, so decisions are understood the first time.'],
    data:['Decisions reasoned, not assumed','Participants learn to separate facts from assumptions and find root causes before acting.']}
};
/* course-level overrides, where a people course argues differently */
const COURSE_BENEFITS = {
  gaicc:{customers:['On-brand content that speaks to buyers','Participants learn to turn content briefs into persuasive copy, visuals and short-video concepts tailored to each audience and channel.'],
         docs:['Polished copy and visuals in minutes','Participants learn structured prompting for articles, emails, presentations and visual assets, cutting production time while keeping quality consistent.'],
         growth:['Faster campaign and outreach production','Participants learn to produce multi-format marketing assets in-house, so campaigns and capability materials go live faster.'],
         lean:['More creative output from a lean team','Repeatable no-code content workflows let a small team produce written and visual content across channels without external agency delays.'],
         coordination:['Consistent brand voice across teams','Shared prompt templates and quality checks keep tone, facts and visual style aligned across everyone creating content.']},
  crm:{customers:['Stronger client retention','Participants learn active listening, empathetic communication and follow-up routines that keep clients engaged.'],
       data:['Customer feedback put to use','Participants learn to monitor satisfaction trends and act on feedback before customers drift away.'],
       growth:['More repeat business','Participants learn retention techniques and organised follow-up, so existing clients become a steadier source of business.']},
  pres:{growth:['More persuasive pitches','Participants learn to research the audience and structure a story that wins support for proposals and pitches.'],
        docs:['Clearer presentations','Participants learn to turn dense material into presentations that are clear, memorable and easy to act on.'],
        customers:['Confident client-facing teams','Participants learn confident delivery, body language and tone for client meetings and briefings.']},
  stress:{lean:['Teams that sustain the pace','Participants learn to design and run wellness initiatives that help a busy team manage pressure and avoid burnout.'],
          compliance:['Wellness run within the rules','Participants learn the legislative requirements and privacy obligations that apply to workplace wellness programmes.'],
          coordination:['Feedback that shapes support','Participants learn to gather and analyse employee feedback, so wellness efforts target real gaps.']},
  pg:{lean:['More done, without burnout','Participants learn to analyse work patterns, prioritise and protect focus, so busy staff deliver more without overstretching.'],
      data:['Progress that is tracked','Participants learn to set SMART goals and track progress, so improvement is visible.']},
  ct:{coordination:['Problems solved together, on facts','Participants learn a shared, structured way to separate facts from assumptions and find root causes across teams.'],
      data:['Decisions based on facts','Participants learn to separate facts from assumptions and find root causes before acting.'],
      compliance:['Fewer repeated mistakes','Participants learn root cause analysis and reflection tools that stop the same issue recurring.'],
      docs:['Sharper reasoning in writing','Participants learn to spot weak arguments and logical traps in proposals, reports and recommendations.']},
  lead:{lean:['Focus for a lean team','Participants learn to turn company priorities into SMART team goals and track performance, so a lean team concentrates on what matters most.'],
        growth:['Strategy turned into team results','Participants learn to turn company priorities into SMART team goals and track performance against them.'],
        coordination:['Managers who communicate clearly','Participants learn to choose the right channel and message, so expectations are clear across the team.'],
        data:['Performance tracked, not guessed','Participants learn to benchmark and evaluate team performance and drive continuous improvement.']},
  conflict:{customers:['Calmer handling of complaints','Participants learn de-escalation techniques for tense conversations with clients, partners and the public.'],
            compliance:['Issues caught before they escalate','Participants learn to spot risks early and plan ahead, so small issues do not become formal disputes.']}
};
/* the sentence that closes the executive summary's industry paragraph */
const SOLUTION = {
  ai:'Generative AI can remove much of the drafting and summarising behind that work, freeing teams to focus on {focus}.',
  gaicc:'Generative AI for content creation turns briefs into polished copy, visuals and short videos in minutes, freeing teams to focus on {focus}.',
  auto:'Workflow automation can take on much of the repeatable, multi-step work behind it, freeing teams to focus on {focus}.',
  pathway_ai:'Generative AI removes much of the drafting and summarising, and workflow automation takes on the repeatable steps, freeing teams to focus on {focus}.',
  data:'Stronger data skills can make that reporting faster to produce and easier to trust, so decisions rest on one version of the numbers.',
  mkt:'A structured approach to digital marketing can complement that with a steadier flow of enquiries, measured channel by channel.',
  ux:'User-centred design can make digital journeys easier to complete, turning more visits into enquiries and sign-ups.',
  cyber:'Practical cybersecurity skills across the team can reduce that exposure, so protecting data does not rest on IT alone.',
  carbon:'Carbon measurement and reporting skills in-house can turn that pressure into credible, standards-based disclosures.',
  chain:'A working grasp of blockchain and digital assets helps teams judge opportunities and risks on substance.',
  people:'Stronger people skills can make that work smoother, so teams spend less time on friction and more on {focus}.',
  crm:'Stronger relationship skills can turn that into steadier retention and repeat business.',
  pres:'Clear, confident presentation can help proposals and updates win support the first time.',
  stress:'Well-designed wellness programmes can help teams sustain that pace without burning out.',
  pg:'Better prioritisation and focus can help busy teams deliver more without overstretching.',
  ct:'Structured thinking can help teams solve problems on facts rather than assumptions.',
  lead:'Clear goal setting and communication can help managers turn priorities into team results.',
  conflict:'Calm, structured conflict management can stop small issues from escalating.'
};

/* ---------- Industries ----------
   real: one industry-level statement per theme ("typically" language, never a claim about the client).
   ai: [work handled, what participants practise in Generative AI, what they build in Workflow Automation]. */
const INDUSTRIES = [
  {k:'construction', label:'Construction & engineering', noun:'construction and engineering firms', core:'run on project delivery, site coordination and safety', focus:'projects, clients and site safety', team:'project team',
   real:{
    docs:'Projects typically generate a steady stream of documentation: tenders, method statements, progress reports and correspondence with consultants and subcontractors.',
    coordination:'Work typically spans the office, several sites and many subcontractors, so information has to move quickly and accurately between them.',
    compliance:'Safety, regulatory and contractual requirements typically add checklists, permits and records that must be complete and current.',
    data:'Costs, progress and manpower are typically tracked across several spreadsheets, often rebuilt by hand each reporting cycle.',
    lean:'Project teams are typically lean, with engineers and coordinators spending much of their week on administration.',
    growth:'Winning work typically depends on tender submissions and capability statements prepared under tight deadlines.',
    customers:'Clients and consultants typically expect fast, documented responses to queries, variations and site issues.'},
   ai:[
    ['Tenders and quotations','Draft tender responses and clarifications faster, with pricing and commitments checked by their owner.','Assemble first drafts from approved templates and past submissions, held for review.'],
    ['Method statements and risk assessments','Turn site notes into structured method statements and risk assessments in one format.','Route draft documents to the right reviewer and log each approval.'],
    ['Progress and site reports','Summarise site diaries, photos and minutes into clear weekly progress reports.','Collect site updates into one tracker and draft the weekly report for review.'],
    ['RFIs, variations and correspondence','Draft clear RFIs, variation notices and replies to consultants and subcontractors.','Track open RFIs and send reminders for overdue replies, held for approval.'],
    ['Safety and compliance records','Turn procedures and regulations into checklists and toolbox talk notes.','Flag missing permits or expiring certificates from a register for follow-up.']],
   people:['Coordination between site and office teams','Discussions with subcontractors on scope and schedule','Client and consultant meetings under deadline pressure','Toolbox talks and safety briefings','Hand-overs between project phases and trades'],
   data:['Project cost and budget tracking','Progress against programme','Manpower and equipment utilisation','Safety incident and near-miss trends','Tender win rates and pipeline'],
   mkt:['Capability statements and project portfolios','Company website and LinkedIn presence','Tender pre-qualification material','Case studies of completed projects','Search visibility for specialist services'],
   sensitive:'tender pricing, client drawings and staff records', carbon:'site operations, materials and subcontracted work',
   others:['genai','wfa','da','pbi','carbon','lead','conflict','pres','cyber','ct'], cases:['osm','engie','cdl','govtech']},
  {k:'manufacturing', label:'Manufacturing & industrial', noun:'manufacturers and industrial companies', core:'run on production, quality and dependable supply', focus:'production, quality and customers', team:'operations team',
   real:{
    docs:'Getting products quoted, shipped and sold typically relies on technical documentation: specifications, quotations, certificates and shipping paperwork.',
    compliance:'Quality systems and customer audits typically require procedures, records and corrective actions to be documented consistently.',
    data:'Production, inventory and quality data typically sit in separate systems and spreadsheets, consolidated by hand for reports.',
    coordination:'Orders typically pass between sales, planning, production and logistics, and each hand-off is a chance for delay.',
    customers:'Customers typically expect quick, accurate answers on lead times, specifications and order status.',
    lean:'Engineers and supervisors typically carry significant administration alongside their technical work.',
    growth:'Winning new accounts typically depends on responsive quotations and clear technical material.'},
   ai:[
    ['Quotations and technical specifications','Draft quotations and summarise specifications faster, with figures checked by their owner.','Extract key fields from incoming RFQs into a comparison sheet, flagging exceptions.'],
    ['Standard operating procedures','Turn procedures into step-by-step work instructions and checklists.','Connect an assistant to approved procedures, so answers come from the team’s own documents.'],
    ['Quality reports and corrective actions','Summarise non-conformance findings and draft corrective action reports.','Route corrective actions to owners and send reminders until each is closed.'],
    ['Customer and supplier correspondence','Draft clear replies on lead times, specifications and order status.','Draft routine order-status replies from approved data, held for approval before sending.'],
    ['Production and shift reports','Turn shift notes and figures into consistent daily summaries.','Collect shift data into one tracker and draft the daily summary for review.']],
   people:['Hand-overs between shifts and departments','Coordination between sales, planning and production','Supplier and customer negotiations','Supervising teams on the production floor','Raising and resolving quality issues'],
   data:['Production output and yield','Inventory and stock levels','Quality and defect trends','On-time delivery performance','Cost per unit and margin'],
   mkt:['Product and capability brochures','Website and LinkedIn presence for B2B buyers','Trade show and distributor campaigns','Search visibility for product categories','Case studies with key customers'],
   sensitive:'product designs, pricing and customer orders', carbon:'energy use, materials and logistics',
   others:['genai','wfa','da','pbi','ds','carbon','lead','ct','cyber','conflict'], cases:['osm','engie','cdl','govtech']},
  {k:'logistics', label:'Logistics, shipping & maritime', noun:'logistics, shipping and supply chain businesses', core:'run on reliable movement of goods, tight schedules and many partners', focus:'customers, partners and exceptions', team:'operations team',
   real:{
    coordination:'Shipments typically involve many parties (carriers, agents, warehouses and customers), each needing timely, accurate updates.',
    docs:'Every shipment typically carries documentation: bookings, bills of lading, customs declarations and delivery records.',
    customers:'Customers typically expect fast answers on rates, schedules and shipment status, often outside office hours.',
    data:'Volumes, costs and performance are typically tracked across systems and spreadsheets, consolidated by hand for reports.',
    compliance:'Customs, trade and safety rules typically require accurate documentation and audit trails.',
    lean:'Operations teams typically work to tight margins, so time spent on manual follow-ups is time not spent on exceptions.',
    growth:'Winning business typically depends on quick, accurate quotations and dependable service.'},
   ai:[
    ['Rate quotations and enquiries','Draft quotations and replies to rate and schedule enquiries faster.','Draft routine replies from approved rate sheets, held for approval before sending.'],
    ['Shipment status updates','Turn scattered status emails into one clear summary of what is on time or at risk.','Collect updates into one tracker and flag delays to the owner.'],
    ['Shipping and customs documents','Check documents for missing or inconsistent details before submission.','Extract key fields from incoming documents into a register, flagging exceptions.'],
    ['Partner and carrier correspondence','Draft clear instructions and follow-ups for carriers, agents and warehouses.','Send reminders for overdue confirmations, with each step logged.'],
    ['Operations and performance reports','Draft commentary on weekly volumes and service levels, with figures checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Coordination with carriers, agents and warehouses','Customer escalations on delays','Hand-overs between shifts and stations','Negotiations on rates and service levels','Working across offices and time zones'],
   data:['Shipment volumes and lanes','On-time performance','Cost per shipment and margin','Warehouse utilisation','Customer and carrier performance'],
   mkt:['Service and capability pages','LinkedIn presence for shippers and partners','Search visibility for specialist services','Email campaigns to existing customers','Case studies of complex shipments'],
   sensitive:'customer shipment data, pricing and partner contracts', carbon:'transport, warehousing and fuel use',
   others:['genai','wfa','da','pbi','carbon','crm','conflict','cyber','lead'], cases:['osm','engie','cdl','govtech']},
  {k:'sustainability', label:'Sustainability, energy & environment', noun:'sustainability, energy and environmental businesses', core:'run on technical expertise, regulation and long-term client relationships', focus:'clients, projects and technical work', team:'project team',
   real:{
    compliance:'Work is typically shaped by fast-moving standards and regulation, from carbon reporting to environmental permits.',
    docs:'Projects typically produce technical reports, proposals and client deliverables that must be accurate and well argued.',
    data:'Energy, emissions and environmental data typically come from many sources and must be consolidated and checked.',
    customers:'Clients typically need complex technical findings explained clearly to non-specialists.',
    growth:'Demand is typically growing faster than specialist headcount, so capacity can limit growth.',
    lean:'Specialists typically spend significant time on reporting and administration rather than technical work.',
    coordination:'Projects typically involve consultants, contractors, regulators and client teams working from shared information.'},
   ai:[
    ['Technical reports and deliverables','Draft and structure report sections faster, with technical content verified by the specialist.','Assemble report drafts from approved templates and data, held for specialist review.'],
    ['Proposals and tender responses','Research faster and draft proposals that start from a stronger first version.','Pull relevant past project summaries into a proposal draft for review.'],
    ['Regulations and standards','Summarise new standards and guidance into briefing notes for the team.','Monitor approved sources and draft a weekly digest of changes for review.'],
    ['Data and measurement summaries','Draft commentary on energy and emissions data, with figures checked by their owner.','Collect readings into one sheet and flag gaps or outliers for follow-up.'],
    ['Client communications','Explain technical findings in plain language for different audiences.','Draft routine client updates from project trackers, held for approval.']],
   people:['Explaining technical findings to clients','Coordination with contractors and consultants','Stakeholder engagement on sustainability plans','Leading project teams under deadlines','Presenting recommendations to management'],
   data:['Energy consumption and savings','Emissions by scope and source','Project performance against targets','Monitoring and sensor data','Pipeline and utilisation'],
   mkt:['Thought leadership on sustainability','Website and LinkedIn presence','Case studies of completed projects','Search visibility for specialist services','Event and webinar promotion'],
   sensitive:'client energy data, site information and proposals', carbon:'operations, client projects and supply chains',
   others:['genai','wfa','carbon','da','pbi','ds','pres','dm','cyber'], cases:['engie','osm','govtech','cdl']},
  {k:'trading', label:'Wholesale & trading', noun:'trading and distribution businesses', core:'run on supplier relationships, margins and fast turnaround', focus:'customers, suppliers and margins', team:'sales and operations team',
   real:{
    docs:'Every order typically carries paperwork: quotations, purchase orders, invoices and shipping documents.',
    customers:'Customers typically expect quick quotations and accurate answers on stock, pricing and delivery.',
    data:'Sales, stock and margin data typically live in spreadsheets updated by hand.',
    coordination:'Orders typically pass between sales, purchasing, warehouse and accounts, and each hand-off is a chance for error.',
    lean:'Teams are typically small, with staff covering several roles at once.',
    growth:'Growth typically depends on responding faster than competitors and widening the customer base.',
    compliance:'Trade documentation and product requirements typically need to be accurate for customs and customers.'},
   ai:[
    ['Quotations and price lists','Draft quotations and follow-ups faster, with prices checked by their owner.','Draft routine quotations from approved price lists, held for approval.'],
    ['Supplier correspondence','Draft RFQs and follow-ups, and adapt messages for suppliers in different markets.','Send reminders for overdue supplier replies, held for approval before sending.'],
    ['Product information','Turn supplier specifications into consistent product descriptions.','Extract key fields from supplier documents into a product sheet.'],
    ['Orders and invoices','Check documents for missing or inconsistent details.','Extract order details from emails into a tracker, flagging exceptions.'],
    ['Sales and stock reports','Draft commentary on weekly sales and stock, with figures checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Supplier negotiations','Customer follow-ups and complaints','Coordination between sales and warehouse','Managing a small team covering several roles','Working with overseas partners'],
   data:['Sales by customer and product','Stock levels and turnover','Margins by product line','Supplier lead times','Receivables and payment trends'],
   mkt:['Product catalogue and website','B2B lead generation on LinkedIn','E-commerce and marketplace listings','Email campaigns to existing customers','Search visibility for product categories'],
   sensitive:'pricing, supplier terms and customer data', carbon:'transport, packaging and suppliers',
   others:['genai','wfa','da','pbi','dm','crm','ecom','seo','conflict'], cases:['osm','engie','cdl','govtech']},
  {k:'professional', label:'Professional services (legal, accounting, consulting)', noun:'professional services firms', core:'run on expertise, client trust and billable time', focus:'clients and expert judgement', team:'support team',
   real:{
    docs:'Client work typically produces a high volume of documents: advice, reports, correspondence and file notes.',
    customers:'Clients typically expect fast, accurate responses and clear explanations of complex matters.',
    compliance:'Confidentiality and professional standards typically limit what can go into public AI tools.',
    lean:'Support teams typically serve several partners or practice groups at once.',
    coordination:'Matters typically pass between fee earners, support staff and clients, with deadlines at every step.',
    data:'Time, billing and matter data are typically reviewed by hand to track performance.',
    growth:'Winning work typically depends on proposals, credentials and thought leadership.'},
   ai:[
    ['Client correspondence and file notes','Draft clear correspondence and file notes faster, with advice reviewed by the fee earner.','Draft routine updates from matter trackers, held for review before sending.'],
    ['Research and summaries','Summarise long documents and research into structured briefing notes, checked against the source.','Connect an assistant to approved precedents, so answers come from the firm’s own documents.'],
    ['Proposals and credentials','Draft proposals and credentials that start from a stronger first version.','Pull relevant experience summaries into a proposal draft for review.'],
    ['Templates and checklists','Turn procedures into checklists and consistent templates.','Route documents for review and log each approval.'],
    ['Internal reports','Draft commentary on matter, time and billing figures, checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Supporting several partners or practice groups','Client meetings and difficult conversations','Hand-overs between fee earners and support staff','Deadlines that compete across matters','Developing junior staff'],
   data:['Utilisation and billable hours','Matter profitability','Work in progress and receivables','Client and practice-area trends','Pipeline and proposal win rates'],
   mkt:['Thought leadership and insights','Website and LinkedIn presence','Proposals and credentials','Event and webinar promotion','Search visibility for practice areas'],
   sensitive:'client files, financial records and privileged information', carbon:'offices, travel and client engagements',
   others:['genai','wfa','people','conflict','pres','ct','da','cyber','lead'], cases:['engie','osm','govtech','cdl']},
  {k:'finance', label:'Financial services & insurance', noun:'financial services and insurance businesses', core:'run on trust, regulation and accurate, timely information', focus:'clients, advice and risk', team:'client-facing team',
   real:{
    compliance:'Regulation typically requires accurate records, disclosures and audit trails for client interactions.',
    customers:'Clients typically expect quick, clear answers on products, claims and applications.',
    docs:'Client work typically involves a high volume of documents: proposals, applications, reports and correspondence.',
    data:'Performance, pipeline and portfolio data are typically compiled by hand for management reports.',
    lean:'Advisers and operations teams typically spend significant time on administration rather than clients.',
    coordination:'Cases typically pass between advisers, operations, compliance and partners.',
    growth:'Growth typically depends on adviser productivity and consistent client engagement.'},
   ai:[
    ['Client proposals and summaries','Draft clear summaries and proposals faster, with advice checked by the adviser.','Assemble first drafts from approved product information, held for review.'],
    ['Client enquiries and follow-ups','Draft clear replies and follow-ups in a consistent tone.','Draft routine follow-ups from the client tracker, held for approval before sending.'],
    ['Policy and product documents','Summarise long policy and product documents into plain-language notes.','Connect an assistant to approved product documents, so answers come from approved sources.'],
    ['Compliance checklists','Turn requirements into checklists and consistent file notes.','Flag incomplete files from a register for follow-up.'],
    ['Management reports','Draft commentary on pipeline and performance, with figures checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Client conversations about complex products','Coordination between advisers and operations','Handling complaints and escalations','Coaching and leading adviser teams','Presenting to clients and management'],
   data:['Pipeline and conversion','Portfolio and product performance','Claims and service levels','Client segmentation','Productivity by adviser or team'],
   mkt:['Client education content','Website and LinkedIn presence','Email campaigns to existing clients','Event and seminar promotion','Search visibility for products and services'],
   sensitive:'client financial data, personal information and transaction records', carbon:'offices, operations and financed activities',
   others:['genai','wfa','da','cyber','pbi','crm','pres','dm','chain'], cases:['engie','govtech','osm','cdl']},
  {k:'tech', label:'Technology & IT services', noun:'technology and IT services companies', core:'run on delivery, client trust and technical depth', focus:'clients, delivery and product work', team:'delivery team',
   real:{
    docs:'Projects typically generate proposals, specifications, documentation and status reports alongside the technical work.',
    customers:'Clients typically expect fast, clear answers on tickets, changes and project status.',
    coordination:'Delivery typically spans developers, project managers, vendors and client teams.',
    compliance:'Client data and contracts typically bring security and data protection obligations.',
    lean:'Technical staff typically spend significant time on documentation and reporting.',
    data:'Utilisation, ticket and project data are typically compiled by hand for reports.',
    growth:'Winning work typically depends on responsive proposals and clear technical material.'},
   ai:[
    ['Proposals and statements of work','Draft proposals and statements of work that start from a stronger first version.','Pull relevant past project summaries into a draft for review.'],
    ['Technical documentation','Turn notes and comments into consistent documentation and user guides.','Connect an assistant to approved documentation, so answers come from the team’s own sources.'],
    ['Client updates and status reports','Summarise tickets and threads into clear client updates.','Collect ticket updates into a weekly status report draft for review.'],
    ['Support tickets and enquiries','Draft clear replies to common tickets and enquiries.','Draft routine ticket replies from the knowledge base, held for approval.'],
    ['Internal reports','Draft commentary on utilisation and delivery figures, checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Explaining technical issues to non-technical clients','Coordination between developers and project managers','Vendor and client negotiations','Leading project teams under deadlines','Presenting solutions to decision-makers'],
   data:['Utilisation and billable hours','Ticket volumes and resolution times','Project delivery against plan','Recurring revenue and churn','Pipeline and win rates'],
   mkt:['Product and service pages','LinkedIn presence and thought leadership','Search visibility for solutions','Email nurture campaigns','Case studies and client stories'],
   sensitive:'client systems, source code and personal data', carbon:'data centres, devices and offices',
   others:['wfa','genai','cyber','ds','ux','pbi','pres','lead','da'], cases:['govtech','engie','cdl','osm']},
  {k:'retail', label:'Retail & consumer brands', noun:'retail and consumer businesses', core:'run on customer experience, merchandising and tight margins', focus:'customers, products and stores', team:'marketing and operations team',
   real:{
    customers:'Customers typically expect quick, consistent answers across stores, websites and messaging apps.',
    growth:'Growth typically depends on visibility online and on turning browsers into buyers.',
    docs:'Teams typically produce a steady flow of product descriptions, promotions and customer communications.',
    data:'Sales, stock and customer data typically sit across POS, e-commerce and spreadsheets.',
    coordination:'Head office, stores, suppliers and online channels typically need to work from the same information.',
    lean:'Store and head-office teams are typically lean, with staff covering several roles.',
    compliance:'Customer data, promotions and product claims typically carry regulatory obligations.'},
   ai:[
    ['Product descriptions and listings','Draft consistent product descriptions and listings faster.','Generate listing drafts from product data, held for review before publishing.'],
    ['Customer enquiries and reviews','Draft clear replies to enquiries and reviews in the brand’s tone.','Draft routine replies from approved FAQs, held for approval before sending.'],
    ['Promotions and campaign copy','Draft campaign copy and variations for different channels.','Assemble campaign drafts from a brief and approved assets for review.'],
    ['Store procedures and training notes','Turn procedures into checklists and training notes for store teams.','Connect an assistant to approved procedures, so staff get answers from one source.'],
    ['Sales and stock reports','Draft commentary on weekly sales and stock, with figures checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Customer complaints and difficult conversations','Coordination between stores and head office','Leading store teams through peak periods','Supplier and landlord negotiations','Onboarding new staff'],
   data:['Sales by store, channel and product','Stock levels and sell-through','Promotion performance','Customer purchase patterns','Staffing against footfall'],
   mkt:['Social media and content','Paid social and search campaigns','Email and loyalty campaigns','E-commerce and marketplace listings','Local search visibility'],
   sensitive:'customer data, payment information and supplier terms', carbon:'stores, logistics and packaging',
   others:['dm','genai','ecom','da','seo','gyt','crm','ux','wfa'], cases:['cdl','engie','osm','govtech']},
  {k:'fnbsupply', label:'F&B manufacturing, supply & distribution', noun:'food and beverage suppliers', core:'run on consistent product quality, reliable supply and responsive service', focus:'customers, product quality and service', team:'operations team',
   real:{
    coordination:'Orders typically pass between sales, production, warehouse, technical service and accounts, and each hand-off is a chance for error.',
    compliance:'Food safety and certification standards typically require consistent records, checklists and audit trails.',
    docs:'Every account typically carries paperwork: quotations, purchase orders, delivery orders, invoices and service reports.',
    customers:'Trade customers such as cafés, hotels and offices typically expect quick answers on supply, equipment and servicing.',
    lean:'Teams are typically small, with staff covering several roles at once.',
    data:'Sales, stock and service data typically sit in accounting software and spreadsheets, compiled by hand for reports.',
    growth:'Growth typically depends on widening the trade customer base and keeping existing accounts supplied and serviced.'},
   ai:[
    ['Orders and delivery documents','Check orders, delivery orders and invoices for missing or inconsistent details.','Extract order details from emails into a tracker, flagging exceptions.'],
    ['Customer and service enquiries','Draft clear replies on supply, equipment and servicing requests in a consistent tone.','Draft routine replies from approved information, held for approval before sending.'],
    ['Food safety and quality records','Turn procedures into checklists and summarise records ahead of audits.','Connect an assistant to approved procedures, so staff get answers from one source.'],
    ['Supplier and brand correspondence','Draft orders and follow-ups for overseas suppliers and brand partners.','Send reminders for overdue supplier confirmations, with each step logged.'],
    ['Sales, stock and finance reports','Draft commentary on sales, stock and receivables, with figures checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Trade customer follow-ups and complaints','Coordination between sales, warehouse and service teams','Supplier and brand partner negotiations','Managing a small team covering several roles','Onboarding new staff quickly'],
   data:['Sales by customer and product','Stock levels and turnover','Service jobs and response times','Receivables and payment trends','Product quality and wastage'],
   mkt:['Product catalogue and website','B2B lead generation on LinkedIn','E-commerce and marketplace listings','Email campaigns to trade customers','Social media and content'],
   sensitive:'pricing, supplier terms, customer and payroll data', carbon:'roasting, transport, packaging and suppliers',
   others:['wfa','da','pbi','gaicc','crm','conflict','lead','carbon','dm'], cases:['osm','engie','cdl','govtech']},
  {k:'fnb', label:'Food & beverage and hospitality', noun:'food and beverage and hospitality businesses', core:'run on service, consistency and fast-moving operations', focus:'guests, service and operations', team:'operations team',
   real:{
    customers:'Guests typically expect quick responses on bookings, enquiries and feedback across many channels.',
    coordination:'Outlets, kitchens, suppliers and head office typically need to stay aligned on fast-changing information.',
    compliance:'Food safety, licensing and workplace safety typically require consistent checklists and records.',
    lean:'Teams are typically stretched across shifts, so time on administration is time away from guests.',
    docs:'Operations typically generate procedures, menus, training material and supplier correspondence.',
    data:'Sales, wastage and labour data are typically tracked in spreadsheets across outlets.',
    growth:'Growth typically depends on visibility online, reviews and repeat visits.'},
   ai:[
    ['Guest enquiries and reviews','Draft clear, on-brand replies to enquiries and reviews.','Draft routine replies from approved information, held for approval before sending.'],
    ['Procedures and training material','Turn procedures into checklists and training notes for outlet teams.','Connect an assistant to approved procedures, so staff get answers from one source.'],
    ['Menus and promotions','Draft menu descriptions and promotion copy for different channels.','Assemble promotion drafts from a brief, held for review.'],
    ['Supplier correspondence','Draft orders, follow-ups and supplier communications faster.','Send reminders for overdue confirmations, with each step logged.'],
    ['Outlet reports','Draft commentary on sales, wastage and labour, with figures checked by their owner.','Collect outlet figures into one sheet and draft a weekly summary.']],
   people:['Guest complaints and service recovery','Hand-overs between shifts','Coordination between kitchen and front of house','Leading teams through peak periods','Onboarding new staff quickly'],
   data:['Sales by outlet and daypart','Food cost and wastage','Labour against sales','Guest feedback trends','Menu item performance'],
   mkt:['Social media and content','Reviews and local search visibility','Paid social campaigns','Email and loyalty programmes','Delivery platform listings'],
   sensitive:'guest data, payment information and supplier terms', carbon:'energy, food waste and supply chains',
   others:['dm','genai','crm','conflict','people','da','stress','seo','wfa'], cases:['cdl','engie','osm','govtech']},
  {k:'healthcare', label:'Healthcare & life sciences', noun:'healthcare and life sciences organisations', core:'run on patient trust, quality and regulation', focus:'patients, quality and specialist work', team:'operations team',
   real:{
    compliance:'Patient data and healthcare regulation typically limit what information can go into public AI tools.',
    docs:'Teams typically produce reports, procedures, letters and documentation alongside clinical or scientific work.',
    customers:'Patients and clients typically expect clear, timely communication.',
    lean:'Specialists typically spend significant time on administration rather than patient or scientific work.',
    data:'Operational and quality data are typically compiled by hand for reports.',
    coordination:'Care and projects typically involve many teams, partners and hand-overs.',
    growth:'Growth typically depends on service quality, referrals and reputation.'},
   ai:[
    ['Non-clinical reports and documentation','Draft and structure reports faster, with content verified by the specialist.','Assemble report drafts from approved templates, held for review.'],
    ['Procedures and SOPs','Turn procedures into step-by-step checklists and consistent SOPs.','Connect an assistant to approved SOPs, so answers come from approved sources.'],
    ['Patient and client communications','Draft clear, plain-language letters and information sheets for review.','Draft routine appointment and follow-up messages, held for approval.'],
    ['Research and literature summaries','Summarise literature and guidance into briefing notes, checked against the source.','Monitor approved sources and draft a digest of updates for review.'],
    ['Operational reports','Draft commentary on service and quality figures, checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Communicating with patients and families','Hand-overs between shifts and teams','Coordination across departments','Handling complaints and difficult conversations','Leading teams under pressure'],
   data:['Patient volumes and waiting times','Service quality indicators','Staffing and utilisation','Inventory of consumables','Feedback and complaint trends'],
   mkt:['Patient education content','Website and local search visibility','Social media presence','Referral partner communications','Event and health talk promotion'],
   sensitive:'patient records, health data and staff information', carbon:'facilities, energy and supply chains',
   others:['genai','wfa','da','cyber','people','stress','conflict','pbi','crm'], cases:['engie','govtech','osm','cdl']},
  {k:'education', label:'Education & childcare', noun:'education and childcare providers', core:'run on care, learning outcomes and parent trust', focus:'children, learners and parents', team:'centre team',
   real:{
    docs:'Educators typically produce lesson plans, observations, reports and parent communications alongside teaching.',
    customers:'Parents and learners typically expect timely, personal updates.',
    lean:'Teaching and care staff are typically stretched, with administration competing for time with learners.',
    compliance:'Licensing, child safety and data protection typically require consistent records.',
    coordination:'Centres, teachers and head office typically need to share information consistently.',
    data:'Enrolment, attendance and progress data are typically tracked in spreadsheets.',
    growth:'Enrolment typically depends on reputation, referrals and visibility online.'},
   ai:[
    ['Lesson plans and activities','Draft lesson plans and activity ideas faster, adapted by the educator.','Assemble plan drafts from approved curriculum templates for review.'],
    ['Observations and progress reports','Turn observation notes into clear, consistent progress reports.','Collect observation notes into one tracker for report drafting.'],
    ['Parent communications','Draft clear, warm updates and newsletters for parents.','Draft routine notices from the calendar, held for approval before sending.'],
    ['Policies and procedures','Turn policies into checklists and staff guides.','Connect an assistant to approved policies, so staff get answers from one source.'],
    ['Centre and enrolment reports','Draft commentary on enrolment and attendance figures, checked by their owner.','Schedule a monthly report that pulls the latest data and drafts a summary.']],
   people:['Conversations with parents','Coordination between centres and head office','Supporting new educators','Managing workload during peak periods','Teamwork across classrooms'],
   data:['Enrolment and waitlists','Attendance patterns','Learning progress','Staffing ratios','Enquiry-to-enrolment conversion'],
   mkt:['Social media and content for parents','Website and local search visibility','Open house and event promotion','Email updates to prospective families','Reviews and referrals'],
   sensitive:'children’s records, parent data and staff information', carbon:'centres, transport and supplies',
   others:['genai','people','stress','dm','pg','conflict','pres','da','wfa'], cases:['cdl','engie','osm','govtech']},
  {k:'property', label:'Real estate & facilities management', noun:'real estate and facilities management businesses', core:'run on assets, tenants and service delivery', focus:'tenants, assets and service', team:'property team',
   real:{
    customers:'Tenants and owners typically expect fast responses to requests, feedback and issues.',
    coordination:'Work typically involves contractors, vendors, tenants and owners, each needing timely updates.',
    docs:'Operations typically produce reports, notices, tenders and correspondence every week.',
    compliance:'Safety, maintenance and regulatory requirements typically need consistent records.',
    data:'Occupancy, maintenance and energy data are typically compiled by hand for reports.',
    lean:'Property and facilities teams are typically lean across several sites.',
    growth:'Growth typically depends on tenant retention and winning new mandates.'},
   ai:[
    ['Tenant and owner communications','Draft clear notices, replies and updates faster.','Draft routine replies from approved information, held for approval before sending.'],
    ['Maintenance and inspection reports','Turn inspection notes and photos into consistent reports.','Collect work orders into one tracker and flag overdue items.'],
    ['Tenders and vendor management','Draft tender documents and compare vendor submissions.','Extract key terms from vendor quotations into a comparison sheet.'],
    ['Procedures and checklists','Turn procedures into checklists for site teams.','Connect an assistant to approved procedures, so answers come from one source.'],
    ['Monthly property reports','Draft commentary on occupancy, maintenance and energy, checked by their owner.','Schedule a monthly report that pulls the latest data and drafts a summary.']],
   people:['Tenant complaints and difficult conversations','Coordination with contractors and vendors','Hand-overs between sites and shifts','Owner and management meetings','Leading site teams'],
   data:['Occupancy and leasing','Maintenance response times','Energy and utility use','Service levels by vendor','Operating costs by property'],
   mkt:['Listings and property marketing','Social media and content','Website and local search visibility','Email campaigns to tenants and owners','Case studies of managed properties'],
   sensitive:'tenant data, access systems and contracts', carbon:'buildings, energy and waste',
   others:['genai','wfa','carbon','da','crm','conflict','cyber','pbi','lead'], cases:['cdl','engie','osm','govtech']},
  {k:'association', label:'Associations, non-profits & public sector', noun:'associations and non-profit organisations', core:'run on members, stakeholders and limited resources', focus:'members, programmes and stakeholders', team:'secretariat',
   real:{
    lean:'Teams are typically lean, with most colleagues covering several functions.',
    docs:'Work typically produces a steady flow of reports, proposals, minutes and communications.',
    customers:'Members and stakeholders typically expect timely, relevant communication.',
    data:'Member, event and programme data are typically held in spreadsheets and compiled by hand.',
    coordination:'Programmes typically involve committees, partners, sponsors and volunteers.',
    compliance:'Governance and data protection typically require accurate records and careful data handling.',
    growth:'Growth typically depends on member value, events and visibility.'},
   ai:[
    ['Reports, minutes and papers','Turn meeting notes into clear minutes and papers faster.','Collect action items from minutes into a tracker with reminders.'],
    ['Member communications','Draft newsletters, notices and replies to member enquiries.','Draft routine replies from approved FAQs, held for approval before sending.'],
    ['Proposals and grant applications','Draft proposals and applications that start from a stronger first version.','Pull approved programme information into application drafts for review.'],
    ['Event materials','Draft event copy, programmes and follow-ups.','Automate registrations, reminders and follow-ups, with checks before sending.'],
    ['Programme and membership reports','Draft commentary on membership and programme figures, checked by their owner.','Schedule a monthly report that pulls the latest data and drafts a summary.']],
   people:['Working with committees and volunteers','Stakeholder and sponsor relationships','Member enquiries and feedback','Coordinating events with partners','Leading a small team across functions'],
   data:['Membership and renewals','Event registrations and attendance','Programme outcomes','Engagement with communications','Funding and budgets'],
   mkt:['Member communications and newsletters','Event promotion','Website and social media presence','Search visibility','Sponsor and partner content'],
   sensitive:'member data, donor information and governance records', carbon:'events, offices and travel',
   others:['genai','wfa','ux','dm','da','cyber','pres','people'], cases:['govtech','engie','osm','cdl']},
  {k:'general', label:'Other / cross-industry', noun:'growing businesses', core:'run on their people, their customers and how quickly work moves', focus:'customers and higher-value work', team:'team',
   real:{
    docs:'Teams typically produce a steady flow of documents: proposals, reports, correspondence and procedures.',
    lean:'Teams are typically lean, with staff covering several roles.',
    customers:'Customers typically expect fast, accurate and consistent responses.',
    data:'Performance data typically sit in several spreadsheets and systems, compiled by hand for reports.',
    coordination:'Work typically passes between teams, partners and customers, and each hand-off is a chance for delay.',
    compliance:'Data protection and industry requirements typically shape how information is handled.',
    growth:'Growth typically depends on responding faster and serving customers better than competitors.'},
   ai:[
    ['Proposals and reports','Draft proposals and reports that start from a stronger first version.','Assemble first drafts from approved templates, held for review.'],
    ['Customer correspondence','Draft clear replies and follow-ups in a consistent tone.','Draft routine replies from approved information, held for approval before sending.'],
    ['Meeting notes and summaries','Turn notes and long threads into structured summaries and action lists.','Collect action items into a tracker and send reminders.'],
    ['Procedures and checklists','Turn procedures into checklists and consistent templates.','Connect an assistant to approved procedures, so answers come from one source.'],
    ['Management reports','Draft commentary on the figures, checked by their owner.','Schedule a weekly report that pulls the latest data and drafts a summary.']],
   people:['Hand-overs between teams','Customer conversations and complaints','Meetings with partners and suppliers','Leading teams under pressure','Onboarding new colleagues'],
   data:['Sales and pipeline','Operational performance','Customer trends','Costs and margins','Team productivity'],
   mkt:['Website and search visibility','Social media presence','Email campaigns','Case studies and content','Paid campaigns'],
   sensitive:'customer data, financial records and internal documents', carbon:'operations, energy and supply chains',
   others:['genai','wfa','da','dm','cyber','pres','lead','pbi','ux'], cases:['engie','osm','cdl','govtech']}
];

/* ---------- Published case studies (quotes verbatim from the live pages; GovTech checked 14 Oct 2026) ----------
   fams: course families the story speaks to, used to suggest it first. topic: the line beside its name in the picker. */
const CASES = {
  osm:{name:'OSM Thome Singapore', sector:'Industrial and shipping', url:'https://verticalinstitute.com/corporate-training-case-studies-osm-thome-singapore/',
       what:'50 employees trained in three cohorts, with 32 hours of hands-on sessions built around their day-to-day roles. The programme is now being extended to more employees.',
       why:'It began with a first phase before extending the programme, the same pilot-then-extend path we recommend.',
       quote:'“This training not only strengthened our digital capabilities, it also equipped participants with a practical understanding of Generative AI, how it can be responsibly leveraged to enhance productivity and decision-making…”',
       who:'OSM Thome Singapore', fams:['ai','auto'], topic:'Generative AI · 50 staff'},
  engie:{name:'ENGIE South East Asia', sector:'Low-carbon energy', url:'https://verticalinstitute.com/corporate-training-case-studies-engie-south-east-asia/',
       what:'A two-day customised, in-person programme for a marketing team of more than 10, covering prompt engineering, workflow automation and AI-assisted campaign analysis.',
       why:'It began with a single team and a programme customised to its work, as this proposal does.',
       quote:'“My colleagues and I have started applying the frameworks and tools shared, particularly in prompt engineering and workflow automation.”',
       who:'Zann Chua, Regional Head of Marketing and Communications', fams:['ai','auto','mkt'], topic:'AI for a marketing team'},
  cdl:{name:'City Developments Limited', sector:'Property', url:'https://verticalinstitute.com/corporate-training-case-studies-city-development-limited/',
       what:'300 employees across multiple teams, trained through a customised cybersecurity programme.',
       why:'A large organisation that rolled out customised training across many teams with one partner.',
       quote:'“Very informative session with an expert trainer who delivered real-world insights and interactive discussions. The structured approach made complex concepts easy to grasp, and I now feel more confident integrating the skills that I have learnt into my team’s processes!”',
       who:'City Developments Limited', fams:['cyber'], topic:'Cybersecurity · 300 staff'},
  govtech:{name:'GovTech Singapore', sector:'Public sector', url:'https://verticalinstitute.com/corporate-training-case-studies-govtech-singapore/',
       what:'More than 190 staff trained through a customised data analytics programme on data storytelling and data-informed decision-making.',
       why:'It built data capability across the organisation in phases, with hands-on training customised to its own goals.',
       quote:'“The customised content, hands-on training, and expert feedback empowered our teams…”',
       who:'GovTech Singapore', fams:['data'], topic:'Data analytics · 190+ staff'}
};
const CASE_KEYS = Object.keys(CASES);
const BUILTIN_CASE_KEYS = CASE_KEYS.slice();

/* Success stories added by hand in the builder. They live on the proposal as S.customCases and are merged into
   CASES by syncCustomCases(), so the slide, the picker and the hosted deck all treat them like the built-in four. */
const CUSTOM_CASE_MAX = 8;
const CASE_LIMITS = {name:60, sector:36, url:300, what:280, why:200, quote:340, who:90};
function cleanCustomCases(list){
  const out = [], seen = new Set();
  (Array.isArray(list) ? list : []).forEach(raw => {
    if (!raw || typeof raw !== 'object' || out.length >= CUSTOM_CASE_MAX) return;
    const c = {};
    Object.keys(CASE_LIMITS).forEach(f => { c[f] = String(raw[f] == null ? '' : raw[f]).replace(/\s+/g, ' ').trim().slice(0, CASE_LIMITS[f]); });
    if (c.url && !/^https?:\/\//i.test(c.url)) c.url = 'https://' + c.url;
    if (c.url && !/^https?:\/\/[^\s"<>]+\.[^\s"<>]+$/i.test(c.url)) c.url = '';
    if (!c.name || !c.what) return;
    let id = typeof raw.id === 'string' && /^x_[a-z0-9]{3,24}$/.test(raw.id) && !seen.has(raw.id) ? raw.id : '';
    if (!id) id = 'x_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + out.length;
    seen.add(id);
    out.push(Object.assign({id}, c));
  });
  return out;
}
function syncCustomCases(S){
  CASE_KEYS.splice(BUILTIN_CASE_KEYS.length).forEach(k => { delete CASES[k]; });
  (S && Array.isArray(S.customCases) ? S.customCases : []).forEach(c => {
    if (!c || !c.id || CASES[c.id]) return;
    const q = c.quote ? (/^[“"]/.test(c.quote) ? c.quote : '“' + c.quote + '”') : '';
    CASES[c.id] = {name:c.name, sector:c.sector || 'Client story', url:c.url || '', what:c.what, why:c.why || '', quote:q, who:c.who || c.name, fams:[], topic:c.sector || 'Your own story', custom:true};
    CASE_KEYS.push(c.id);
  });
}
const C = Object.fromEntries(COURSES.map(c => [c.k, c]));
const IND = Object.fromEntries(INDUSTRIES.map(i => [i.k, i]));


