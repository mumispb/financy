import * as React from "react"
import { cn } from "@/lib/utils"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  src: string
  alt?: string
  className?: string
}

export function Icon({ src, alt, className, ...props }: IconProps) {
  const [svgContent, setSvgContent] = React.useState<string>("")
  const [viewBox, setViewBox] = React.useState<string>("0 0 24 24")

  React.useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(text, "image/svg+xml")
        const svgElement = svgDoc.querySelector("svg")
        if (svgElement) {
          setViewBox(svgElement.getAttribute("viewBox") || "0 0 24 24")
          const innerHTML = svgElement.innerHTML
          setSvgContent(innerHTML)
        }
      })
      .catch((err) => console.error("Failed to load SVG:", err))
  }, [src])

  return (
    <svg
      className={cn("inline-block", className)}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      {...props}
    >
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  )
}
