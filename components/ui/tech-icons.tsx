import React from 'react'

export interface TechIconProps extends React.SVGProps<SVGSVGElement> {
  name: string
  size?: number | string
  className?: string
  useOriginalColor?: boolean
}

interface TechDefinition {
  color: string
  viewBox: string
  path: string | React.ReactNode
}

export const TECH_DEFINITIONS: Record<string, TechDefinition> = {
  react: {
    color: '#61DAFB',
    viewBox: '-11.5 -10.23174 23 20.46348',
    path: (
      <>
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </>
    ),
  },
  typescript: {
    color: '#3178C6',
    viewBox: '0 0 24 24',
    path: (
      <>
        <rect width="24" height="24" rx="3" fill="#3178C6" />
        <path
          d="M11.5 8.5H5.5V10.5H7.5V18.5H9.5V10.5H11.5V8.5ZM17.8 11.2C17.2 10.6 16.3 10.3 15.2 10.3C14.2 10.3 13.4 10.6 12.8 11.1C12.3 11.6 12 12.2 12 13C12 13.8 12.3 14.4 12.9 14.8C13.5 15.2 14.4 15.6 15.6 16C16.8 16.4 17.5 16.8 17.9 17.3C18.3 17.8 18.5 18.4 18.5 19.2C18.5 20.2 18.1 21 17.4 21.6C16.6 22.2 15.5 22.5 14.2 22.5C13.2 22.5 12.3 22.3 11.5 21.8C10.7 21.3 10.1 20.6 9.8 19.8L11.5 18.8C11.7 19.4 12.1 19.8 12.6 20.2C13.1 20.5 13.6 20.7 14.3 20.7C15 20.7 15.6 20.5 16 20.1C16.4 19.7 16.6 19.2 16.6 18.6C16.6 18 16.4 17.5 16 17.1C15.6 16.7 14.9 16.4 13.9 16C12.7 15.5 11.9 15.1 11.4 14.6C10.9 14.1 10.6 13.4 10.6 12.6C10.6 11.6 11 10.8 11.7 10.2C12.4 9.6 13.4 9.3 14.6 9.3C15.5 9.3 16.3 9.5 17 9.9C17.7 10.3 18.2 10.9 18.5 11.6L16.8 12.5C16.6 12 16.3 11.6 15.9 11.4C15.5 11.2 15.1 11.1 14.6 11.1C14 11.1 13.5 11.3 13.2 11.6C12.9 11.9 12.7 12.2 12.7 12.7C12.7 13.1 12.9 13.5 13.2 13.8C13.5 14.1 14.1 14.4 14.9 14.7L15.9 15.1C17.1 15.5 18 16.1 18.6 16.8C19.1 17.5 19.4 18.3 19.4 19.3C19.4 20.6 18.9 21.6 17.8 22.3"
          fill="#FFFFFF"
        />
      </>
    ),
  },
  javascript: {
    color: '#F7DF1E',
    viewBox: '0 0 24 24',
    path: (
      <>
        <rect width="24" height="24" rx="3" fill="#F7DF1E" />
        <path
          d="M7.7 18.7c.4.7.9 1.3 1.5 1.7 1 .7 2.2.8 3.3.4.8-.3 1.4-.9 1.8-1.6.4-.8.5-1.7.5-2.6 0-1.8-.7-3.1-2.2-3.9l-1.3-.7c-.9-.5-1.3-.9-1.3-1.6 0-.5.2-.9.5-1.2.4-.3.9-.4 1.5-.4.7 0 1.3.2 1.8.6.4.3.7.8.8 1.4l2.1-.8c-.3-.9-.8-1.6-1.5-2.1-1-.7-2.1-1-3.2-.9-1.1.1-2.1.6-2.8 1.4-.6.8-.9 1.8-.8 2.8 0 1.5.7 2.7 2.1 3.5l1.3.7c1 .5 1.5 1.1 1.5 1.8 0 .5-.2 1-.6 1.3-.5.4-1.1.5-1.8.4-.9 0-1.7-.3-2.3-1-.5-.6-.8-1.4-.9-2.3L5.4 16c.3 1 .8 2 1.6 2.7zm-4.3-.8c.4.8 1 1.5 1.8 1.9 1 .6 2.2.7 3.3.3.7-.3 1.3-.8 1.7-1.5.5-.8.7-1.8.6-2.8v-7.1h-2.4v7c0 .6-.1 1.2-.4 1.6-.3.4-.8.6-1.4.5-.6 0-1.1-.3-1.4-.8-.3-.5-.4-1.1-.4-1.8H2.8c0 1 .2 2 .6 2.7z"
          fill="#000000"
        />
      </>
    ),
  },
  nodejs: {
    color: '#5FA04E',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 1.5L2.5 7v10l9.5 5.5 9.5-5.5V7L12 1.5zm7.3 14.3l-7.3 4.2-7.3-4.2V8.2l7.3-4.2 7.3 4.2v7.6zM8.5 11.2c.4-.7 1-1.2 1.8-1.5.8-.3 1.7-.3 2.5 0 .8.3 1.4.8 1.8 1.5.4.7.6 1.6.6 2.5 0 .9-.2 1.8-.6 2.5-.4.7-1 1.2-1.8 1.5-.8.3-1.7.3-2.5 0-.8-.3-1.4-.8-1.8-1.5-.4-.7-.6-1.6-.6-2.5 0-.9.2-1.8.6-2.5z"
        fill="#5FA04E"
      />
    ),
  },
  nextjs: {
    color: '#FFFFFF',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.836 17.674l-6.523-8.384v8.384H9.728V6.326h1.585l6.523 8.384V6.326h1.585v11.348h-1.585z"
        fill="currentColor"
      />
    ),
  },
  python: {
    color: '#3776AB',
    viewBox: '0 0 24 24',
    path: (
      <g>
        <path
          d="M11.9 2C8.3 2 8.5 3.6 8.5 3.6l.01 1.6h3.49v.5H4.8s-2.8.3-2.8 4.1c0 3.8 2.4 3.7 2.4 3.7h1.4v-2s-.1-2.4 2.4-2.4h4.1s2.3.1 2.3-2.3V4.3S15 2 11.9 2zm-1.8 1.3a.7.7 0 110 1.4.7.7 0 010-1.4z"
          fill="#3776AB"
        />
        <path
          d="M12.1 22c3.6 0 3.4-1.6 3.4-1.6l-.01-1.6H12v-.5h7.2s2.8-.3 2.8-4.1c0-3.8-2.4-3.7-2.4-3.7h-1.4v2s.1 2.4-2.4 2.4h-4.1s-2.3-.1-2.3 2.3v4.4s-.4 2.3 2.7 2.3zm1.8-1.3a.7.7 0 110-1.4.7.7 0 010 1.4z"
          fill="#FFD43B"
        />
      </g>
    ),
  },
  postgresql: {
    color: '#4169E1',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 15.5c-2.3 0-4.2-1.9-4.2-4.2 0-2.3 1.9-4.2 4.2-4.2 1.4 0 2.6.7 3.3 1.7l-1.3 1.3c-.4-.6-1.2-1-2-1-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2c.8 0 1.6-.4 2-1l1.3 1.3c-.7 1.1-1.9 1.7-3.3 1.7z"
        fill="#4169E1"
      />
    ),
  },
  mongodb: {
    color: '#47A248',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 1.5s-.3.5-.8 1.7c-.5 1.3-1.6 3.6-2.5 6.1C7.8 12 7 14.6 7 16.5c0 3.3 2.2 6 5 6s5-2.7 5-6c0-1.9-.8-4.5-1.7-7.2-.9-2.5-2-4.8-2.5-6.1-.5-1.2-.8-1.7-.8-1.7zm-.1 3.7c.3.8.7 1.9 1.2 3.1.8 2.1 1.7 4.5 2 6.5.1.8.2 1.5.2 2.2 0 1.7-1.1 3.2-2.7 3.7-.2-.2-.5-.5-.7-.9v-14.6z"
        fill="#47A248"
      />
    ),
  },
  docker: {
    color: '#2496ED',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M23.5 12.3c-.3-.2-.8-.3-1.3-.3-.4 0-.8.1-1.1.3-.2-.8-.7-1.5-1.4-1.9-.3-.2-.7-.3-1.1-.3-.2 0-.3 0-.5.1C18.6 9 17.5 8 16.1 8H16V6.5h-2V8h-1V6.5h-2V8h-1V6.5H8V8H7V6.5H5V8H3.5C2.1 8 1 9.1 1 10.5v2c0 4.1 3.4 7.5 7.5 7.5 4.3 0 7.8-3.1 8.4-7.2 1.2-.1 2.2-.6 2.8-1.5.6.3 1.2.4 1.9.4.6 0 1.2-.2 1.7-.5.3-.2.4-.5.4-.8s-.1-.5-.2-.6zM7 9.5h1.5v1.5H7V9.5zm3 0h1.5v1.5H10V9.5zm3 0h1.5v1.5H13V9.5zm-6 3h1.5V14H7v-1.5zm3 0h1.5V14H10v-1.5zm3 0h1.5V14H13v-1.5zm3 0h1.5V14H16v-1.5z"
        fill="#2496ED"
      />
    ),
  },
  kubernetes: {
    color: '#326CE5',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 1.8l8.8 5.1v10.2L12 22.2l-8.8-5.1V6.9L12 1.8zm0 2.3L4.9 8.2v7.6L12 19.9l7.1-4.1V8.2L12 4.1zm0 3.9l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z"
        fill="#326CE5"
      />
    ),
  },
  aws: {
    color: '#FF9900',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5c-2.3 1.5-5.3 1.8-7.8.8-.4-.2-.8.2-.5.5 2.2 1.6 5.3 1.8 7.8.4.3-.2.8.2.5.5zm1.5-3.5c-.2.3-.5.4-.8.3-2.1-.8-4.4-.8-6.5 0-.3.1-.7 0-.8-.3-.1-.3 0-.7.3-.8 2.4-.9 5-.9 7.5 0 .3.1.4.5.3.8z"
        fill="#FF9900"
      />
    ),
  },
  tailwind: {
    color: '#06B6D4',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z"
        fill="#06B6D4"
      />
    ),
  },
  graphql: {
    color: '#E10098',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2L2.5 7.5v11L12 24l9.5-5.5v-11L12 2zm0 2.4l7.4 4.3-3.2 5.5H7.8L4.6 8.7 12 4.4zm-5.8 9.8l2.3-4h6.9l2.3 4-5.8 3.3-5.7-3.3z"
        fill="#E10098"
      />
    ),
  },
  redis: {
    color: '#DC382D',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2L1 7.5l11 5.5 11-5.5L12 2zm0 8.3L4.2 7.5 12 3.7l7.8 3.8L12 10.3zM1 12l11 5.5 11-5.5-2.2-1.1-8.8 4.4-8.8-4.4L1 12zm0 4.5l11 5.5 11-5.5-2.2-1.1-8.8 4.4-8.8-4.4L1 16.5z"
        fill="#DC382D"
      />
    ),
  },
  golang: {
    color: '#00ADD8',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M1.8 10.8c.1-.4.4-.7.8-.8 1.4-.5 2.9-.6 4.3-.2.4.1.7.4.8.8.1.4-.1.8-.4 1-1.3.9-2.8 1.3-4.3 1.1-.6-.1-.9-.5-.8-1.1zm2.3 3.6c.1-.4.4-.7.8-.8 1.4-.4 2.9-.4 4.3.1.4.1.6.5.6.9 0 .4-.3.7-.7.9-1.3.6-2.8.8-4.2.4-.5-.2-.7-.6-.6-1.1zm12.5-7c2.9 0 5.2 2.3 5.2 5.2 0 2.9-2.3 5.2-5.2 5.2s-5.2-2.3-5.2-5.2c0-2.9 2.3-5.2 5.2-5.2zm0 2.4c-1.5 0-2.8 1.3-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.3 2.8-2.8-1.3-2.8-2.8-2.8z"
        fill="#00ADD8"
      />
    ),
  },
  git: {
    color: '#F05032',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M21.6 10.6L13.4 2.4c-.8-.8-2-.8-2.8 0L8.8 4.2l3.5 3.5c.6-.2 1.3 0 1.7.4.5.5.6 1.2.4 1.8l3.4 3.4c.6-.2 1.3 0 1.8.4.7.7.7 1.9 0 2.7s-1.9.7-2.7 0c-.5-.5-.6-1.3-.4-1.8L13 11.1v4.8c.2.2.3.4.3.7 0 1-.8 1.9-1.9 1.9s-1.9-.8-1.9-1.9c0-.8.5-1.5 1.2-1.8V9.9c-.7-.3-1.2-1-1.2-1.8 0-.3.1-.6.2-.8L6.2 3.8 2.4 7.6c-.8.8-.8 2 0 2.8l8.2 8.2c.8.8 2 .8 2.8 0l8.2-8.2c.8-.7.8-2 0-2.8z"
        fill="#F05032"
      />
    ),
  },
  html5: {
    color: '#E34F26',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M2.5 2l1.8 20 7.7 2.1 7.7-2.1 1.8-20H2.5zm15.4 5.5H8.3l.3 3h9l-.6 6.8-5 1.4-5-1.4-.3-3.6h2.7l.2 1.8 2.4.6 2.4-.6.3-3.2H6l-.7-7.8h12.9l-.3 3z"
        fill="#E34F26"
      />
    ),
  },
  css3: {
    color: '#1572B6',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M2.5 2l1.8 20 7.7 2.1 7.7-2.1 1.8-20H2.5zm15.4 5.5h-10l.3 3h9.4l-.6 6.8-5 1.4-5-1.4-.3-3.6h2.7l.2 1.8 2.4.6 2.4-.6.3-3.2H6l-.7-7.8h12.9l-.3 3z"
        fill="#1572B6"
      />
    ),
  },
  vue: {
    color: '#4FC08D',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M2 3h3.5L12 14.5 18.5 3H22L12 21 2 3zm4.5 0h3L12 7.5 14.5 3h3L12 12.5 6.5 3z"
        fill="#4FC08D"
      />
    ),
  },
  angular: {
    color: '#DD0031',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2.5L2.8 5.7l1.4 12.3L12 22.5l7.8-4.5 1.4-12.3L12 2.5zm0 2.8l5.5 12.3h-2l-1.1-2.8H9.6L8.5 17.6h-2L12 5.3zm1.6 7.6L12 8.3l-1.6 4.6h3.2z"
        fill="#DD0031"
      />
    ),
  },
  java: {
    color: '#ED8B00',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M8.8 17.5c-2.3.2-3.8-.5-3.8-.5s1.4.8 3.7.8c3.2 0 5.4-1.1 5.4-1.1s-1.8.6-5.3.8zm-.8-2.6c-2 .2-3.2-.4-3.2-.4s1.2.7 3.2.7c2.7 0 4.6-.9 4.6-.9s-1.5.5-4.6.6zm6.3-3.6c.7 1.3-.2 2.6-.2 2.6s1.1-.9.7-2.3c-.4-1.4-2.1-2.2-2.1-2.2s1.1.8 1.6 1.9zm-4.7-6.5s-1.5 1.5 0 3.8c1.8 2.7 1 4.2 1 4.2s.5-1.1-.5-2.8c-1-1.6-.5-3-.5-3.2 0 0-2.3 1.2 0-2z"
        fill="#ED8B00"
      />
    ),
  },
  cpp: {
    color: '#00599C',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c1.4 0 2.6.6 3.4 1.6l-1.4 1.4c-.5-.6-1.2-1-2-1-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5c.8 0 1.5-.4 2-1l1.4 1.4c-.8 1-2 1.6-3.4 1.6zm6-4h-1v1h-1v-1h-1v-1h1v-1h1v1h1v1zm3 0h-1v1h-1v-1h-1v-1h1v-1h1v1h1v1z"
        fill="#00599C"
      />
    ),
  },
  rust: {
    color: '#DEA584',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.2c1.9 0 3.6.7 4.9 1.9l-1.6 1.6c-.9-.8-2.1-1.3-3.3-1.3-2.8 0-5.1 2.3-5.1 5.1s2.3 5.1 5.1 5.1c1.2 0 2.4-.5 3.3-1.3l1.6 1.6c-1.3 1.2-3 1.9-4.9 1.9-3.9 0-7.1-3.2-7.1-7.1S8.1 5.2 12 5.2z"
        fill="#DEA584"
      />
    ),
  },
  supabase: {
    color: '#3ECF8E',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M13.4 2.1c-.6-.7-1.7-.3-1.8.6L10.3 11H3.6c-.9 0-1.4 1.1-.8 1.8l9.8 11.2c.6.7 1.7.3 1.8-.6l1.3-8.3h6.7c.9 0 1.4-1.1.8-1.8L13.4 2.1z"
        fill="#3ECF8E"
      />
    ),
  },
  openai: {
    color: '#10A37F',
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.44a4.47 4.47 0 0 1-2.876-1.04l.141-.08 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.493z"
        fill="#10A37F"
      />
    ),
  },
}

