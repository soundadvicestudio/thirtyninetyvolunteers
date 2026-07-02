type Props = {
  text: string
}

export default function AnnouncementBanner({ text }: Props) {
  return (
    <div className="w-full bg-orange py-3 px-4">
      <p className="text-white font-semibold text-center">{text}</p>
    </div>
  )
}
