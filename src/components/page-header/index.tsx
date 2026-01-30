'use client'

interface PageHeaderProps {
  title: string
  subtitle: string
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="text-center pt-20">
      <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-white/50 text-sm">
        {subtitle}
      </p>
    </div>
  )
}

export default PageHeader
