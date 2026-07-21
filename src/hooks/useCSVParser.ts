'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { CSVData, CSVColumn } from '@/types';

export function useCSVParser() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    setParsing(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError('Failed to parse CSV: ' + results.errors[0].message);
          setParsing(false);
          return;
        }

        const rows = results.data as Record<string, unknown>[];
        if (rows.length === 0) {
          setError('CSV file is empty');
          setParsing(false);
          return;
        }

        const headers = results.meta.fields ?? Object.keys(rows[0]);
        const columns: CSVColumn[] = headers.map((key) => {
          const vals = rows.slice(0, 10).map((r) => r[key]);
          const numVals = vals.filter((v) => typeof v === 'number');
          const dateVals = vals.filter((v) => typeof v === 'string' && !isNaN(Date.parse(v)));
          const type: CSVColumn['type'] = numVals.length > vals.length / 2 ? 'number' : dateVals.length > 0 ? 'date' : 'string';
          return {
            key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            type,
            sample: String(vals[0] ?? ''),
          };
        });

        setCsvData({ columns, rows, fileName: file.name, rowCount: rows.length });
        setParsing(false);
      },
      error: () => {
        setError('Failed to read file');
        setParsing(false);
      },
    });
  }, []);

  const reset = useCallback(() => {
    setCsvData(null);
    setError(null);
    setParsing(false);
  }, []);

  return { csvData, parsing, error, parseFile, reset };
}
