import React from 'react';
import { BookOpen, Copy } from 'lucide-react';

const CodeBlock = ({ title, code, language = 'javascript' }: { title?: string; code: string; language?: string }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="mt-4 mb-6 group">
            {title && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-t-xl border-b-0">
                    <span className="font-mono text-xs text-neon-primary font-bold uppercase tracking-wider">{title}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-600 font-mono uppercase">{language}</span>
                        <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors">
                            {copied ? <Copy className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            )}
            <pre className="p-5 bg-black/80 border border-white/10 rounded-b-xl overflow-x-auto text-xs text-gray-300 font-mono leading-relaxed group-hover:border-white/20 transition-colors max-h-[500px] overflow-y-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const DocSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gradient-gold drop-shadow-gold mb-4 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-400/80" />
            {title}
        </h2>
        <div className="text-gray-400 text-sm leading-relaxed">{children}</div>
    </div>
);

export const SdkReference: React.FC = () => {
    const anonpayExample = `{
  "merchant": "mn1...",
  "generated_at": "2026-03-21T09:10:24.522Z",
  "invoices": [
    { "name": "basic-tdust", "type": "multipay", "amount": 1, "currency": "TDUST", "label": "", "hash": "766402152790...6498623field", "salt": "526143310320...48436field" },
    { "name": "support-any", "type": "donation", "amount": null, "currency": "ANY", "label": "dsfbh", "hash": "38901376877...1623field", "salt": "64965075528...31428field" }
  ]
}`;

    const nodeInit = `import path from 'path';
import { AnonPay } from '@anonpay/node';

const client = new AnonPay({
  secretKey: process.env.ANONPAY_SK,
  projectRoot: __dirname,
  configPath: path.join(__dirname, 'anonpay.json')
});`;

    const createSession = `const session = await client.checkout.sessions.create({
  anonpay_invoice_name: 'basic-usdcx',
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel'
});
console.log(session.checkout_url);`;

    return (
        <div className="space-y-6">
            <DocSection title="What is anonpay.json?">
                <p className="mb-3">
                    A developer manifest containing your merchant address and pre-generated invoices (amount, currency, hash + salt).<br /><br />
                    The SDK uses <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">fs</code> under the hood to automatically look for this file in your project's root. If you don't use the CLI wizard to generate it, you can completely fallback to creating this file manually! Just replicate the schema below and input the hashes and salts you generated from your own smart contract interactions.
                </p>
                <p className="mb-3">
                    <span className="text-gradient-gold drop-shadow-gold font-semibold">anonpay.json is optional</span>; use it for named pre-generated invoices, or skip it and create sessions directly with <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">amount</code>, <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">currency</code>, and <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">type</code>.
                </p>
                <p className="mb-3">
                    On Vercel or similar serverless platforms, prefer passing <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">projectRoot</code> and <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">configPath</code> into the SDK constructor so <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">anonpay.json</code> lookup is deterministic.
                </p>
                <CodeBlock title="Schema / Example anonpay.json" code={anonpayExample} language="json" />
            </DocSection>

            <DocSection title="CLI: `anonpay sdk onboard`">
                <p className="mb-3">Interactive wizard that authenticates with your AnonPay secret key, generates salts, submits invoices to the relayer, polls for invoice hash resolution, and writes `anonpay.json`.</p>
                <div className="mb-4 rounded-xl border border-orange-400/20 bg-orange-500/10 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300 mb-1">Relayed By AnonPay</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                        The CLI and Node SDK fallback flow can ask the AnonPay relayer to create invoice mappings on-chain for you. The relayer wallet submits that invoice-creation transaction and covers the network fee for that setup step.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <div className="text-xs text-gray-400 mb-2">Key behaviors</div>
                        <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                            <li>Generates salts with crypto.randomBytes(16) bigint + 'field'</li>
                            <li>Submits invoice to relayer: <code className="text-neon-primary">/dps/relayer/create-invoice</code></li>
                            <li>AnonPay relayer signs and pays the invoice-creation network fee</li>
                            <li>Polls Provable mapping to resolve invoice hash</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <div className="text-xs text-gray-400 mb-2">Runtime note</div>
                        <p className="text-sm text-gray-300">If you use serverless hosting, pass `projectRoot` and `configPath` so the SDK resolves `anonpay.json` from the exact backend folder.</p>
                    </div>
                </div>
            </DocSection>

            <DocSection title="Node SDK: @anonpay/node">
                <p className="mb-3">Lightweight server-side client to create checkout sessions, retrieve sessions, and verify webhook signatures.</p>
                <p className="mb-3">
                    If you create a checkout session without an existing <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">invoice_hash</code> or <code className="text-white bg-white/5 py-0.5 px-1.5 rounded font-mono text-xs">salt</code>, the SDK can fall back to the same relayed invoice-creation path and let AnonPay handle that setup transaction for you.
                </p>
                <CodeBlock title="Initialize client" code={nodeInit} language="ts" />
                <CodeBlock title="Create session (lookup by anonpay.json name)" code={createSession} language="ts" />
            </DocSection>

            <DocSection title="Webhooks & Signature Verification">
                <p className="mb-3">The SDK provides HMAC-SHA256 verification helpers. Use `webhooks.constructEvent(payload, signature)` to verify and parse events server-side.</p>
            </DocSection>

            <DocSection title="Where to find files in repo">
                <ul className="text-sm text-gray-300 list-disc pl-5">
                    <li><a className="text-neon-primary" href="/docs/anonpay_sdk.md">docs/anonpay_sdk.md</a> — consolidated doc</li>
                    <li><a className="text-neon-primary" href="/packages/anonpay-cli/src/commands/onboard.ts">packages/anonpay-cli/src/commands/onboard.ts</a> — CLI</li>
                    <li><a className="text-neon-primary" href="/packages/anonpay-node/src/index.ts">packages/anonpay-node/src/index.ts</a> — Node SDK</li>
                    <li><a className="text-neon-primary" href="/testing-website/backend/anonpay.json">testing-website/backend/anonpay.json</a> — example file</li>
                </ul>
            </DocSection>
        </div>
    );
};

export default SdkReference;
