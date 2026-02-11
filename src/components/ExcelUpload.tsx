import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExcelUploadProps {
  onFileUpload?: (file: File) => void;
}

export function ExcelUpload({ onFileUpload }: ExcelUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel file (.xlsx, .xls) or CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    onFileUpload?.(file);
    
    toast({
      title: 'File uploaded',
      description: `${file.name} has been uploaded. Backend processing will be enabled soon.`,
    });
  };

  const clearFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="rounded-xl bg-card p-6 card-elevated">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="h-5 w-5 text-savings" />
        <h3 className="text-xl font-semibold">Update Analysis Data</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop your updated Excel consumption data to refresh the analysis
      </p>

      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
            ${isDragOver 
              ? 'border-savings bg-savings/10' 
              : 'border-border hover:border-savings/50 hover:bg-muted/30'
            }
          `}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${isDragOver ? 'bg-savings/20' : 'bg-muted'}`}>
                <Upload className={`h-8 w-8 ${isDragOver ? 'text-savings' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium">Drop Excel file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports .xlsx, .xls, and .csv files
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-savings/5 border-savings/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-savings/20">
                <CheckCircle2 className="h-5 w-5 text-savings" />
              </div>
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • Ready for processing
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearFile}>
              Remove
            </Button>
          </div>
          
           <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Backend Processing Coming Soon</p>
                <p className="text-muted-foreground">
                  File parsing will be enabled once Cloud storage is connected. 
                  For now, data is displayed from the initial analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
