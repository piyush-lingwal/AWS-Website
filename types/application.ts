export interface ApplicationFormData {
  fullName: string;
  universityEmail: string;
  phoneNumber: string;
  rollNumber: string;
  course: string;
  branch: string;
  customCourse?: string;
  year: string;
  wings: string[];
}

export interface ApplicationSubmissionResult {
  id: string;
  submittedAt: string;
}

export interface ApplicationStageInfo {
  id: number;
  label: string;
}
