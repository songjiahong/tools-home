import { Lang } from '../i18n/translations'

/** Inline SVG flags (emoji flags do not render on Windows). English = Australia, Chinese = China. */
export default function Flag({ lang, className = 'w-6 h-4' }: { lang: Lang; className?: string }) {
  if (lang === 'zh') {
    return (
      <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
        <rect width="30" height="20" fill="#de2910" />
        <polygon fill="#ffde00" points="5,2 5.9,4.8 8.8,4.8 6.5,6.5 7.3,9.3 5,7.6 2.7,9.3 3.5,6.5 1.2,4.8 4.1,4.8" />
        <g fill="#ffde00">
          <polygon points="10,1.5 10.4,2.7 11.6,2.7 10.7,3.4 11,4.6 10,3.9 9,4.6 9.3,3.4 8.4,2.7 9.6,2.7" transform="scale(.6) translate(8 0)" />
          <polygon points="10,1.5 10.4,2.7 11.6,2.7 10.7,3.4 11,4.6 10,3.9 9,4.6 9.3,3.4 8.4,2.7 9.6,2.7" transform="scale(.6) translate(12 4)" />
          <polygon points="10,1.5 10.4,2.7 11.6,2.7 10.7,3.4 11,4.6 10,3.9 9,4.6 9.3,3.4 8.4,2.7 9.6,2.7" transform="scale(.6) translate(12 9)" />
          <polygon points="10,1.5 10.4,2.7 11.6,2.7 10.7,3.4 11,4.6 10,3.9 9,4.6 9.3,3.4 8.4,2.7 9.6,2.7" transform="scale(.6) translate(8 13)" />
        </g>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      {/* Union Jack canton */}
      <g>
        <path d="M0,0 L30,15 M30,0 L0,15" stroke="#fff" strokeWidth="3" />
        <path d="M0,0 L30,15 M30,0 L0,15" stroke="#c8102e" strokeWidth="1.2" />
        <path d="M15,0 V15 M0,7.5 H30" stroke="#fff" strokeWidth="5" />
        <path d="M15,0 V15 M0,7.5 H30" stroke="#c8102e" strokeWidth="3" />
      </g>
      {/* Commonwealth star */}
      <polygon fill="#fff" points="15,18.5 16.3,22 20,21.4 17.7,24.2 19.6,27.4 16.1,26 15,29.5 13.9,26 10.4,27.4 12.3,24.2 10,21.4 13.7,22" />
      {/* Southern Cross */}
      <g fill="#fff">
        <polygon points="45,4 45.6,5.6 47.3,5.6 46,6.6 46.5,8.2 45,7.2 43.5,8.2 44,6.6 42.7,5.6 44.4,5.6" />
        <polygon points="45,21 45.6,22.6 47.3,22.6 46,23.6 46.5,25.2 45,24.2 43.5,25.2 44,23.6 42.7,22.6 44.4,22.6" />
        <polygon points="37,13 37.6,14.6 39.3,14.6 38,15.6 38.5,17.2 37,16.2 35.5,17.2 36,15.6 34.7,14.6 36.4,14.6" />
        <polygon points="53,10 53.6,11.6 55.3,11.6 54,12.6 54.5,14.2 53,13.2 51.5,14.2 52,12.6 50.7,11.6 52.4,11.6" />
        <polygon points="45,13.5 45.4,14.6 46.5,14.6 45.7,15.3 46,16.4 45,15.7 44,16.4 44.3,15.3 43.5,14.6 44.6,14.6" />
      </g>
    </svg>
  )
}
