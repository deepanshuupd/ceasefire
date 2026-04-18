import Link from "next/link"
import { Camera, MessageCircle, X, LucideIcon } from "lucide-react"

type FooterGroup = {
  heading: string
  links: { label: string; href: string }[]
}

type SocialLink = {
  label: "Discord" | "X" | "Instagram"
  href: string
  icon: LucideIcon
}

const footerGroups: FooterGroup[] = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Best Practices",
    links: [
      { label: "Guides", href: "#" },
      { label: "Tips", href: "#" },
    ],
  },
]

const socialLinks: SocialLink[] = [
  { label: "Discord", href: "#", icon: MessageCircle },
  { label: "X", href: "#", icon: X },
  { label: "Instagram", href: "#", icon: Camera },
]

function FooterGroup({ group }: { group: FooterGroup }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">
        {group.heading}
      </h3>
      <ul className="space-y-2">
        {group.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {socialLinks.map((social) => {
        const Icon = social.icon
        return (
          <Link
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="text-muted-foreground hover:text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
          >
            <Icon className="h-5 w-5" />
          </Link>
        )
      })}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-background px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-7xl footer-surface px-6 py-10 md:px-8 md:py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_4fr]">
          <div className="md:flex md:flex-col md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Clipforge
              </h2>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Turn long videos into high-retention clips.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
            {footerGroups.map((group) => (
              <FooterGroup key={group.heading} group={group} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Clipforge. All rights reserved.
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  )
}
