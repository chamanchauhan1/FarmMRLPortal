import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TreatmentRecord, InsertTreatmentRecord, insertTreatmentRecordSchema, Animal, Farm } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Plus, Search, Activity, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Treatments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: treatments, isLoading } = useQuery<TreatmentRecord[]>({
    queryKey: ["/api/treatments"],
  });

  const { data: animals } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });

  const { data: farms } = useQuery<Farm[]>({
    queryKey: ["/api/farms"],
  });

  const form = useForm<InsertTreatmentRecord>({
    resolver: zodResolver(insertTreatmentRecordSchema),
    defaultValues: {
      animalId: "",
      farmId: "",
      medicineName: "",
      antimicrobialType: "",
      dosage: "",
      unit: "mg",
      administeredBy: user?.fullName || "",
      administeredDate: new Date().toISOString().split('T')[0],
      withdrawalPeriodDays: 0,
      withdrawalEndDate: "",
      purposeOfTreatment: "",
      mrlLevel: null,
      notes: null,
      recordedBy: user?.id || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTreatmentRecord) => {
      return await apiRequest("POST", "/api/treatments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Treatment recorded",
        description: "Treatment record has been added successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record treatment",
      });
    },
  });

  const filteredTreatments = treatments?.filter((treatment) =>
    treatment.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treatment.antimicrobialType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-primary text-primary-foreground";
      case "warning": return "bg-chart-4 text-white";
      case "violation": return "bg-destructive text-destructive-foreground";
      case "pending": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle2 className="h-4 w-4" />;
      case "warning":
      case "violation": return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Treatment Records</h1>
          <p className="text-muted-foreground">
            Track antimicrobial treatments and MRL compliance
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-treatment">
              <Plus className="h-4 w-4 mr-2" />
              Record Treatment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Treatment</DialogTitle>
              <DialogDescription>
                Document antimicrobial administration and withdrawal details
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="farmId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-treatment-farm">
                              <SelectValue placeholder="Select farm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms?.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="animalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animal</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-animal">
                              <SelectValue placeholder="Select animal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {animals?.map((animal) => (
                              <SelectItem key={animal.id} value={animal.id}>
                                {animal.name} ({animal.tagNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicineName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Penicillin G" data-testid="input-medicine-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="antimicrobialType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antimicrobial Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Penicillin" data-testid="input-antimicrobial-type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="500" data-testid="input-dosage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mg">mg (milligrams)</SelectItem>
                            <SelectItem value="ml">ml (milliliters)</SelectItem>
                            <SelectItem value="g">g (grams)</SelectItem>
                            <SelectItem value="IU">IU (International Units)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="administeredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administered By</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Smith" data-testid="input-administered-by" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="administeredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administered Date</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="input-administered-date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="withdrawalPeriodDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Withdrawal Period (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="14" data-testid="input-withdrawal-period" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="withdrawalEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Withdrawal End Date</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="input-withdrawal-end-date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mrlLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRL Level (ppb, Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.05" data-testid="input-mrl-level" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="purposeOfTreatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Treatment</FormLabel>
                      <FormControl>
                        <Input placeholder="Respiratory infection treatment" data-testid="input-purpose" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes about the treatment..." data-testid="textarea-notes" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-treatment">
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      "Record Treatment"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search treatments by medicine name or type..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-treatments"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Treatment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTreatments && filteredTreatments.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Withdrawal</TableHead>
                    <TableHead>MRL Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.map((treatment) => (
                    <TableRow key={treatment.id} data-testid={`row-treatment-${treatment.id}`} className="hover-elevate">
                      <TableCell className="font-mono text-sm">{treatment.administeredDate}</TableCell>
                      <TableCell className="font-medium">{treatment.medicineName}</TableCell>
                      <TableCell>{treatment.antimicrobialType}</TableCell>
                      <TableCell>{treatment.dosage} {treatment.unit}</TableCell>
                      <TableCell>{treatment.withdrawalPeriodDays} days</TableCell>
                      <TableCell>{treatment.mrlLevel ? `${treatment.mrlLevel} ppb` : "-"}</TableCell>
                      <TableCell>
                        <Badge className={`${getComplianceColor(treatment.complianceStatus)} flex items-center gap-1 w-fit`}>
                          {getComplianceIcon(treatment.complianceStatus)}
                          {treatment.complianceStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No treatment records found</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {searchTerm ? "Try adjusting your search" : "Start tracking antimicrobial treatments"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Treatment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
