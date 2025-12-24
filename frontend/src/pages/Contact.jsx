import ContactHero from '../components/Contact/ContactHero';
import ContactForm from '../components/Contact/ContactForm';
import FAQSection from '../components/Contact/FAQSection';
import MapLocation from '../components/Contact/MapLocation';

const Contact = () => {
  return (
    <div>
      <ContactHero />
      <ContactForm />
      <FAQSection />
      <MapLocation />
    </div>
  );
};

export default Contact;