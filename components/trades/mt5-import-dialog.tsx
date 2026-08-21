"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseMT5Report } from "@/lib/mt5-parser";
import { SampleTrade } from "@/lib/sample-data";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface MT5ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedTrades: SampleTrade[]) => void;
  selectedAccountId?: string;
}

export function MT5ImportDialog({ isOpen, onClose, onImportComplete, selectedAccountId }: MT5ImportDialogProps) {
  const [inputText, setInputText] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = React.useState<SampleTrade[]>([]);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      const parsed = parseMT5Report(content, selectedAccountId || "demo-account-1");
      setParsedPreview(parsed);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    if (!inputText) return;
    const parsed = parseMT5Report(inputText, selectedAccountId || "demo-account-1");
    setParsedPreview(parsed);
  };

  const handleSaveImport = () => {
    if (parsedPreview.length > 0) {
      onImportComplete(parsedPreview);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-emerald-400" />
          <span>Import Laporan MetaTrader 5</span>
        </DialogTitle>
        <DialogDescription>
          Unggah file laporan history MT5 (format HTML atau CSV) untuk sinkronisasi otomatis
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Upload Dropzone */}
        <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors group cursor-pointer">
          <input
            type="file"
            accept=".html,.htm,.csv,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {fileName ? fileName : "Klik atau seret file Report MT5 ke sini"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Mendukung format .HTML, .CSV dari MetaTrader 5 & 4</p>
            </div>
          </div>
        </div>

        {/* Or Paste Raw Text */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Atau Tempel (Paste) Isi Teks Laporan:
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setParsedPreview([]);
            }}
            placeholder="Tempel teks baris history statement MT5 di sini..."
            rows={3}
            className="text-xs font-mono"
          />
          {inputText && parsedPreview.length === 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleParseText}
              className="mt-2 text-xs"
            >
              Proses Teks
            </Button>
          )}
        </div>

        {/* Parsed Preview Feedback */}
        {parsedPreview.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>
                Berhasil mendeteksi <strong>{parsedPreview.length} transaksi</strong> dari MT5!
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Auto-Upsert Ready
            </span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">💡 Cara Export dari MT5:</p>
          <p>1. Buka MT5 di PC/Laptop ➔ Buka tab <strong>History</strong>.</p>
          <p>2. Klik kanan pada riwayat ➔ Pilih <strong>Report</strong> ➔ Simpan sebagai <strong>HTML</strong>.</p>
          <p>3. Seret file tersebut ke kotak di atas.</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Batal
        </Button>
        <Button
          onClick={handleSaveImport}
          disabled={parsedPreview.length === 0 || isProcessing}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
        >
          {isProcessing ? "Memproses..." : `Sinkronkan ${parsedPreview.length} Trade`}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
