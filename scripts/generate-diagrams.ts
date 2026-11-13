import fs from 'fs';
import path from 'path';

const DIAGRAMS_DIR = path.resolve(process.cwd(), 'public/diagrams');

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface BoxOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: string[];
  accent?: string;
  fill?: string;
  badge?: string;
}

function box({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  accent = '#38bdf8',
  fill = '#111827',
  badge,
}: BoxOpts): string {
  const cx = x + w / 2;
  const lineH = 16;
  const titleY = badge ? y + 36 : y + 26;
  const linesStartY = titleY + 20;

  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${accent}" stroke-width="1.5" />
    <rect x="${x}" y="${y}" width="${w}" height="4" rx="2" fill="${accent}" />
    ${
      badge
        ? `<rect x="${x + 12}" y="${y + 10}" width="${Math.min(w - 24, badge.length * 6.8 + 16)}" height="16" rx="4" fill="${accent}" fill-opacity="0.16" />
           <text x="${x + 20}" y="${y + 21}" fill="${accent}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" font-weight="700" letter-spacing="0.6">${esc(badge)}</text>`
        : ''
    }
    <text x="${cx}" y="${titleY}" text-anchor="middle" fill="#f8fafc" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">${esc(title)}</text>
    ${lines
      .map(
        (line, idx) =>
          `<text x="${cx}" y="${linesStartY + idx * lineH}" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">${esc(line)}</text>`
      )
      .join('\n    ')}
  </g>`;
}

function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label?: string,
  color = '#64748b',
  dashed = false
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 6;
  return `
  <g>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${
      dashed ? 'stroke-dasharray="5,4"' : ''
    } marker-end="url(#arrow-${color.replace('#', '')})" />
    ${
      label
        ? `<rect x="${mx - (label.length * 3.5 + 8)}" y="${my - 11}" width="${label.length * 7 + 16}" height="15" rx="4" fill="#090d16" stroke="${color}" stroke-opacity="0.4" stroke-width="1" />
           <text x="${mx}" y="${my}" text-anchor="middle" fill="#cbd5e1" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="9.5" font-weight="600">${esc(label)}</text>`
        : ''
    }
  </g>`;
}

function svgShell(title: string, subtitle: string, body: string): string {
  const markerColors = ['64748b', '38bdf8', 'd92338', '34d399', 'fbbf24'];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420" role="img" aria-label="${esc(title)}">
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" stroke-width="0.6" stroke-opacity="0.45" />
    </pattern>
    ${markerColors
      .map(
        c => `
    <marker id="arrow-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#${c}" />
    </marker>`
      )
      .join('')}
  </defs>
  <rect width="800" height="420" rx="14" fill="#090d16" />
  <rect width="800" height="420" rx="14" fill="url(#grid)" />
  <rect x="0.75" y="0.75" width="798.5" height="418.5" rx="14" fill="none" stroke="#1e293b" stroke-width="1.5" />

  <!-- Header -->
  <rect x="24" y="18" width="6" height="34" rx="3" fill="#d92338" />
  <text x="40" y="34" fill="#f8fafc" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="16" font-weight="800">${esc(title)}</text>
  <text x="40" y="51" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">${esc(subtitle)}</text>
  <text x="774" y="36" text-anchor="end" fill="#64748b" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" font-weight="700">CYBERAISECURE.COM</text>

  ${body}
</svg>
`;
}

