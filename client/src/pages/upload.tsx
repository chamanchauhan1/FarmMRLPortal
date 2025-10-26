import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FarmReport, Farm } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Upload, FileText, File, Loader2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function UploadPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [farmId, setFarmId] = useState("");
  const [reportType, setReportType] = useState("compliance");
  const [description, setDescription] = useState("");

  const { data: reports, isLoading } = useQuery<FarmReport[]>({
    queryKey: ["/api/reports"],
  });

  const { data: farms } = useQuery<Farm[]>({
    queryKey: ["/api/farms"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { farmId: string; reportType: string; description: string; file: File }) => {
      const formData = new FormData();
      formData.append("farmId", data.farmId);
      formData.append("reportType", data.reportType);
      formData.append("description", data.description);
      formData.append("file", data.file);
      formData.append("uploadedBy", user?.id || "");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "File uploaded",
        description: "Report has been uploaded successfully",
      });
      setSelectedFile(null);
      setFarmId("");
      setReportType("compliance");
      setDescription("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload file",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload PDF, Excel, or CSV files only",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 10MB",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !farmId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a farm and upload a file",
      });
      return;
    }

    uploadMutation.mutate({ farmId, reportType, description, file: selectedFile });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Farm Reports</h1>
        <p className="text-muted-foreground">
          Upload compliance reports, inspection documents, and veterinary records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="farm">Select Farm</Label>
              <Select value={farmId} onValueChange={setFarmId}>
                <SelectTrigger id="farm" data-testid="select-upload-farm">
                  <SelectValue placeholder="Choose a farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms?.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType" data-testid="select-report-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="inspection">Inspection Document</SelectItem>
                  <SelectItem value="veterinary">Veterinary Record</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any notes about this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <div className="border-2 border-dashed rounded-md p-6 hover-elevate">
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, Excel, or CSV (max 10MB)
                    </p>
                  </>
                )}
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.xls,.xlsx,.csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  data-testid="input-file"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !farmId || uploadMutation.isPending}
            className="w-full"
            data-testid="button-upload"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-md border hover-elevate"
                  data-testid={`report-${report.id}`}
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(report.fileType)}
                    <div>
                      <p className="font-medium">{report.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {report.reportType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(report.fileSize)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports uploaded</h3>
              <p className="text-sm text-muted-foreground text-center">
                Upload your first compliance or inspection report
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
