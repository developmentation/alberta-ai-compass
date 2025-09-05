import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chat as ChatComponent } from "@/components/Chat";

const Chat = () => {
  return (
    <div className="h-[calc(100vh-100px)] bg-background text-foreground">
      <Header onLoginClick={() => {}} />
      
   

      <div className="relative z-10">
        {/* Hero Section */}
 
        {/* Chat Component */}
        <section className=" border-t border-border/50">
          <div className="max-w-full mx-auto  sm:px-6 lg:px-8">
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              <ChatComponent />
            </div>
          </div>
        </section>
      </div>
      
      {/* <Footer /> */}
    </div>
  );
};

export default Chat;

