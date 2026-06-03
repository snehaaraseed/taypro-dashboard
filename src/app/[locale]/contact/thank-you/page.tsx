import { redirect } from "next/navigation";

/** Legacy URL, enquiries now show inline thank-you on /contact */
export default function ContactThankYouRedirect() {
  redirect("/contact");
}
