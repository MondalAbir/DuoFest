import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Contact,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextField } from "@/components/forms/TextField";
import { TextareaField } from "@/components/forms/TextareaField";
import { SelectField } from "@/components/forms/SelectField";
import { SwitchField } from "@/components/forms/SwitchField";
import { FormField } from "@/components/forms/FormField";
import { LogoUploader } from "@/components/colleges/LogoUploader";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import { InviteCollegeAdminDialog } from "@/components/colleges/InviteCollegeAdminDialog";
import { getCollegeDetails } from "@/data/collegeDetails";
import type { College } from "@/types";
import { initials } from "@/utils/format";
import {
  addCollegeDefaultValues,
  addCollegeSchema,
  COLLEGE_TYPES,
  NAAC_GRADES,
  type AddCollegeFormValues,
} from "@/components/colleges/addCollegeSchema";

interface AddCollegeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  college?: College | null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function deriveCollegeCode(name: string): string {
  const firstWord = name.split(/\s+/)[0] ?? name;
  const clean = firstWord.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return clean.length >= 3 ? clean.slice(0, 3) : clean;
}

function deriveCollegeType(name: string): string {
  return /IIT|NIT|IIIT|DTU|University of|Jadavpur/i.test(name)
    ? "Government"
    : "Private";
}

function deriveNaacGrade(plan: College["plan"]): string {
  if (plan === "Enterprise") return "A+";
  if (plan === "Growth") return "A";
  return "B+";
}

function buildCollegeFormValues(college: College): AddCollegeFormValues {
  const details = getCollegeDetails(college.id);
  return {
    logo: null,
    name: college.name,
    code: deriveCollegeCode(college.name),
    university: details?.university ?? college.name,
    type: deriveCollegeType(college.name),
    email: details?.officialEmail ?? college.adminEmail,
    phone: details?.phone ?? "",
    website: details?.website ?? "",
    address: details?.address ?? `${college.city}, ${college.state}`,
    city: college.city,
    state: college.state,
    country: "India",
    pinCode: details?.address?.match(/\d{6}$/)?.[0] ?? "",
    description: "",
    naacGrade: deriveNaacGrade(college.plan),
    aicteApproved: true,
    status: college.status,
  };
}

