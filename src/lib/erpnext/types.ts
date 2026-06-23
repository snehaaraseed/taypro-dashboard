/** ERPNext Job Opening fields used by the careers portal. */
export type JobOpening = {
  name: string;
  job_title: string;
  designation?: string;
  department?: string;
  location?: string;
  employment_type?: string;
  description?: string;
  route?: string;
  posted_on?: string;
  company?: string;
  status?: string;
};

export type FrappeListResponse<T> = {
  data: T[];
};

export type FrappeDocResponse<T> = {
  data: T;
};

export type FrappeUploadResponse = {
  message: {
    file_url: string;
    file_name?: string;
  };
};

export type CreateJobApplicantInput = {
  jobOpeningName: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
};
