import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit } from "@/app/utils/rateLimit";
import { createJobApplicant, uploadResume } from "@/lib/erpnext/job-applicant";
import { ErpNextError } from "@/lib/erpnext/client";
import { getJobOpeningByName } from "@/lib/erpnext/job-openings";
import { validateResumeFile } from "@/lib/erpnext/resume-validation";

const MAX_FIELD_LENGTH = 200;
const MAX_COVER_LETTER_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, "careers");
    if (rateLimit.limited) {
      return NextResponse.json(
        { success: false, message: "Too many applications. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim().slice(0, MAX_FIELD_LENGTH);
    const email = String(formData.get("email") ?? "").trim().slice(0, MAX_FIELD_LENGTH);
    const phone = String(formData.get("phone") ?? "").trim().slice(0, MAX_FIELD_LENGTH);
    const jobOpening = String(formData.get("job_opening") ?? "")
      .trim()
      .slice(0, MAX_FIELD_LENGTH);
    const coverLetter = String(formData.get("cover_letter") ?? "")
      .trim()
      .slice(0, MAX_COVER_LETTER_LENGTH);
    const resume = formData.get("resume");

    if (!name || !email || !phone || !jobOpening) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields (name, email, phone).",
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const openJob = await getJobOpeningByName(jobOpening, true);
    if (!openJob) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This position is no longer accepting applications. Browse open roles on our careers page.",
        },
        { status: 410 }
      );
    }

    if (!(resume instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please attach your resume." },
        { status: 400 }
      );
    }

    const resumeError = validateResumeFile(resume);
    if (resumeError) {
      return NextResponse.json(
        { success: false, message: resumeError },
        { status: 400 }
      );
    }

    const resumeUrl = await uploadResume(resume, resume.name);
    const applicantId = await createJobApplicant({
      jobOpeningName: openJob.name,
      name,
      email,
      phone,
      resumeUrl,
      coverLetter: coverLetter || undefined,
    });

    return NextResponse.json({
      success: true,
      message:
        "Thank you — your application has been submitted. Our team will review it and get back to you.",
      applicantId,
    });
  } catch (error) {
    if (error instanceof ErpNextError) {
      console.error("POST /api/careers/apply ERPNext:", error.message);
      return NextResponse.json(
        {
          success: false,
          message:
            "We could not submit your application right now. Please try again in a few minutes.",
        },
        { status: error.status >= 400 && error.status < 500 ? error.status : 502 }
      );
    }

    console.error("POST /api/careers/apply:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while submitting your application. Please try again.",
      },
      { status: 500 }
    );
  }
}
