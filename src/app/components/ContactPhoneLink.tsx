import {
  TAYPRO_SALES_PHONE_DISPLAY,
  TAYPRO_SALES_PHONE_TEL,
} from "@/lib/contact";

type ContactPhoneLinkProps = {
  className?: string;
};

export function ContactPhoneLink({
  className = "hover:text-[#A8C117] transition-colors",
}: ContactPhoneLinkProps) {
  return (
    <a href={TAYPRO_SALES_PHONE_TEL} className={className}>
      {TAYPRO_SALES_PHONE_DISPLAY}
    </a>
  );
}
