import "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "playing-card": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        cid?: string;
        suit?: string;
        rank?: string;
        backcolor?: string;
        cardcolor?: string;
        suitcolor?: string;
        rankcolor?: string;
        borderradius?: string;
        bordercolor?: string;
        borderline?: string;
      };
    }
  }
}