const diagrams: Record<string, string> = {
  'php2shell-pre-exec-flow.svg': svgShell(
    'PHP2Shell Pre-Execution Memory Corruption Flow',
    'CVE-2026-109618 (OOM Bailout) & CVE-2026-109619 (RFC 1867 UAF) before app code runs',
    [
      box({
        x: 32,
        y: 165,
        w: 165,
        h: 98,
        badge: 'INGRESS',
        title: 'HTTP Multipart Request',
        lines: ['Unauthenticated POST', 'Crafted MIME headers', 'stream timing payload'],
        accent: '#fbbf24',
      }),
      arrow(197, 214, 240, 214, 'SAPI', '#fbbf24'),
      box({
        x: 240,
        y: 155,
        w: 165,
        h: 118,
        badge: 'PRE-EXECUTION',
        title: 'PHP Engine Lifecycle',
        lines: ['Runs BEFORE index.php', 'ini_set() bypassed', 'mod_php / PHP-FPM'],
        accent: '#38bdf8',
      }),
      arrow(405, 190, 455, 130, 'OOM', '#d92338'),
      arrow(405, 238, 455, 295, 'RFC 1867', '#d92338'),
      box({
        x: 455,
        y: 82,
        w: 170,
        h: 98,
        badge: 'CVE-2026-109618',
        title: 'OOM longjmp() Bailout',
        lines: ['Partial struct init', 'Shutdown reads stale', 'Control-flow hijack'],
        accent: '#d92338',
      }),
      box({
        x: 455,
        y: 245,
        w: 170,
        h: 98,
        badge: 'CVE-2026-109619',
        title: 'Upload Progress UAF',
        lines: ['zval -> $_SESSION', 'Premature free race', 'Cross-request poison'],
        accent: '#d92338',
      }),
      arrow(625, 130, 665, 190, '', '#d92338'),
      arrow(625, 295, 665, 238, '', '#d92338'),
      box({
        x: 665,
        y: 165,
        w: 108,
        h: 98,
        badge: 'IMPACT',
        title: 'Pre-Exec RCE',
        lines: ['www-data shell', 'No auth needed', 'CVSS 9.2 (KEV)'],
        accent: '#d92338',
        fill: '#1f1018',
      }),
    ].join('')
  ),

  'php2shell-defense-topology.svg': svgShell(
    'PHP2Shell Defense-in-Depth Hardening Topology',
    'Layered compensating controls across Edge WAF, php.ini, FPM Worker Pools, and systemd',
    [
      box({
        x: 28,
        y: 120,
        w: 170,
        h: 190,
        badge: 'LAYER 1: EDGE',
        title: 'WAF & Origin Cloak',
        lines: ['Block direct origin IP', 'Drop multipart on API', 'Return HTTP 415 early', 'Allow WAF CIDR only'],
        accent: '#38bdf8',
      }),
      arrow(198, 215, 228, 215, '', '#38bdf8'),
      box({
        x: 228,
        y: 120,
        w: 170,
        h: 190,
        badge: 'LAYER 2: ENGINE',
        title: 'Global php.ini',
        lines: ['upload_progress = Off', 'fatal_backtraces = Off', 'max_input_nesting = 32', 'post_max_size = 8M'],
        accent: '#34d399',
      }),
      arrow(398, 215, 428, 215, '', '#34d399'),
      box({
        x: 428,
        y: 120,
        w: 170,
        h: 190,
        badge: 'LAYER 3: WORKER',
        title: 'FPM & systemd',
        lines: ['pm.max_requests = 1', 'Flush heap per request', 'MemoryMax = 512M', 'MemorySwapMax = 0'],
        accent: '#fbbf24',
      }),
      arrow(598, 215, 628, 215, '', '#34d399'),
      box({
        x: 628,
        y: 120,
        w: 144,
        h: 190,
        badge: 'LAYER 4: PATCH',
        title: 'Runtime Upgrade',
        lines: ['PHP 8.5.12 / 8.4.27', 'PHP 8.3.36 / 8.2.35', 'Rebuild containers', 'Restart FPM RAM'],
        accent: '#34d399',
        fill: '#0f1f1c',
      }),
      `<text x="400" y="368" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Post-Patch Rule: Rotate .env / DB secrets &amp; inspect SIGSEGV / OOM logs under Assume Breach</text>`,
    ].join('')
  ),

  'mcp-trust-boundary.svg': svgShell(
    'MCP Trust Boundary & JSON-RPC 2.0 Architecture',
    'How untrusted external tool metadata merges into privileged LLM context windows',
    [
      `<rect x="28" y="84" width="320" height="250" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-opacity="0.45" stroke-dasharray="6,4" />`,
      `<text x="44" y="106" fill="#38bdf8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" font-weight="700">HOST APPLICATION / IDE</text>`,
      box({
        x: 46,
        y: 126,
        w: 130,
        h: 112,
        badge: 'REASONING',
        title: 'LLM Engine',
        lines: ['Treats descriptions', 'as system directives', 'Plans tool calls'],
        accent: '#38bdf8',
      }),
      box({
        x: 204,
        y: 126,
        w: 126,
        h: 112,
        badge: 'ORCHESTRATOR',
        title: 'MCP Client',
        lines: ['Issues tools/list', 'Injects JSON schemas', 'Routes tools/call'],
        accent: '#38bdf8',
      }),
      arrow(176, 182, 204, 182, '', '#38bdf8'),
      `<line x1="400" y1="80" x2="400" y2="355" stroke="#d92338" stroke-width="2" stroke-dasharray="6,5" />`,
      `<rect x="336" y="362" width="128" height="22" rx="5" fill="#d92338" fill-opacity="0.2" stroke="#d92338" />`,
      `<text x="400" y="377" text-anchor="middle" fill="#fda4af" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" font-weight="700">TRUST BOUNDARY</text>`,
      arrow(330, 182, 466, 182, 'JSON-RPC 2.0', '#d92338'),
      box({
        x: 466,
        y: 112,
        w: 150,
        h: 140,
        badge: 'MCP SERVER NODE',
        title: 'Tool Manifest & Exec',
        lines: ['STDIO / Stream HTTP', 'tools/list metadata', 'tools/call handlers', '82% path traversal risk'],
        accent: '#fbbf24',
      }),
      arrow(616, 152, 650, 128, '', '#fbbf24'),
      arrow(616, 212, 650, 240, '', '#fbbf24'),
      box({
        x: 650,
        y: 88,
        w: 124,
        h: 82,
        title: 'Local Filesystem',
        lines: ['~/.ssh/id_rsa', '.env & local secrets'],
        accent: '#d92338',
      }),
      box({
        x: 650,
        y: 198,
        w: 124,
        h: 82,
        title: 'Internal DB & APIs',
        lines: ['GitHub / Prod SQL', 'Cloud IAM tokens'],
        accent: '#d92338',
      }),
      `<text x="188" y="295" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10.5">Untrusted prose inside tools/list shares context with trusted tools</text>`,
    ].join('')
  ),

  'mcp-tool-poisoning-kill-chain.svg': svgShell(
    'MCP Tool Poisoning & Silent Rug Pull Kill Chain',
    'Escalation from MCP03 metadata injection to cross-tool pivoting (ASI02) and exfiltration',
    [
      box({
        x: 32,
        y: 115,
        w: 215,
        h: 195,
        badge: 'STAGE 1: MCP03 / MCP04',
        title: 'Context & Manifest Poison',
        lines: ['Hidden prompt inside', 'tools/list description', 'OR npx/uvx silent update', 'altering prose after review', '(Bypasses SAST / SCA)'],
        accent: '#fbbf24',
      }),
      arrow(247, 212, 292, 212, 'Hijacks LLM', '#d92338'),
      box({
        x: 292,
        y: 115,
        w: 215,
        h: 195,
        badge: 'STAGE 2: ASI02 MISUSE',
        title: 'Cross-Tool Pivoting',
        lines: ['Poisoned tool need not run', 'LLM invokes trusted', 'internal read_file / SQL', 'Reads ~/.ssh/id_rsa & .env', '78.3% multi-server ASR'],
        accent: '#d92338',
      }),
      arrow(507, 212, 552, 212, 'Encodes', '#d92338'),
      box({
        x: 552,
        y: 115,
        w: 215,
        h: 195,
        badge: 'STAGE 3: ASI01 EXFIL',
        title: 'Silent Data Exfiltration',
        lines: ['Base64-encodes credentials', 'Passes secrets into', "optional 'audit_context'", 'Suppresses user notice', 'Attacker captures secrets'],
        accent: '#d92338',
        fill: '#1f1018',
      }),
      `<text x="400" y="362" text-anchor="middle" fill="#34d399" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Defense: Pin canonical tools/list SHA-256 hashes + scan prose signatures in MCP Gateway</text>`,
    ].join('')
  ),

  'mcp-zero-trust-lifecycle.svg': svgShell(
    'Zero Trust 5-Pillar Lifecycle for Autonomous AI Agents',
    'Mapping OWASP Agentic Top 10 (ASI01–ASI10) and OWASP MCP Top 10 controls into production',
    [
      box({
        x: 24,
        y: 120,
        w: 136,
        h: 190,
        badge: '1. IDENTITY',
        title: 'Managed NHI',
        lines: ['Unique agent ID', 'Short-lived OAuth2.1', 'Zero shared PATs', 'Audience scoped'],
        accent: '#38bdf8',
      }),
      arrow(160, 215, 178, 215, '', '#38bdf8'),
      box({
        x: 178,
        y: 120,
        w: 136,
        h: 190,
        badge: '2. VERIFY',
        title: 'Registry & GW',
        lines: ['Pin tools/list SHA', 'Heuristic scanner', 'Inline MCP Gateway', 'Schema validation'],
        accent: '#34d399',
      }),
      arrow(314, 215, 332, 215, '', '#34d399'),
      box({
        x: 332,
        y: 120,
        w: 136,
        h: 190,
        badge: '3. ACCESS',
        title: 'Least Agency',
        lines: ['Rootless container', 'Read-only rootfs', 'Deny egress default', 'Isolate local tools'],
        accent: '#fbbf24',
      }),
      arrow(468, 215, 486, 215, '', '#fbbf24'),
      box({
        x: 486,
        y: 120,
        w: 136,
        h: 190,
        badge: '4. MONITOR',
        title: 'AIBOM & Logs',
        lines: ['Discover shadow MCP', 'Sequence telemetry', 'Token/step breakers', 'Immutable audit'],
        accent: '#38bdf8',
      }),
      arrow(622, 215, 640, 215, '', '#d92338'),
      box({
        x: 640,
        y: 120,
        w: 136,
        h: 190,
        badge: '5. RESPONSE',
        title: 'HITL & Kill',
        lines: ['Out-of-band consent', 'Raw arg review UI', 'Step-up MFA gate', 'Instant NHI revoke'],
        accent: '#d92338',
      }),
      `<text x="400" y="365" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Principle of Least Agency: Bound what an autonomous agent can execute without human sign-off</text>`,
    ].join('')
  ),

  'enterprise-ai-firewall-gateway.svg': svgShell(
    'Enterprise AI Security Gateway & Permission-Aware RAG',
    'Defending 2026 OWASP LLM01 (Prompt Injection) & LLM03 (Excessive Agency)',
    [
      box({
        x: 28,
        y: 155,
        w: 145,
        h: 112,
        badge: 'USER + SSO',
        title: 'Enterprise User',
        lines: ['Authenticated via', 'Corporate IdP / SSO', 'DLP Browser Guard'],
        accent: '#38bdf8',
      }),
      arrow(173, 211, 208, 211, '', '#38bdf8'),
      box({
        x: 208,
        y: 112,
        w: 185,
        h: 198,
        badge: 'AI FIREWALL GATEWAY',
        title: 'Inline Inspection',
        lines: ['1. PII & Secret Redaction', '2. Semantic Override Scan', '3. Workload IAM Token', '   (Scoped to Agent NHI,', '    never user root token)'],
        accent: '#34d399',
      }),
      arrow(393, 165, 438, 130, 'Filtered Query', '#34d399'),
      arrow(393, 255, 438, 290, 'Tool Request', '#fbbf24'),
      box({
        x: 438,
        y: 84,
        w: 175,
        h: 98,
        badge: 'PERMISSION-AWARE RAG',
        title: 'Vector DB ACL Check',
        lines: ['Enforce doc/row ACLs', 'BEFORE LLM retrieval', 'Tenant isolation'],
        accent: '#38bdf8',
      }),
      box({
        x: 438,
        y: 238,
        w: 175,
        h: 98,
        badge: 'CIRCUIT BREAKER',
        title: 'External Tool Guard',
        lines: ['Verify auth outside LLM', 'Block unapproved actions', 'Require HITL approval'],
        accent: '#d92338',
      }),
      arrow(613, 133, 648, 185, '', '#38bdf8'),
      arrow(613, 287, 648, 235, '', '#fbbf24'),
      box({
        x: 648,
        y: 155,
        w: 126,
        h: 112,
        badge: 'SIEM AUDIT',
        title: 'Isolated Agent',
        lines: ['Least-privilege', 'execution log', 'Safe response'],
        accent: '#34d399',
      }),
    ].join('')
  ),

  'linux-least-privilege-layers.svg': svgShell(
    'Linux Defense-in-Depth Least Privilege Layers',
    '4 independent kernel & user-space containment barriers against privilege escalation',
    [
      box({
        x: 28,
        y: 118,
        w: 170,
        h: 190,
        badge: '1. PERIMETER',
        title: 'SSH & Firewall',
        lines: ['PermitRootLogin no', 'Key-only auth', 'nftables default-deny', 'Admin ports localhost'],
        accent: '#38bdf8',
      }),
      arrow(198, 213, 224, 213, '', '#38bdf8'),
      box({
        x: 224,
        y: 118,
        w: 170,
        h: 190,
        badge: '2. DELEGATION',
        title: 'Hardened visudo',
        lines: ['Scoped Cmnd_Alias', 'Exact binary args', 'Defaults!CMD noexec', 'Blocks !/bin/sh escape'],
        accent: '#fbbf24',
      }),
      arrow(394, 213, 420, 213, '', '#fbbf24'),
      box({
        x: 420,
        y: 118,
        w: 170,
        h: 190,
        badge: '3. SERVICE SANDBOX',
        title: 'systemd Drop-In',
        lines: ['User=www-data', 'NoNewPrivileges=yes', 'ProtectSystem=strict', 'CAP_NET_BIND_SERVICE'],
        accent: '#34d399',
      }),
      arrow(590, 213, 616, 213, '', '#34d399'),
      box({
        x: 616,
        y: 118,
        w: 156,
        h: 190,
        badge: '4. KERNEL MAC',
        title: 'SELinux / AppArmor',
        lines: ['Confines compromised', 'processes at kernel', 'Blocks /etc/shadow', 'even if uid=0'],
        accent: '#d92338',
      }),
      `<text x="400" y="366" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">All auth, sudo, and MAC policy denials stream continuously to centralized SIEM</text>`,
    ].join('')
  ),

  'ai-vishing-oob-verification.svg': svgShell(
    'Out-of-Band (OOB) Verification Against AI Phishing & Vishing',
    'Shifting high-risk authorization from spoofable voice/video to FIDO2 cryptography',
    [
      box({
        x: 28,
        y: 96,
        w: 170,
        h: 110,
        badge: 'UNTRUSTED CHANNEL',
        title: 'Incoming Request',
        lines: ['Voice clone call /', 'Polymorphic email /', 'Deepfake video'],
        accent: '#d92338',
      }),
      arrow(198, 151, 232, 151, 'Check Action', '#fbbf24'),
      box({
        x: 232,
        y: 96,
        w: 175,
        h: 110,
        badge: 'POLICY GATE',
        title: 'Critical Operation?',
        lines: ['Wire / Vendor bank', 'Admin MFA reset', 'Halt primary channel'],
        accent: '#fbbf24',
      }),
      arrow(407, 151, 444, 151, 'YES -> OOB', '#38bdf8'),
      box({
        x: 444,
        y: 96,
        w: 170,
        h: 110,
        badge: 'STEP 1: DIRECTORY',
        title: 'Independent Callback',
        lines: ['Use internal directory', 'NEVER caller number', 'Secondary channel'],
        accent: '#38bdf8',
      }),
      arrow(614, 151, 646, 151, '', '#38bdf8'),
      box({
        x: 646,
        y: 96,
        w: 128,
        h: 110,
        badge: 'STEP 2: CRYPTO',
        title: 'FIDO2 Token',
        lines: ['Hardware key', 'IdP assertion', 'No SMS / Voice'],
        accent: '#34d399',
      }),
      arrow(710, 206, 710, 250, 'Verified', '#34d399'),
      arrow(529, 206, 529, 250, 'Failed', '#d92338'),
      box({
        x: 432,
        y: 250,
        w: 165,
        h: 98,
        badge: 'INCIDENT',
        title: 'Quarantine & Alert',
        lines: ['Notify SOC immediately', 'Freeze target account'],
        accent: '#d92338',
        fill: '#1f1018',
      }),
      box({
        x: 616,
        y: 250,
        w: 158,
        h: 98,
        badge: 'DUAL CUSTODY',
        title: '2-Person Sign-Off',
        lines: ['Separate devices', 'Execute transaction'],
        accent: '#34d399',
        fill: '#0f1f1c',
      }),
      box({
        x: 28,
        y: 250,
        w: 375,
        h: 98,
        badge: 'EMAIL AUTHENTICATION BASELINE',
        title: 'Cryptographic Channel Hygiene',
        lines: ['Enforce DMARC p=reject + SPF + DKIM on all domains', 'Hardware FIDO2 WebAuthn mandatory for finance & IT'],
        accent: '#38bdf8',
      }),
    ].join('')
  ),

  'ctem-five-stage-pipeline.svg': svgShell(
    'CTEM 5-Stage Lifecycle & EPSS + CISA KEV Triage',
    'Replacing alert-fatigue CVSS spreadsheets with exploitability & attack-path validation',
    [
      box({
        x: 24,
        y: 92,
        w: 138,
        h: 115,
        badge: 'STAGE 1',
        title: 'Scoping',
        lines: ['Define crown jewels', 'Map critical egress', 'Business context'],
        accent: '#38bdf8',
      }),
      arrow(162, 149, 178, 149, '', '#38bdf8'),
      box({
        x: 178,
        y: 92,
        w: 138,
        h: 115,
        badge: 'STAGE 2',
        title: 'Discovery',
        lines: ['CVEs + Cloud drift', 'Exposed secrets', 'Shadow IT / DNS'],
        accent: '#38bdf8',
      }),
      arrow(316, 149, 332, 149, '', '#fbbf24'),
      box({
        x: 332,
        y: 92,
        w: 138,
        h: 115,
        badge: 'STAGE 3',
        title: 'Prioritization',
        lines: ['CISA KEV match', 'EPSS > 0.40 score', 'Internet exposure'],
        accent: '#fbbf24',
      }),
      arrow(470, 149, 486, 149, '', '#34d399'),
      box({
        x: 486,
        y: 92,
        w: 138,
        h: 115,
        badge: 'STAGE 4',
        title: 'Validation',
        lines: ['Simulate attack path', 'Verify reachability', 'Drop false positives'],
        accent: '#34d399',
      }),
      arrow(624, 149, 640, 149, '', '#34d399'),
      box({
        x: 640,
        y: 92,
        w: 136,
        h: 115,
        badge: 'STAGE 5',
        title: 'Mobilization',
        lines: ['P0: 24h SLA (KEV)', 'P1: Current sprint', 'Risk velocity KPI'],
        accent: '#34d399',
      }),
      box({
        x: 24,
        y: 238,
        w: 240,
        h: 120,
        badge: 'P0: IMMEDIATE BREACH RISK',
        title: 'In CISA KEV + Internet-Facing',
        lines: ['Active exploitation confirmed', 'Direct external reachability', 'SLA: Remediate within 24 hours'],
        accent: '#d92338',
        fill: '#1f1018',
      }),
      box({
        x: 280,
        y: 238,
        w: 240,
        h: 120,
        badge: 'P1: HIGH PROBABILITY',
        title: 'KEV Internal OR EPSS > 40%',
        lines: ['High 30-day exploit forecast', 'Lateral pivot potential', 'SLA: Remediate current sprint'],
        accent: '#fbbf24',
      }),
      box({
        x: 536,
        y: 238,
        w: 240,
        h: 120,
        badge: 'P2 / P3: CONTEXTUAL TRIAGE',
        title: 'High CVSS Without Exploit',
        lines: ['Validate compensating controls', 'Avoid developer alert fatigue', 'Schedule in normal backlog'],
        accent: '#38bdf8',
      }),
    ].join('')
  ),

  'pqc-hybrid-migration-roadmap.svg': svgShell(
    'Post-Quantum Migration Roadmap & Hybrid TLS Defense',
    'Neutralizing Harvest Now, Decrypt Later (HNDL) using NIST FIPS 203, 204 & 205',
    [
      box({
        x: 28,
        y: 88,
        w: 744,
        h: 76,
        badge: 'IMMEDIATE THREAT: HARVEST NOW, DECRYPT LATER (HNDL)',
        title: 'RSA / ECC Ciphertext Intercepted Today -> Decrypted Retroactively by CRQC (Shor Algorithm)',
        lines: ['Any 5–10+ year sensitive data (IP, healthcare, financial) transmitted over classical-only TLS is already at risk'],
        accent: '#d92338',
        fill: '#1f1018',
      }),
      box({
        x: 28,
        y: 196,
        w: 170,
        h: 168,
        badge: 'PHASE 1: DISCOVER',
        title: 'CBOM Inventory',
        lines: ['Scan repos & HSMs', 'CycloneDX-CBOM', 'Flag RSA/ECC/DH', 'Rank data shelf-life'],
        accent: '#38bdf8',
      }),
      arrow(198, 280, 222, 280, '', '#38bdf8'),
      box({
        x: 222,
        y: 196,
        w: 170,
        h: 168,
        badge: 'PHASE 2: TRANSIT',
        title: 'Hybrid Key Exchange',
        lines: ['X25519 + ML-KEM-768', 'FIPS 203 KEM at edge', 'Breaks neither classical', 'nor lattice alone'],
        accent: '#34d399',
      }),
      arrow(392, 280, 416, 280, '', '#34d399'),
      box({
        x: 416,
        y: 196,
        w: 170,
        h: 168,
        badge: 'PHASE 3: IDENTITY',
        title: 'Upgrade PKI',
        lines: ['FIPS 204 (ML-DSA)', 'FIPS 205 (SLH-DSA)', 'Handle larger keys', 'Update CAs & signing'],
        accent: '#fbbf24',
      }),
      arrow(586, 280, 610, 280, '', '#fbbf24'),
      box({
        x: 610,
        y: 196,
        w: 162,
        h: 168,
        badge: 'PHASE 4: DESIGN',
        title: 'Crypto-Agility',
        lines: ['Abstract cipher APIs', 'Config-driven suites', 'Zero hardcoded RSA', 'Fast algorithm swap'],
        accent: '#38bdf8',
      }),
    ].join('')
  ),

  'github-actions-hardened-pipeline.svg': svgShell(
    'Hardened GitHub Actions CI/CD Security Architecture',
    'Eliminating mutable tag hijacking, excessive permissions, and static cloud secrets',
    [
      box({
        x: 28,
        y: 120,
        w: 155,
        h: 185,
        badge: 'REPO CONTROLS',
        title: 'Protected Branch',
        lines: ['Signed GPG/SSH', '2 CODEOWNER reviews', 'Fork PR gate enabled', 'No pull_request_target'],
        accent: '#38bdf8',
      }),
      arrow(183, 212, 213, 212, '', '#38bdf8'),
      box({
        x: 213,
        y: 120,
        w: 175,
        h: 185,
        badge: 'WORKFLOW BASELINE',
        title: 'Zero Default Perms',
        lines: ['permissions: {} global', '40-char Commit SHAs', 'Dependabot SHA PRs', 'persist-creds: false'],
        accent: '#fbbf24',
      }),
      arrow(388, 212, 418, 212, '', '#fbbf24'),
      box({
        x: 418,
        y: 120,
        w: 165,
        h: 185,
        badge: 'JOB 1: SAST AUDIT',
        title: 'Semgrep & SCA',
        lines: ['contents: read', 'security-events: write', 'Pinned action SHA', 'Gate merge on pass'],
        accent: '#34d399',
      }),
      arrow(583, 212, 613, 212, 'OIDC JWT', '#34d399'),
      box({
        x: 613,
        y: 120,
        w: 160,
        h: 185,
        badge: 'JOB 2: DEPLOY',
        title: 'Ephemeral OIDC',
        lines: ['id-token: write only', 'Short-lived AWS STS', 'Zero static IAM keys', 'Branch-scoped trust'],
        accent: '#34d399',
        fill: '#0f1f1c',
      }),
      `<text x="400" y="365" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Even if a build dependency leaks env vars, ephemeral OIDC tokens expire and cannot pivot</text>`,
    ].join('')
  ),

  'ztna-overlay-microsegmentation.svg': svgShell(
    'Identity-First ZTNA Overlay Replacing Legacy Flat VPNs',
    'Point-to-point WireGuard tunnels gated by FIDO2 IdP and continuous device posture',
    [
      box({
        x: 28,
        y: 88,
        w: 744,
        h: 72,
        badge: 'LEGACY FLAT VPN ANTI-PATTERN (AVOID)',
        title: 'Single VPN Breach -> Broad Subnet Lateral Movement Across Staging, DBs & Admin Panels',
        lines: ['No device health verification · Static IP firewall drift · Over-privileged contractor subnet access'],
        accent: '#d92338',
        fill: '#1f1018',
      }),
      box({
        x: 28,
        y: 196,
        w: 175,
        h: 170,
        badge: '1. IDENTITY',
        title: 'FIDO2 / WebAuthn IdP',
        lines: ['Okta / Workspace', 'Hardware YubiKey MFA', 'No SMS / push bombs', 'Group role claims'],
        accent: '#38bdf8',
      }),
      arrow(203, 281, 232, 281, '', '#38bdf8'),
      box({
        x: 232,
        y: 196,
        w: 180,
        h: 170,
        badge: '2. POSTURE GATE',
        title: 'Device Compliance',
        lines: ['Disk encryption ON', 'Supported OS patch', 'Active EDR agent', 'Revoke on posture fail'],
        accent: '#fbbf24',
      }),
      arrow(412, 281, 444, 281, 'ACL Eval', '#34d399'),
      box({
        x: 444,
        y: 196,
        w: 155,
        h: 170,
        badge: '3. MESH OVERLAY',
        title: 'WireGuard ZTNA',
        lines: ['Dark internal ports', 'No public VPN IP', 'Declarative JSON ACL', 'mTLS service auth'],
        accent: '#34d399',
      }),
      arrow(599, 230, 628, 224, 'db-admins', '#34d399'),
      arrow(599, 281, 628, 281, 'devs', '#38bdf8'),
      arrow(599, 332, 628, 338, 'contractors', '#fbbf24'),
      box({
        x: 628,
        y: 196,
        w: 144,
        h: 50,
        title: 'tag:prod-db:5432',
        accent: '#d92338',
      }),
      box({
        x: 628,
        y: 256,
        w: 144,
        h: 50,
        title: 'tag:staging:443',
        accent: '#38bdf8',
      }),
      box({
        x: 628,
        y: 316,
        w: 144,
        h: 50,
        title: 'tag:wiki:443',
        accent: '#fbbf24',
      }),
    ].join('')
  ),

  'dual-llm-indirect-injection-defense.svg': svgShell(
    'Dual-LLM Architecture Against Indirect Prompt Injection',
    'Physically isolating untrusted RAG/PDF/email parsing from privileged tool execution',
    [
      box({
        x: 28,
        y: 140,
        w: 150,
        h: 140,
        badge: 'UNTRUSTED DATA',
        title: 'External Inputs',
        lines: ['Support tickets', 'White-on-white PDFs', 'Email HTML footers', 'RAG web scrapes'],
        accent: '#d92338',
      }),
      arrow(178, 210, 216, 210, 'Raw Text', '#d92338'),
      box({
        x: 216,
        y: 120,
        w: 175,
        h: 180,
        badge: 'SANDBOXED TIER',
        title: 'Quarantined LLM',
        lines: ['ZERO tool access', 'ZERO DB / API creds', 'Extracts facts ONLY', 'Outputs typed schema', 'Cannot invoke actions'],
        accent: '#fbbf24',
      }),
      arrow(391, 210, 426, 210, 'Symbolic Vars', '#34d399'),
      box({
        x: 426,
        y: 135,
        w: 145,
        h: 150,
        badge: 'DETERMINISTIC',
        title: 'Policy Controller',
        lines: ['Non-LLM code', 'Validates schema', 'Drops imperatives', 'Enforces authz'],
        accent: '#38bdf8',
      }),
      arrow(571, 210, 606, 210, 'Clean Facts', '#34d399'),
      box({
        x: 606,
        y: 120,
        w: 168,
        h: 180,
        badge: 'EXECUTION TIER',
        title: 'Privileged LLM',
        lines: ['Evaluates clean facts', 'Never sees raw doc', 'Scoped tool calls', 'HITL gate for high', 'impact mutations'],
        accent: '#34d399',
        fill: '#0f1f1c',
      }),
      `<text x="400" y="364" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Hidden instructions inside documents cannot reach tool-calling privileges across the air gap</text>`,
    ].join('')
  ),

  'ai-supply-chain-verification-gate.svg': svgShell(
    'AI Model Supply Chain Verification & AIBOM Gate',
    'Blocking Pickle RCE, verifying provenance, and testing alignment before inference',
    [
      box({
        x: 24,
        y: 120,
        w: 138,
        h: 185,
        badge: 'UNTRUSTED HUB',
        title: 'Model Artifact',
        lines: ['Hugging Face repo', 'Open-weights LLM', 'Fine-tuned LoRA', 'Dataset / weights'],
        accent: '#fbbf24',
      }),
      arrow(162, 212, 182, 212, '', '#fbbf24'),
      box({
        x: 182,
        y: 120,
        w: 140,
        h: 185,
        badge: '1. FORMAT GATE',
        title: 'Block .pkl Files',
        lines: ['Deny __reduce__ RCE', 'Mandate .safetensors', 'PyTorch weights_only', 'Zero-copy tensors'],
        accent: '#d92338',
      }),
      arrow(322, 212, 342, 212, '', '#38bdf8'),
      box({
        x: 342,
        y: 120,
        w: 140,
        h: 185,
        badge: '2. SCANNER',
        title: 'ModelScan Audit',
        lines: ['Inspect bytecode', 'Detect OS/net calls', 'Block HIGH severity', 'SIEM audit logging'],
        accent: '#38bdf8',
      }),
      arrow(482, 212, 502, 212, '', '#34d399'),
      box({
        x: 502,
        y: 120,
        w: 138,
        h: 185,
        badge: '3. PROVENANCE',
        title: 'CycloneDX AIBOM',
        lines: ['SHA-256 weight hash', 'Dataset lineage', 'Dependency-Track', 'Signed attestation'],
        accent: '#34d399',
      }),
      arrow(640, 212, 660, 212, '', '#34d399'),
      box({
        x: 660,
        y: 120,
        w: 116,
        h: 185,
        badge: '4. SANDBOX',
        title: 'Red-Team Gate',
        lines: ['Probe backdoors', 'Trojan triggers', 'Alignment checks', 'Approve deploy'],
        accent: '#34d399',
        fill: '#0f1f1c',
      }),
      `<text x="400" y="364" text-anchor="middle" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Treat ML weights as executable software artifacts governed by OWASP LLM &amp; NIST AI RMF</text>`,
    ].join('')
  ),
};

if (!fs.existsSync(DIAGRAMS_DIR)) {
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

for (const [filename, svg] of Object.entries(diagrams)) {
  fs.writeFileSync(path.join(DIAGRAMS_DIR, filename), svg, 'utf-8');
}

console.log(`[diagrams] Generated ${Object.keys(diagrams).length} static SVG diagrams in public/diagrams/`);
