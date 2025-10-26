import { useQuery } from "@tanstack/react-query";
import { TreatmentRecord } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();

  const { data: treatments, isLoading } = useQuery<TreatmentRecord[]>({
    queryKey: ["/api/treatments"],
  });

  const complianceData = treatments?.reduce(
    (acc, t) => {
      acc[t.complianceStatus] = (acc[t.complianceStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const exportToCSV = () => {
    if (!treatments || treatments.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no treatment records available",
      });
      return;
    }

    const headers = [
      "Date",
      "Medicine Name",
      "Antimicrobial Type",
      "Dosage",
      "Unit",
      "Administered By",
      "Withdrawal Period (Days)",
      "Withdrawal End Date",
      "MRL Level (ppb)",
      "Compliance Status",
      "Purpose",
    ];

    const rows = treatments.map((t) => [
      t.administeredDate,
      t.medicineName,
      t.antimicrobialType,
      t.dosage,
      t.unit,
      t.administeredBy,
      t.withdrawalPeriodDays,
      t.withdrawalEndDate,
      t.mrlLevel || "",
      t.complianceStatus,
      t.purposeOfTreatment,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `mrl-treatment-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Treatment records have been exported to CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
        <p className="text-muted-foreground">
          View and export MRL compliance reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {complianceData?.compliant || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>
                {complianceData?.warning || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {complianceData?.violation || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MRL Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compliance Rate</span>
                <span className="text-sm font-bold text-primary">
                  {treatments && treatments.length > 0
                    ? Math.round(((complianceData?.compliant || 0) / treatments.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${treatments && treatments.length > 0
                      ? ((complianceData?.compliant || 0) / treatments.length) * 100
                      : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Total Records</h3>
                <p className="text-2xl font-bold">{treatments?.length || 0}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Pending Review</h3>
                <p className="text-2xl font-bold">{complianceData?.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Report Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={exportToCSV}
                disabled={isLoading || !treatments || treatments.length === 0}
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <Button variant="outline" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {treatments && treatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Compliance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {treatments
                .filter((t) => t.complianceStatus === "violation" || t.complianceStatus === "warning")
                .slice(0, 5)
                .map((treatment) => (
                  <div
                    key={treatment.id}
                    className="flex items-center justify-between p-3 rounded-md border hover-elevate"
                  >
                    <div className="flex items-center gap-3">
                      {treatment.complianceStatus === "violation" ? (
                        <XCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-chart-4" />
                      )}
                      <div>
                        <p className="font-medium">{treatment.medicineName}</p>
                        <p className="text-sm text-muted-foreground">
                          {treatment.administeredDate} - {treatment.antimicrobialType}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={treatment.complianceStatus === "violation" ? "destructive" : "outline"}
                    >
                      {treatment.complianceStatus}
                    </Badge>
                  </div>
                ))}
              {treatments.filter((t) => t.complianceStatus === "violation" || t.complianceStatus === "warning")
                .length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p>No compliance issues found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
