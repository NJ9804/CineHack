declare namespace JSX {
  interface IntrinsicElements {
    'lottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      autoplay?: boolean;
      loop?: boolean;
      mode?: string;
      src?: string;
      background?: string;
      speed?: number;
      style?: React.CSSProperties;
      controls?: boolean;
      renderer?: 'svg' | 'canvas' | 'html';
      direction?: number;
      hover?: boolean;
      click?: boolean;
      intermittency?: number;
      count?: number;
      preserve_aspect_ratio?: string;
    };
  }
}