export function normalizeTechName(name: string): string {
  const s = name.toLowerCase().trim()
  if (s.includes('react native')) return 'react'
  if (s.includes('react')) return 'react'
  if (s.includes('typescript') || s === 'ts') return 'typescript'
  if (s.includes('javascript') || s === 'js') return 'javascript'
  if (s.includes('next') || s.includes('nextjs') || s.includes('next.js')) return 'nextjs'
  if (s.includes('node') || s.includes('express') || s.includes('nest')) return 'nodejs'
  if (s.includes('python') || s.includes('django') || s.includes('flask') || s.includes('fastapi')) return 'python'
  if (s.includes('postgres') || s.includes('psql') || s.includes('sql')) return 'postgresql'
  if (s.includes('mongo')) return 'mongodb'
  if (s.includes('docker') || s.includes('container')) return 'docker'
  if (s.includes('k8s') || s.includes('kubernetes')) return 'kubernetes'
  if (s.includes('aws') || s.includes('amazon') || s.includes('s3') || s.includes('ec2') || s.includes('lambda')) return 'aws'
  if (s.includes('tailwind')) return 'tailwind'
  if (s.includes('graphql')) return 'graphql'
  if (s.includes('redis')) return 'redis'
  if (s.includes('golang') || s === 'go') return 'golang'
  if (s.includes('git') || s.includes('github') || s.includes('gitlab')) return 'git'
  if (s.includes('html')) return 'html5'
  if (s.includes('css') || s.includes('sass') || s.includes('scss')) return 'css3'
  if (s.includes('vue')) return 'vue'
  if (s.includes('angular')) return 'angular'
  if (s.includes('java') && !s.includes('javascript')) return 'java'
  if (s.includes('c++') || s.includes('cpp')) return 'cpp'
  if (s.includes('rust')) return 'rust'
  if (s.includes('supabase')) return 'supabase'
  if (s.includes('openai') || s.includes('llm') || s.includes('gpt') || s.includes('gemini') || s.includes('ai')) return 'openai'
  return ''
}

export function TechIcon({
  name,
  size = 16,
  className = '',
  useOriginalColor = true,
  ...rest
}: TechIconProps) {
  const normalized = normalizeTechName(name)
  const definition = TECH_DEFINITIONS[normalized]

  if (!definition) {
    // Elegant fallback code tag icon
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...rest}
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={definition.viewBox}
      className={`shrink-0 inline-block align-middle ${className}`}
      style={useOriginalColor ? { color: definition.color } : undefined}
      {...rest}
    >
      {definition.path}
    </svg>
  )
}
