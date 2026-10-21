import { GuideArticle } from '../types';

export const GUIDES_DATA: GuideArticle[] = [
  {
    id: 'guide-modern-automation-stack',
    slug: 'modern-ai-automation-stack',
    title: 'The Modern AI Automation Stack: Orchestrating n8n, Claude & Webhooks',
    subtitle:
      'A practical architectural guide for moving beyond naive single-prompt automations into deterministic, event-driven pipelines.',
    category: 'Automation',
    readTime: '6 min read',
    date: 'Oct 2026',
    author: {
      name: 'Elena Rostova',
      role: 'Staff Systems Architect, Nexcoma Research',
    },
    coverImage: '/src/assets/images/guide_automation_stack_1792460178419.jpg',
    excerpt:
      'Why production automation fails when relying on brittle prompt chains, and how combining self-hosted node orchestrators with structured outputs creates fault-tolerant workflows.',
    keyTakeaways: [
      'Deconstruct complex tasks into small atomic deterministic steps instead of monolith prompts.',
      'Always enforce JSON Schema validation on model outputs before passing data down the pipeline.',
      'Use webhooks and queues to decouple long-running inference jobs from client response times.',
      'Audit token spend and retry budgets at the workflow orchestration layer.',
    ],
    contentSections: [
      {
        heading: '01. The Fallacy of the Monolithic Agent Prompt',
        body: [
          'In early 2024, the predominant impulse was to give a single LLM a 2,000-word prompt, a basket of tools, and hope it navigated a multi-stage workflow flawlessly. In production, this approach consistently falls prey to compounding error rates. If each sub-decision carries a 95% success probability, a five-step chain drops to a 77% completion rate.',
          'Modern automation architectures treat foundation models as probabilistic reasoning micro-nodes embedded within a strictly deterministic directed acyclic graph (DAG). Self-hosted platforms like n8n combined with model APIs provide the ideal blend of code execution, retry logic, and intelligence.',
        ],
        highlightQuote:
          'Determinism in control flow, probability in understanding. Never reverse the two.',
      },
      {
        heading: '02. Implementing Strict Schema Enforcements',
        body: [
          'The single most effective reliability upgrade for any AI automation is structured output enforcement. Never parse freeform text using regular expressions when downstream database writes or API mutations depend on the outcome.',
          'By leveraging native tool-calling and structured JSON schema schemas, n8n nodes can guarantee that fields like "urgency_score", "customer_intent", and "extracted_action_items" always match your backend database types exactly.',
        ],
      },
      {
        heading: '03. Event Queuing and Retry Strategies',
        body: [
          'API rate limits and temporary outages are facts of life. A production automation pipeline must decouple incoming webhooks from model invocation using a message broker or persistent workflow queue.',
          'When Anthropic or OpenAI returns a 429 or 503 status code, your automation engine should execute exponential backoff with jitter rather than failing the customer interaction. n8n provides built-in node retry parameters that allow zero-code resilience.',
        ],
      },
    ],
  },
  {
    id: 'guide-cursor-copilot-claude-code',
    slug: 'cursor-vs-copilot-vs-claude-code',
    title: 'Cursor vs Copilot vs Claude Code: An Engineer’s Evaluation',
    subtitle:
      'Benchmarking full-codebase context, multi-file refactoring, terminal interaction, and developer cognitive load.',
    category: 'Coding',
    readTime: '8 min read',
    date: 'Sep 2026',
    author: {
      name: 'Marcus Chen',
      role: 'Principal Engineer & Tooling Specialist',
    },
    coverImage: '/src/assets/images/hero_nexcoma_workspace_1792460178035.jpg',
    excerpt:
      'We tested the three leading coding assistants across a 150,000-line TypeScript codebase on three tasks: architectural refactoring, subtle concurrency bug isolation, and greenfield scaffolding.',
    keyTakeaways: [
      'Cursor leads on whole-codebase awareness thanks to client-side vector indexing and Composer mode.',
      'GitHub Copilot retains the advantage in enterprise compliance, zero data retention governance, and PR integration.',
      'Claude Code terminal-native agent provides superior multi-step bash debugging and script test execution.',
      'The optimal setup frequently pairs an IDE assistant for fast edits with a terminal agent for autonomous test verification.',
    ],
    contentSections: [
      {
        heading: '01. Evaluation Criteria & Test Bed',
        body: [
          'To measure developer velocity without bias, we ran standardized trials across three common developer tasks in a distributed TypeScript and PostgreSQL monorepo. We measured not just output generation speed, but subsequent human review time and cognitive fatigue.',
          'An assistant that writes 200 lines in 3 seconds is counterproductive if an engineer must spend 15 minutes checking for hallucinated variable names or broken interface contracts.',
        ],
        highlightQuote:
          'Velocity is not how fast code is typed; it is how fast accurate code is merged to main.',
      },
      {
        heading: '02. Context Indexing: The Differentiator',
        body: [
          'The greatest leap forward in developer tools is whole-codebase indexing. Cursor creates local embeddings of your project file tree, enabling the assistant to recall related utility functions, schemas, and type definitions without manual @file mentions.',
          'While traditional GitHub Copilot previously operated on open tabs alone, recent updates have closed the gap, though Cursor’s multi-file Composer remains the gold standard for coordinated refactoring across API routes and frontend components.',
        ],
      },
      {
        heading: '03. Recommendations for Engineering Teams',
        body: [
          'For solo developers and high-growth startups, Cursor offers the highest raw iteration speed. For enterprise organizations with strict corporate IP boundaries and SOC2 requirements, GitHub Copilot Business or Enterprise remains the safest standard.',
        ],
      },
    ],
  },
  {
    id: 'guide-local-llm-vs-cloud-apis',
    slug: 'local-llm-deployments-vs-cloud-apis',
    title: 'Local LLMs vs Cloud APIs: Hardware Economics & Privacy Analysis',
    subtitle:
      'When does running Ollama or vLLM on dedicated Apple Silicon or local GPU clusters make financial and operational sense?',
    category: 'Research',
    readTime: '7 min read',
    date: 'Aug 2026',
    author: {
      name: 'Sarah K. Lindqvist',
      role: 'Infrastructure & Privacy Researcher',
    },
    coverImage: '/src/assets/images/guide_local_llms_1792460178776.jpg',
    excerpt:
      'A candid look at the total cost of ownership: token pricing, hardware amortization, electricity consumption, and regulatory data sovereignty.',
    keyTakeaways: [
      'High-throughput internal document processing hits breakeven on local hardware within 4 to 6 months.',
      'For complex reasoning and frontier code analysis, commercial APIs remain vastly superior in token economics and capability.',
      'Local models completely eliminate HIPAA, GDPR, and trade-secret exfiltration risks for proprietary internal workflows.',
      'Unified memory architecture on Apple Mac Studio (M2/M3/M4 Ultra) has transformed personal local inference.',
    ],
    contentSections: [
      {
        heading: '01. The Hardware Cost Equation',
        body: [
          'A modern 70B parameter open-weight model quantized to 4-bit requires roughly 40GB of VRAM to run comfortably with a reasonable context window. On server GPUs (like Nvidia A100 or H100), cloud rental costs roughly $2 to $4 per hour.',
          'In contrast, desktop workstations equipped with 128GB of unified memory offer a compelling one-time capital expense ($4,000–$6,000) that can process millions of sensitive documents over a 3-year lifecycle with negligible per-token marginal costs.',
        ],
        highlightQuote:
          'Local AI is not just about cost savings; it is about cryptographic ownership of your reasoning substrate.',
      },
      {
        heading: '02. Latency, Throughput and Cold Starts',
        body: [
          'Commercial APIs (Claude 3.7, GPT-4o) benefit from massive speculative decoding clusters, reaching 70 to 120 tokens per second. Local setups with single GPUs typically reach 20 to 35 tokens per second.',
          'However, local models have zero network hops, zero internet dependency, and predictable response times unaffected by public API traffic spikes or global cloud outages.',
        ],
      },
    ],
  },
];
