import { Instagram, Twitter, Facebook, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-mashiro text-momo/80 py-12 border-t border-sakura relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-serif text-2xl font-bold text-momo tracking-widest mb-4 block uppercase">Reshmi Verma</span>
            <p className="text-momo/70 max-w-md mb-6 font-light">
              Functional Nutrition. Redefined.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/fitwithreshmii" target="_blank" rel="noopener noreferrer" className="text-momo/70 hover:text-momo transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-momo/70 hover:text-momo transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-momo tracking-widest uppercase mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm font-light">
              <li><a href="/#ai-lab" className="hover:text-momo transition-colors">AI Lab</a></li>
              <li><a href="/#services" className="hover:text-momo transition-colors">Services</a></li>
              <li><a href="/blog" className="hover:text-momo transition-colors">Nutrition Guide</a></li>
              <li><Link to="/login" className="hover:text-momo transition-colors">Client Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-momo tracking-widest uppercase mb-4">Contact</h3>
            <ul className="space-y-3 text-sm font-light">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-momo" />
                <a href="tel:+91XXXXXXXXXX" className="hover:text-momo transition-colors">
                  +91-XXXXX-XXXXX
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-momo" />
                <a href="mailto:Reshmi.verma@gmail.com" className="hover:text-momo transition-colors">
                  Reshmi.verma@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-sakura text-xs text-momo/60 flex flex-col md:flex-row justify-between items-center tracking-widest uppercase">
          <p>&copy; {new Date().getFullYear()} Reshmi Verma. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-momo transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-momo transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
