import ContactHero from "./ContactHero";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";
import ContactMap from "./ContactMap";

const Contact = () => {
  return (
    <main className="min-h-screen bg-white">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactMap />
    </main>
  );
};

export default Contact;