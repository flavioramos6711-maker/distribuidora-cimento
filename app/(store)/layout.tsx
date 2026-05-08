import StoreHeader from "@/components/store/header"
import StoreFooter from "@/components/store/footer"
import WhatsAppChat from "@/components/store/whatsapp-chat"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader />
      <main className="min-h-0 flex-1 min-w-0 bg-muted/20 pb-[env(safe-area-inset-bottom,0px)] max-lg:pt-[8.2rem] lg:pt-0 overflow-x-hidden">
        {children}
      </main>
      <StoreFooter />
      <WhatsAppChat />
    </div>
  )
}
