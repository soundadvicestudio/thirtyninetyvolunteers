type Props = {
  text: string
}

export default function AnnouncementBanner({ text }: Props) {
  return (
    <div className="w-full bg-navy py-3 px-4">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <span className="block w-1 h-5 rounded-full bg-orange flex-shrink-0" />
        <p className="text-white text-sm font-semibold leading-snug text-center flex-1">
          {text}
        </p>
      </div>
    </div>
  )
}
