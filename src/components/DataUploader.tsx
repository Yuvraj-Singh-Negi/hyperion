'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { CSVData } from '@/types';

interface DataUploaderProps {
  onFileLoaded: (file: File) => void;
  parsing: boolean;
  error: string | null;
  csvData: CSVData | null;
}

export default function DataUploader({ onFileLoaded, parsing, error, csvData }: DataUploaderProps) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFileLoaded(accepted[0]);
  }, [onFileLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: parsing,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-ice-blue/50 bg-ice-blue/5'
            : csvData
            ? 'border-emerald/30 bg-emerald/5'
            : 'border-pearl/10 hover:border-pearl/20 bg-pearl/[0.02]'
        }`}
      >
        <input {...getInputProps()} />

        {parsing ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-ice-blue/30 border-t-ice-blue"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm text-titanium">Parsing dataset...</p>
          </div>
        ) : csvData ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={32} className="text-emerald" />
            <div>
              <p className="text-sm text-pearl/80 font-medium">{csvData.fileName}</p>
              <p className="text-xs text-titanium/50">{csvData.rowCount.toLocaleString()} rows · {csvData.columns.length} columns</p>
            </div>
            <p className="text-xs text-titanium/40">Drop a new file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-ice-blue/10 border border-ice-blue/20 flex items-center justify-center">
              {isDragActive ? <Upload size={20} className="text-ice-blue" /> : <FileText size={20} className="text-titanium" />}
            </div>
            <div>
              <p className="text-sm text-titanium">
                {isDragActive ? 'Drop CSV here' : 'Drag & drop a CSV dataset'}
              </p>
              <p className="text-xs text-titanium/40 mt-1">or click to browse · Supports .csv files</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-crimson/10 border border-crimson/20"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={14} className="text-crimson shrink-0" />
          <span className="text-xs text-crimson/80">{error}</span>
        </motion.div>
      )}
    </div>
  );
}
