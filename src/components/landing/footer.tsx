import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const PRODUCT_LINKS = [
  { id: "como-funciona", key: "nav.howItWorks" },
  { id: "producto", key: "nav.features" },
  { id: "integraciones", key: "nav.integrations" },
] as const;

const RESOURCE_LINKS = [
  { id: "casos", key: "nav.useCases" },
  { id: "faq", key: "nav.faq" },
] as const;

export function Footer() {
  const t = useTranslations();
  const year = 2026;

  return (
    <footer className="bg-[#000B1A] text-white">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Image
            src="/logos/logo_wordmark_white.svg"
            alt="Insyta"
            width={132}
            height={44}
            className="h-9 w-auto"
          />
          <p className="mt-4 text-sm text-white/60">{t("footer.tagline")}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">{t("footer.productHeading")}</p>
          <ul className="mt-4 space-y-3">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {t(l.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">{t("footer.companyHeading")}</p>
          <ul className="mt-4 space-y-3">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {t(l.key)}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {t("nav.login")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/45 sm:flex-row">
          <p>
            © {year} Insyta. {t("footer.rights")}
          </p>
          <p>{t("footer.madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
