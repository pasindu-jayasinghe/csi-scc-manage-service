export enum projectStatus {
    Initial = "Initial",
    New = "New",
    Payment_Pending = "Payment Pending",
    Payment_Completed = "Payment Completed",
    DataEntry ="DataEntry",
    DataCompleted = "Data Completed",
    VerificationPending = "Verification Pending",
    EvidencePending = "Evidence Pending",
    Verified = "Verified",
    Unverified = "Unverified",
    Closed = "Closed"
}

export  const DeactiveStatuses = [projectStatus.Initial, projectStatus.Closed]
export const ClosedStatuses = [projectStatus.Closed]