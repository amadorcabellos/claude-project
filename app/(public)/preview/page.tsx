// preview page for newly created UI components

// components
import Avatar from "@/components/Avatar"
import Skeleton from "@/components/Skeleton"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>

      <section className="mt-8">
        <h3 className="mb-4">Avatar</h3>
        <div className="flex gap-4">
          {["amador", "Ghost", "SneakyFox", "TheBigBoss"].map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="mb-4">Skeleton</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