export function AddCollegeDialog({
  open,
  onOpenChange,
  college = null,
}: AddCollegeDialogProps) {
  const isEdit = Boolean(college);
  const form = useForm<AddCollegeFormValues>({
    resolver: zodResolver(addCollegeSchema),
    defaultValues: addCollegeDefaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successWasEdit, setSuccessWasEdit] = useState(false);
  const [inviteAdminOpen, setInviteAdminOpen] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset(college ? buildCollegeFormValues(college) : addCollegeDefaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, college]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (isSubmitting || isSavingDraft) return;
    form.reset(addCollegeDefaultValues);
    onOpenChange(false);
  };

  const onSubmit = async (values: AddCollegeFormValues) => {
    setIsSubmitting(true);
    await wait(1400);
    // Dummy submission – replace with an API call later.
    console.log(isEdit ? "College updated (dummy):" : "College created (dummy):", values);
    setIsSubmitting(false);
    form.reset(addCollegeDefaultValues);
    onOpenChange(false);
    setSuccessWasEdit(isEdit);
    setShowSuccess(true);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await wait(900);
    // Dummy submission – replace with an API call later.
    console.log("College draft saved (dummy):", form.getValues());
    setIsSavingDraft(false);
    form.reset(addCollegeDefaultValues);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90vh] max-w-[900px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0"
          aria-describedby="add-college-description"
        >
          <DialogHeader className="border-b border-border px-6 pb-4 pr-14 pt-5">
            <DialogTitle className="text-base">
              {isEdit ? "Edit College" : "Add College"}
            </DialogTitle>
            <DialogDescription id="add-college-description">
              {isEdit
                ? `Update details for ${college?.name}.`
                : "Onboard a new college onto DuoFest. Fill in the details below."}
            </DialogDescription>
          </DialogHeader>

          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
              <section className="space-y-5">
                <SectionHeading
                  icon={Building2}
                  title="Basic Information"
                  description="Core identity and profile of the college"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="logo"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="sm:col-span-2">
                        <FormField
                          label="College Logo"
                          htmlFor="college-logo"
                          optional
                        >
                          <LogoUploader
                            id="college-logo"
                            name="logo"
                            value={field.value ?? null}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            fallback={
                              isEdit && college
                                ? {
                                    label: initials(college.name),
                                    color: college.logoColor,
                                  }
                                : null
                            }
                          />
                        </FormField>
                      </div>
                    )}
                  />
                  <TextField
                    name="name"
                    control={form.control}
                    label="College Name"
                    placeholder="e.g. Indian Institute of Technology"
                    autoFocus
                  />
                  <TextField
                    name="code"
                    control={form.control}
                    label="College Code"
                    placeholder="e.g. IIT-DEL"
                    hint="Short unique code used across DuoFest."
                  />
                  <TextField
                    name="university"
                    control={form.control}
                    label="University"
                    placeholder="e.g. Delhi University"
                    className="sm:col-span-2"
                  />
                  <SelectField
                    name="type"
                    control={form.control}
                    label="College Type"
                    placeholder="Select type"
                    options={COLLEGE_TYPES.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                  />
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={Contact}
                  title="Contact Information"
                  description="Where students and admins can reach the college"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    name="email"
                    control={form.control}
                    label="College Email"
                    type="email"
                    placeholder="admin@college.edu"
                  />
                  <TextField
                    name="phone"
                    control={form.control}
                    label="Phone Number"
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                  <TextField
                    name="website"
                    control={form.control}
                    label="Website"
                    type="url"
                    placeholder="https://www.college.edu"
                    optional
                    className="sm:col-span-2"
                  />
                  <TextField
                    name="address"
                    control={form.control}
                    label="Address"
                    placeholder="Street, landmark, building…"
                    className="sm:col-span-2"
                  />
                  <TextField
                    name="city"
                    control={form.control}
                    label="City"
                    placeholder="e.g. New Delhi"
                  />
                  <TextField
                    name="state"
                    control={form.control}
                    label="State"
                    placeholder="e.g. Delhi"
                  />
                  <TextField
                    name="country"
                    control={form.control}
                    label="Country"
                    placeholder="e.g. India"
                  />
                  <TextField
                    name="pinCode"
                    control={form.control}
                    label="PIN Code"
                    placeholder="e.g. 110016"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeading
                  icon={ClipboardList}
                  title="College Details"
                  description="Accreditation, approvals and onboarding status"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextareaField
                    name="description"
                    control={form.control}
                    label="Description"
                    placeholder="A short summary of the college…"
                    optional
                    maxLength={500}
                    className="sm:col-span-2"
                  />
                  <SelectField
                    name="naacGrade"
                    control={form.control}
                    label="NAAC Grade"
                    placeholder="Select grade"
                    options={NAAC_GRADES.map((grade) => ({
                      value: grade,
                      label: grade,
                    }))}
                  />
                  <SelectField
                    name="status"
                    control={form.control}
                    label="Status"
                    placeholder="Select status"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "pending", label: "Pending" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                  />
                  <SwitchField
                    name="aicteApproved"
                    control={form.control}
                    label="AICTE Approved"
                    description="Recognized by the All India Council for Technical Education"
                    className="sm:col-span-2"
                  />
                </div>
              </section>
            </div>

            <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenChange.bind(null, false)}
                disabled={isSubmitting || isSavingDraft}
              >
                Cancel
              </Button>
              {!isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </Button>
              )}
              <Button
                type="submit"
                className="min-w-[150px]"
                disabled={isSubmitting || isSavingDraft}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {isEdit ? "Saving…" : "Creating…"}
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create College"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSuccess}
        onOpenChange={(next) => {
          if (!next) setShowSuccess(false);
        }}
      >
        <DialogContent className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">
              {successWasEdit
                ? "College updated successfully."
                : "College created successfully."}
            </DialogTitle>
            <DialogDescription>
              {successWasEdit
                ? "Your changes have been saved to the college profile."
                : "The college is now onboarded on DuoFest. Invite the college admin to set up their campus account."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            {successWasEdit ? (
              <Button onClick={() => setShowSuccess(false)}>Done</Button>
            ) : (
              <>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setShowSuccess(false);
                    setInviteAdminOpen(true);
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Invite College Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSuccess(false)}
                >
                  Later
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteCollegeAdminDialog
        open={inviteAdminOpen}
        onOpenChange={setInviteAdminOpen}
      />
    </>
  );
}
