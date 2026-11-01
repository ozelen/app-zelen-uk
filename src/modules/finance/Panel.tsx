import { useEffect, useState } from "react";

type Account = { id: number; name: string; currency: string };
type Upload = { id: number; original_filename: string; account_label: string; row_count: number; imported_count: number; created_at: string };

// Finance ingestion: statements go to an account you pick, receipts and invoices to the parse queue. Uploads can be reverted.
export default function FinancePanel() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [uploads, setUploads] = useState<Upload[]>([]);
	const [kind, setKind] = useState<"statement" | "receipt" | "invoice">("statement");
	const [account, setAccount] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [msg, setMsg] = useState("");
	const [busy, setBusy] = useState(false);

	const load = () => {
		fetch("/api/modules/finance/accounts").then(async (r) => r.ok && setAccounts(await r.json()));
		fetch("/api/modules/finance/uploads").then(async (r) => r.ok && setUploads(await r.json()));
	};
	useEffect(load, []);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file || (kind === "statement" && !account)) return;
		const form = new FormData();
		form.set("file", file);
		if (kind === "statement") form.set("account", account);
		else form.set("kind", kind);
		setBusy(true);
		const r = await fetch(`/api/modules/finance/${kind === "statement" ? "uploads" : "receipts"}`, { method: "POST", body: form });
		const body = await r.json().catch(() => ({}));
		setBusy(false);
		if (!r.ok) return setMsg(body.detail ?? body.account ?? `Failed (${r.status})`);
		setMsg(kind === "statement" ? `Imported ${body.imported_count} of ${body.row_count} rows into ${body.account_label}${body.skipped_duplicates ? `, ${body.skipped_duplicates} duplicates skipped` : ""}.` : `Queued ${kind} #${body.id} for parsing.`);
		setFile(null);
		load();
	};
	const revert = async (u: Upload) => {
		if (!confirm(`Revert "${u.original_filename}" and delete its ${u.imported_count} transactions from ${u.account_label}?`)) return;
		const r = await fetch(`/api/modules/finance/uploads/${u.id}`, { method: "DELETE" });
		setMsg(r.ok ? `Reverted ${u.original_filename}.` : `Revert failed (${r.status}).`);
		load();
	};

	return (
		<>
			<form className="card form" onSubmit={submit}>
				<h2>Add to the ledger</h2>
				<label>What is it
					<select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
						<option value="statement">Bank statement (.xls / .xlsx / .csv)</option>
						<option value="receipt">Receipt (photo or PDF)</option>
						<option value="invoice">Incoming invoice (PDF)</option>
					</select>
				</label>
				{kind === "statement" && (
					<label>Account
						<select value={account} onChange={(e) => setAccount(e.target.value)} required>
							<option value="">Pick the account this statement belongs to</option>
							{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}
						</select>
					</label>
				)}
				<label>File<input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept={kind === "statement" ? ".xls,.xlsx,.csv" : "image/*,.pdf"} required /></label>
				<button type="submit" disabled={busy || !file || (kind === "statement" && !account)}>{busy ? "Uploading…" : "Upload"}</button>
				{msg && <p className="muted">{msg}</p>}
			</form>
			{uploads.length > 0 && (
				<section className="card">
					<h2>Statement uploads</h2>
					{uploads.map((u) => (
						<p key={u.id} className="row rowline">
							<span>{u.original_filename}<br /><span className="muted">{u.account_label} · {u.imported_count}/{u.row_count} rows · {u.created_at.slice(0, 10)}</span></span>
							<button className="link" onClick={() => revert(u)}>Revert</button>
						</p>
					))}
				</section>
			)}
		</>
	);
}
