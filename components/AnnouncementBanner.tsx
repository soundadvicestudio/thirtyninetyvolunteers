type Props = {
  text: string
}

export default function AnnouncementBanner({ text }: Props) {
  return (
    <div className="w-full bg-brand-accent py-3 px-4">
      <p className="text-white font-semibold text-center">{text}</p>
    </div>
  )
}
